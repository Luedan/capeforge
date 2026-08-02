"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { generateRecoveryCodes, hashRecoveryCode, recoveryCodeRows } from "@/lib/recovery-codes";

export type AuthState = { error?: string; fieldErrors?: Record<string, string[]>; recoveryCodes?: string[]; registered?: boolean } | undefined;

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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function fields(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function registerAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (await getCurrentUser()) return { error: "Ya tienes una sesión activa. Vuelve a tu panel." };
  const parsed = registerSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { displayName, username, password } = parsed.data;
  const passwordHash = await hash(password, 12);
  const recoveryCodes = generateRecoveryCodes();

  let user: { id: string };
  try {
    user = await db.$transaction(async (tx) => {
      const userCount = await tx.user.count();
      const created = await tx.user.create({
        data: {
          displayName,
          username,
          passwordHash,
          role: userCount === 0 ? "ADMIN" : "USER",
          recoveryCodes: { create: recoveryCodeRows(recoveryCodes) },
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
  return { registered: true, recoveryCodes };
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

const resetSchema = z.object({
  username: usernameSchema,
  recoveryCode: z.string().trim().min(1, "Escribe uno de tus códigos de recuperación"),
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
  if (!user || !user.isActive) return { error: "El usuario o el código de recuperación no son válidos." };
  if (user.recoveryLockedUntil && user.recoveryLockedUntil > new Date()) {
    return { error: "Demasiados intentos. Espera 15 minutos antes de volver a intentar." };
  }

  const recoveryCode = await db.recoveryCode.findFirst({
    where: { userId: user.id, codeHash: hashRecoveryCode(parsed.data.recoveryCode), usedAt: null },
    select: { id: true },
  });
  if (!recoveryCode) {
    const attempts = user.recoveryFailedAttempts + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        recoveryFailedAttempts: attempts >= 5 ? 0 : attempts,
        recoveryLockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });
    return { error: "El usuario o el código de recuperación no son válidos." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const consumed = await db.$transaction(async (tx) => {
    const result = await tx.recoveryCode.updateMany({ where: { id: recoveryCode.id, usedAt: null }, data: { usedAt: new Date() } });
    if (result.count !== 1) return false;
    await tx.user.update({ where: { id: user.id }, data: { passwordHash, recoveryFailedAttempts: 0, recoveryLockedUntil: null } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    return true;
  });
  if (!consumed) return { error: "Ese código ya fue utilizado. Prueba con otro." };

  await createSession(user.id);
  redirect("/app");
}
