"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function toggleTaskAction(taskId: string, completed: boolean) {
  const user = await requireUser();
  const id = z.string().min(1).parse(taskId);
  const requirement = await db.capeRequirement.findFirst({
    where: { taskId: id, cape: { slug: "completionist", isAvailable: true } },
    select: { taskId: true },
  });
  if (!requirement) throw new Error("Tarea no autorizada");

  if (completed) {
    await db.taskProgress.upsert({
      where: { userId_taskId: { userId: user.id, taskId: id } },
      create: { userId: user.id, taskId: id },
      update: { completedAt: new Date() },
    });
  } else {
    await db.taskProgress.deleteMany({ where: { userId: user.id, taskId: id } });
  }

  revalidatePath("/app");
  revalidatePath("/app/comp");
  return { success: true };
}
