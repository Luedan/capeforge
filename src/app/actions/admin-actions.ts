"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateRecoveryCodes, recoveryCodeRows } from "@/lib/recovery-codes";

export async function setUserActiveAction(userId: string, isActive: boolean) {
  const admin = await requireAdmin();
  const id = z.string().min(1).parse(userId);
  if (id === admin.id) throw new Error("No puedes desactivar tu propia cuenta");
  await db.user.update({ where: { id }, data: { isActive } });
  if (!isActive) await db.session.deleteMany({ where: { userId: id } });
  revalidatePath("/admin");
}

export async function setUserRoleAction(userId: string, role: "ADMIN" | "USER") {
  const admin = await requireAdmin();
  const id = z.string().min(1).parse(userId);
  const safeRole = z.enum(["ADMIN", "USER"]).parse(role);
  if (id === admin.id && safeRole === "USER") throw new Error("No puedes quitarte tu propio rol");

  if (safeRole === "USER") {
    const activeAdmins = await db.user.count({ where: { role: "ADMIN", isActive: true } });
    const target = await db.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
    if (target?.role === "ADMIN" && target.isActive && activeAdmins <= 1) throw new Error("Debe quedar al menos un administrador");
  }

  await db.user.update({ where: { id }, data: { role: safeRole } });
  revalidatePath("/admin");
}

export async function regenerateUserRecoveryCodesAction(userId: string) {
  await requireAdmin();
  const id = z.string().min(1).parse(userId);
  const target = await db.user.findUnique({ where: { id }, select: { id: true, isActive: true } });
  if (!target) throw new Error("El usuario no existe");
  if (!target.isActive) throw new Error("Activa la cuenta antes de generar códigos");

  const codes = generateRecoveryCodes();
  await db.$transaction(async (tx) => {
    await tx.recoveryCode.deleteMany({ where: { userId: id } });
    await tx.recoveryCode.createMany({ data: recoveryCodeRows(codes).map((code) => ({ ...code, userId: id })) });
    await tx.user.update({ where: { id }, data: { recoveryFailedAttempts: 0, recoveryLockedUntil: null } });
  });
  revalidatePath("/admin");
  return { codes };
}
