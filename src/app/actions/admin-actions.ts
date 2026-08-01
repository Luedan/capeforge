"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

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
