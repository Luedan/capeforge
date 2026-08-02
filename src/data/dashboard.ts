import "server-only";

import { db } from "@/lib/db";

export async function getCapeOverview(userId: string) {
  const capes = await db.cape.findMany({ orderBy: { sortOrder: "asc" } });
  return Promise.all(
    capes.map(async (cape) => {
      const [total, completed] = await Promise.all([
        db.capeRequirement.count({ where: { capeId: cape.id } }),
        db.taskProgress.count({
          where: { userId, task: { requirements: { some: { capeId: cape.id } } } },
        }),
      ]);
      return { ...cape, total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
    }),
  );
}

export type TaskFilters = {
  q?: string;
  category?: string;
  status?: "all" | "completed" | "pending";
  page?: number;
};

export async function getCapeDashboard(userId: string, capeSlug: string, filters: TaskFilters) {
  const cape = await db.cape.findFirst({
    where: { slug: capeSlug, isAvailable: true },
    select: { id: true, slug: true, name: true, shortName: true, description: true },
  });
  if (!cape) return null;
  const pageSize = 20;
  const page = Math.max(1, filters.page ?? 1);
  const status = filters.status ?? "all";
  const search = filters.q?.trim();

  const where = {
    requirements: { some: { capeId: cape.id } },
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(status === "completed" ? { progress: { some: { userId } } } : {}),
    ...(status === "pending" ? { progress: { none: { userId } } } : {}),
  };

  const [tasks, filteredTotal, total, completed, categoryRows, recentlyCompleted] = await Promise.all([
    db.task.findMany({
      where,
      orderBy: [{ compOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
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
        progress: { where: { userId }, select: { completedAt: true }, take: 1 },
      },
    }),
    db.task.count({ where }),
    db.capeRequirement.count({ where: { capeId: cape.id } }),
    db.taskProgress.count({ where: { userId, task: { requirements: { some: { capeId: cape.id } } } } }),
    db.task.findMany({
      where: { requirements: { some: { capeId: cape.id } }, category: { not: null } },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    db.taskProgress.findMany({
      where: { userId, task: { requirements: { some: { capeId: cape.id } } } },
      orderBy: { completedAt: "desc" },
      take: 3,
      select: { completedAt: true, task: { select: { name: true } } },
    }),
  ]);

  return {
    cape,
    tasks: tasks.map((task) => ({ ...task, completedAt: task.progress[0]?.completedAt ?? null, progress: undefined })),
    filteredTotal,
    total,
    completed,
    pending: total - completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
    categories: categoryRows.map((row) => row.category).filter((value): value is string => Boolean(value)),
    recentlyCompleted,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filteredTotal / pageSize)),
  };
}

export async function getAdminDashboard() {
  const [users, totalComp] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { progress: true, recoveryCodes: { where: { usedAt: null } } } },
      },
    }),
    db.capeRequirement.count({ where: { cape: { slug: "completionist" } } }),
  ]);

  return {
    users,
    totalComp,
    activeUsers: users.filter((user) => user.isActive).length,
    admins: users.filter((user) => user.role === "ADMIN").length,
  };
}
