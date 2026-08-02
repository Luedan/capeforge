import "dotenv/config";
import fs from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

type TaskSeed = {
  sourceKey: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  subsubcategory: string | null;
  releaseDate: string | null;
  wikiUrl: string | null;
  isComp: boolean;
  compOrder: number | null;
  compPriority: string | null;
  compDifficulty: string | null;
  compTimeType: string | null;
  compInstructions: string | null;
  initialCompleted: boolean;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const raw = await fs.readFile(new URL("./data/tasks.json", import.meta.url), "utf8");
const tasks = JSON.parse(raw) as TaskSeed[];

const capes = [
  {
    slug: "completionist",
    name: "Completionist Cape",
    shortName: "Comp",
    description: "El recorrido esencial para demostrar que dominas Gielinor.",
    isAvailable: true,
    sortOrder: 1,
  },
  {
    slug: "trimmed-completionist",
    name: "Trimmed Completionist Cape",
    shortName: "Trimmed",
    description: "La ruta definitiva para quienes quieren ir más allá del final.",
    isAvailable: false,
    sortOrder: 2,
  },
  {
    slug: "master-quest",
    name: "Master Quest Cape",
    shortName: "MQC",
    description: "Historias, secretos y cada rincón del lore de RuneScape.",
    isAvailable: false,
    sortOrder: 3,
  },
];

for (const cape of capes) {
  await prisma.cape.upsert({
    where: { slug: cape.slug },
    create: cape,
    update: {
      name: cape.name,
      shortName: cape.shortName,
      description: cape.description,
      sortOrder: cape.sortOrder,
    },
  });
}

for (let offset = 0; offset < tasks.length; offset += 400) {
  const batch = tasks.slice(offset, offset + 400).map(({ isComp, ...task }) => {
    void isComp;
    return task;
  });
  await prisma.task.createMany({ data: batch, skipDuplicates: true });
}

const compCape = await prisma.cape.findUniqueOrThrow({ where: { slug: "completionist" } });
const compTasks = await prisma.task.findMany({
  where: { compOrder: { not: null } },
  select: { id: true, compOrder: true },
});

await prisma.capeRequirement.deleteMany({ where: { capeId: compCape.id } });
await prisma.capeRequirement.createMany({
  data: compTasks.map((task) => ({
    capeId: compCape.id,
    taskId: task.id,
    sortOrder: task.compOrder ?? 0,
  })),
});

console.log(`Seeded ${tasks.length} achievements and ${compTasks.length} Comp requirements.`);
await prisma.$disconnect();
