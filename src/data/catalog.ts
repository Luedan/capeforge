import "server-only";

import { db } from "@/lib/db";

export type CatalogFilters = {
  q?: string;
  category?: string;
  scope?: "all" | "comp" | "catalog";
  sort?: "name" | "category" | "subcategory";
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function getTaskCatalog(userId: string, filters: CatalogFilters) {
  const pageSize = [25, 50, 100].includes(filters.pageSize ?? 50) ? (filters.pageSize ?? 50) : 50;
  const page = Math.max(1, filters.page ?? 1);
  const scope = filters.scope ?? "all";
  const sort = filters.sort ?? "name";
  const direction = filters.direction ?? "asc";
  const search = filters.q?.trim();

  const where = {
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { subcategory: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(scope === "comp" ? { requirements: { some: { cape: { slug: "completionist" } } } } : {}),
    ...(scope === "catalog" ? { requirements: { none: { cape: { slug: "completionist" } } } } : {}),
  };

  const [tasks, total, categories, compTotal] = await Promise.all([
    db.task.findMany({
      where,
      orderBy: [{ [sort]: direction }, { name: "asc" }],
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
        requirements: {
          select: { cape: { select: { slug: true, shortName: true } } },
        },
        progress: {
          where: { userId },
          select: { completedAt: true },
          take: 1,
        },
      },
    }),
    db.task.count({ where }),
    db.task.findMany({
      where: { category: { not: null } },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    db.capeRequirement.count({ where: { cape: { slug: "completionist" } } }),
  ]);

  return {
    rows: tasks.map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      category: task.category,
      subcategory: task.subcategory,
      subsubcategory: task.subsubcategory,
      releaseDate: task.releaseDate,
      wikiUrl: task.wikiUrl,
      compPriority: task.compPriority,
      compDifficulty: task.compDifficulty,
      compTimeType: task.compTimeType,
      compInstructions: task.compInstructions,
      capes: task.requirements.map((requirement) => requirement.cape),
      completedAt: task.progress[0]?.completedAt?.toISOString() ?? null,
    })),
    total,
    compTotal,
    categories: categories.map((item) => item.category).filter((value): value is string => Boolean(value)),
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    sort,
    direction,
  };
}

export type CatalogTask = Awaited<ReturnType<typeof getTaskCatalog>>["rows"][number];
