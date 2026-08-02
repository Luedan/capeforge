import "server-only";

import { db } from "@/lib/db";

export const RECOMMENDATION_FOCUS = ["BALANCED", "TIME_GATED", "QUICK_WINS", "GRIND", "COMBAT"] as const;
export type RecommendationFocus = (typeof RECOMMENDATION_FOCUS)[number];

type Cadence = "DAILY" | "WEEKLY" | "REPEATED" | "NONE";

function normalized(value: string | null | undefined) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function estimateMinutes(task: { compTimeType: string | null; compDifficulty: string | null }) {
  const time = normalized(task.compTimeType);
  if (time.includes("inmediato")) return 15;
  if (time.includes("time-gated")) return 20;
  if (time.includes("grind corto")) return 45;
  if (time.includes("grind largo")) return 120;
  if (time.includes("combate")) return 60;
  if (time.includes("misiones")) return 90;
  if (time.includes("por niveles")) return 90;
  const difficulty = normalized(task.compDifficulty);
  if (difficulty.includes("facil")) return 30;
  if (difficulty.includes("media")) return 60;
  return 90;
}

function cadenceFor(task: { description: string | null; compInstructions: string | null; compTimeType: string | null }) {
  const text = normalized(`${task.description ?? ""} ${task.compInstructions ?? ""}`);
  if (/semanal|cada semana|weekly/.test(text)) return "WEEKLY" as const;
  if (/diari[oa]|cada dia|todos los dias|daily/.test(text)) return "DAILY" as const;
  if (normalized(task.compTimeType).includes("time-gated")) return "REPEATED" as const;
  return "NONE" as const;
}

function stableDailyBoost(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 18;
}

function focusLabel(focus: RecommendationFocus) {
  return {
    BALANCED: "una ruta equilibrada",
    TIME_GATED: "desbloquear progreso con espera",
    QUICK_WINS: "sumar victorias rápidas",
    GRIND: "avanzar farmeos largos",
    COMBAT: "priorizar combate",
  }[focus];
}

export async function getSmartRecommendations(userId: string) {
  const now = new Date();
  const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", dateStyle: "short" }).format(now);

  const [user, tasks, recentProgress] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { sessionMinutes: true, recommendationFocus: true },
    }),
    db.task.findMany({
      where: {
        requirements: { some: { cape: { slug: "completionist", isAvailable: true } } },
        progress: { none: { userId } },
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        subcategory: true,
        subsubcategory: true,
        releaseDate: true,
        wikiUrl: true,
        compPriority: true,
        compDifficulty: true,
        compTimeType: true,
        compInstructions: true,
        recommendationStates: {
          where: { userId },
          select: { pinned: true, snoozedUntil: true },
          take: 1,
        },
      },
    }),
    db.taskProgress.findMany({
      where: { userId, task: { requirements: { some: { cape: { slug: "completionist" } } } } },
      orderBy: { completedAt: "desc" },
      take: 8,
      select: { task: { select: { category: true } } },
    }),
  ]);

  const focus = RECOMMENDATION_FOCUS.includes(user.recommendationFocus as RecommendationFocus)
    ? (user.recommendationFocus as RecommendationFocus)
    : "BALANCED";
  const recentCategories = recentProgress.map((item) => item.task.category).filter(Boolean);
  const snoozedCount = tasks.filter((task) => task.recommendationStates[0]?.snoozedUntil && task.recommendationStates[0].snoozedUntil! > now).length;

  const candidates = tasks
    .filter((task) => !task.recommendationStates[0]?.snoozedUntil || task.recommendationStates[0].snoozedUntil! <= now)
    .map((task) => {
      const minutes = estimateMinutes(task);
      const cadence = cadenceFor(task);
      const timeType = normalized(task.compTimeType);
      const category = normalized(task.category);
      const isTimeGated = timeType.includes("time-gated") || cadence !== "NONE" || task.compPriority?.startsWith("01.");
      const isQuick = timeType.includes("inmediato") || minutes <= 30;
      const isGrind = timeType.includes("grind");
      const isCombat = timeType.includes("combate") || category.includes("combat");
      const pinned = task.recommendationStates[0]?.pinned ?? false;
      const reasons: string[] = [];
      let score = 50 + stableDailyBoost(`${userId}:${task.id}:${dayKey}`);

      if (pinned) { score += 1000; reasons.push("La fijaste como prioridad"); }
      if (isTimeGated) { score += 75; reasons.push(cadence === "DAILY" ? "Rutina diaria detectada" : cadence === "WEEKLY" ? "Rutina semanal detectada" : "Conviene avanzar la espera cuanto antes"); }
      if (minutes <= user.sessionMinutes) { score += 35; reasons.push(`Cabe en tu sesión de ${user.sessionMinutes} min`); }
      else score -= Math.min(55, Math.round((minutes - user.sessionMinutes) / 2));
      if (isQuick) score += user.sessionMinutes <= 30 ? 60 : 18;
      if (isGrind && user.sessionMinutes < 60) score -= 35;
      if (recentCategories.includes(task.category)) score -= 10;

      if (focus === "TIME_GATED" && isTimeGated) { score += 120; reasons.unshift("Coincide con tu foco time-gated"); }
      if (focus === "QUICK_WINS" && isQuick) { score += 110; reasons.unshift("Es una victoria rápida"); }
      if (focus === "GRIND" && isGrind) { score += 110; reasons.unshift("Aprovecha tu bloque de farmeo"); }
      if (focus === "COMBAT" && isCombat) { score += 110; reasons.unshift("Coincide con tu foco de combate"); }
      if (focus === "BALANCED" && !recentCategories.includes(task.category)) reasons.push("Añade variedad a tu progreso");

      return {
        ...task,
        recommendationStates: undefined,
        minutes,
        cadence: cadence as Cadence,
        pinned,
        isTimeGated,
        isQuick,
        isGrind,
        isCombat,
        score,
        reasons: [...new Set(reasons)].slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score);

  const dailyPlan: typeof candidates = [];
  const seenCategories = new Set<string>();
  for (const task of candidates) {
    const categoryKey = task.category ?? "General";
    if (task.pinned || !seenCategories.has(categoryKey) || dailyPlan.length >= 3) {
      dailyPlan.push(task);
      seenCategories.add(categoryKey);
    }
    if (dailyPlan.length === 4) break;
  }

  const timeGated = candidates.filter((task) => task.isTimeGated).slice(0, 6);
  const quickWins = candidates.filter((task) => task.isQuick).slice(0, 4);
  const grinds = candidates.filter((task) => task.isGrind).slice(0, 4);

  return {
    settings: { sessionMinutes: user.sessionMinutes, focus, focusLabel: focusLabel(focus) },
    dailyPlan,
    timeGated,
    quickWins,
    grinds,
    stats: {
      pending: tasks.length,
      rituals: candidates.filter((task) => task.isTimeGated).length,
      quickWins: candidates.filter((task) => task.isQuick).length,
      longGrinds: candidates.filter((task) => task.isGrind).length,
      snoozed: snoozedCount,
      plannedMinutes: dailyPlan.reduce((sum, task) => sum + Math.min(task.minutes, 30), 0),
    },
  };
}

export type SmartTask = Awaited<ReturnType<typeof getSmartRecommendations>>["dailyPlan"][number];
