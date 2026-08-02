"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RECOMMENDATION_FOCUS } from "@/data/recommendations";

const taskIdSchema = z.string().min(1);

async function resolveTarget(value: string) {
  if (value === "all") return null;
  const cape = await db.cape.findFirst({
    where: { isAvailable: true, OR: [{ id: value }, { slug: value }] },
    select: { id: true },
  });
  if (!cape) throw new Error("Ese objetivo todavía no está disponible");
  return cape.id;
}

async function assertTaskInCurrentGoal(userId: string, taskId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { recommendationCapeId: true } });
  const task = await db.task.findFirst({
    where: { id: taskId, ...(user.recommendationCapeId ? { requirements: { some: { capeId: user.recommendationCapeId } } } : {}) },
    select: { id: true },
  });
  if (!task) throw new Error("La tarea no pertenece a tu objetivo inteligente actual");
}

export async function updateRecommendationSettingsAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({
    sessionMinutes: z.coerce.number().refine((value) => [15, 30, 45, 60, 90, 120].includes(value)),
    focus: z.enum(RECOMMENDATION_FOCUS),
    target: z.string().min(1),
  }).parse({
    sessionMinutes: formData.get("sessionMinutes"),
    focus: formData.get("focus"),
    target: formData.get("target"),
  });
  const recommendationCapeId = await resolveTarget(parsed.target);

  await db.user.update({
    where: { id: user.id },
    data: { sessionMinutes: parsed.sessionMinutes, recommendationFocus: parsed.focus, recommendationCapeId },
  });
  revalidatePath("/app/hoy");
}

export async function selectRecommendationTargetAction(formData: FormData) {
  const user = await requireUser();
  const target = z.string().min(1).parse(formData.get("target"));
  const recommendationCapeId = await resolveTarget(target);
  await db.user.update({ where: { id: user.id }, data: { recommendationCapeId } });
  revalidatePath("/app/hoy");
  redirect("/app/hoy");
}

export async function setTaskPinnedAction(taskId: string, pinned: boolean) {
  const user = await requireUser();
  const id = taskIdSchema.parse(taskId);
  await assertTaskInCurrentGoal(user.id, id);
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
  await assertTaskInCurrentGoal(user.id, id);
  await db.taskRecommendationState.upsert({
    where: { userId_taskId: { userId: user.id, taskId: id } },
    create: { userId: user.id, taskId: id, snoozedUntil: safeDays ? new Date(Date.now() + safeDays * 86400000) : null },
    update: { snoozedUntil: safeDays ? new Date(Date.now() + safeDays * 86400000) : null },
  });
  revalidatePath("/app/hoy");
}
