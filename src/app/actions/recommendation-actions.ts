"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RECOMMENDATION_FOCUS } from "@/data/recommendations";

const taskIdSchema = z.string().min(1);

async function assertCompTask(taskId: string) {
  const task = await db.capeRequirement.findFirst({
    where: { taskId, cape: { slug: "completionist", isAvailable: true } },
    select: { taskId: true },
  });
  if (!task) throw new Error("Tarea no autorizada");
}

export async function updateRecommendationSettingsAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({
    sessionMinutes: z.coerce.number().refine((value) => [15, 30, 45, 60, 90, 120].includes(value)),
    focus: z.enum(RECOMMENDATION_FOCUS),
  }).parse({
    sessionMinutes: formData.get("sessionMinutes"),
    focus: formData.get("focus"),
  });

  await db.user.update({
    where: { id: user.id },
    data: { sessionMinutes: parsed.sessionMinutes, recommendationFocus: parsed.focus },
  });
  revalidatePath("/app/hoy");
}

export async function setTaskPinnedAction(taskId: string, pinned: boolean) {
  const user = await requireUser();
  const id = taskIdSchema.parse(taskId);
  await assertCompTask(id);
  await db.taskRecommendationState.upsert({
    where: { userId_taskId: { userId: user.id, taskId: id } },
    create: { userId: user.id, taskId: id, pinned },
    update: { pinned },
  });
  revalidatePath("/app/hoy");
}

export async function snoozeTaskAction(taskId: string, days: number) {
  const user = await requireUser();
  const id = taskIdSchema.parse(taskId);
  const safeDays = z.number().int().refine((value) => [0, 1, 3, 7].includes(value)).parse(days);
  await assertCompTask(id);
  await db.taskRecommendationState.upsert({
    where: { userId_taskId: { userId: user.id, taskId: id } },
    create: { userId: user.id, taskId: id, snoozedUntil: safeDays ? new Date(Date.now() + safeDays * 86400000) : null },
    update: { snoozedUntil: safeDays ? new Date(Date.now() + safeDays * 86400000) : null },
  });
  revalidatePath("/app/hoy");
}
