"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { SECRET_QUESTIONS } from "@/lib/auth-constants";

export type AuthState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;
export type RecoveryLookupState = { error?: string; username?: string; question?: string } | undefined;

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Usa al menos 3 caracteres")
  .max(24, "Usa máximo 24 caracteres")
  .regex(/^[a-zA-Z0-9_-]+$/, "Solo letras, números, guion y guion bajo")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Usa al menos 8 caracteres")
  .regex(/[A-Za-z]/, "Incluye al menos una letra")
  .regex(/[0-9]/, "Incluye al menos un número");

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Escribe el nombre que verán tus amigos").max(40),
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    secretQuestion: z.enum(SECRET_QUESTIONS),
    secretAnswer: z.string().trim().min(3, "La respuesta debe tener al menos 3 caracteres").max(80),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function fields(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function registerAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { displayName, username, password, secretQuestion, secretAnswer } = parsed.data;
  const [passwordHash, secretAnswerHash] = await Promise.all([
    hash(password, 12),
    hash(secretAnswer.trim().toLowerCase(), 12),
  ]);

  let user: { id: string };
  try {
    user = await db.$transaction(async (tx) => {
      const userCount = await tx.user.count();
      const created = await tx.user.create({
        data: {
          displayName,
          username,
          passwordHash,
          secretQuestion,
          secretAnswerHash,
          role: userCount === 0 ? "ADMIN" : "USER",
        },
        select: { id: true },
      });

      if (userCount === 0) {
        const completed = await tx.task.findMany({
          where: { initialCompleted: true },
          select: { id: true },
        });
        if (completed.length) {
          await tx.taskProgress.createMany({
            data: completed.map((task) => ({ userId: created.id, taskId: task.id })),
          });
        }
      }

      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ese usuario ya existe. Prueba con otro nombre." };
    }
    return { error: "No pudimos crear la cuenta. Inténtalo nuevamente." };
  }

  await createSession(user.id);
  redirect("/app");
}

const loginSchema = z.object({ username: usernameSchema, password: z.string().min(1) });

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(fields(formData));
  if (!parsed.success) return { error: "Revisa tu usuario y contraseña." };

  const user = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return { error: "Usuario o contraseña incorrectos." };
  }
  if (!user.isActive) return { error: "Esta cuenta está desactivada. Habla con un administrador." };

  await createSession(user.id);
  redirect("/app");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function lookupRecoveryAction(_state: RecoveryLookupState, formData: FormData): Promise<RecoveryLookupState> {
  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) return { error: "Escribe un usuario válido." };

  const user = await db.user.findUnique({
    where: { username: parsed.data },
    select: { username: true, secretQuestion: true, isActive: true },
  });
  if (!user || !user.isActive) return { error: "No encontramos una cuenta activa con ese usuario." };
  return { username: user.username, question: user.secretQuestion };
}

const resetSchema = z.object({
  username: usernameSchema,
  secretAnswer: z.string().trim().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function resetPasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const user = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !user.isActive) return { error: "No pudimos recuperar esa cuenta." };
  if (user.recoveryLockedUntil && user.recoveryLockedUntil > new Date()) {
    return { error: "Demasiados intentos. Espera 15 minutos antes de volver a intentar." };
  }

  const answerOk = await compare(parsed.data.secretAnswer.trim().toLowerCase(), user.secretAnswerHash);
  if (!answerOk) {
    const attempts = user.recoveryFailedAttempts + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        recoveryFailedAttempts: attempts >= 5 ? 0 : attempts,
        recoveryLockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });
    return { error: "La respuesta secreta no coincide." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { passwordHash, recoveryFailedAttempts: 0, recoveryLockedUntil: null },
    }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);

  await createSession(user.id);
  redirect("/app");
}
