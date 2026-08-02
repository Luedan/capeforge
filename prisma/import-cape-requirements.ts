import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

type Requirement = { target: string; label: string };
type ExistingTask = { id: string; name: string; wikiUrl: string | null };

const CAPES = [
  {
    slug: "master-quest",
    page: "Master Quest Cape (achievement)",
    name: "Master Quest Cape",
    shortName: "MQC",
    description: "Historias, secretos, misiones y cada rincón del lore de RuneScape.",
    minimumDirect: 250,
    sortOrder: 3,
  },
  {
    slug: "trimmed-completionist",
    page: "Trimmed Completionist Cape (achievement)",
    name: "Trimmed Completionist Cape",
    shortName: "Trimmed",
    description: "La ruta definitiva que reúne Completionist, MQC y los logros más exigentes de Gielinor.",
    minimumDirect: 70,
    sortOrder: 2,
  },
] as const;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const apply = process.argv.includes("--apply");

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/&/g, "and")
    .replace(/\(achievement\)$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function pageNameFromUrl(url: string | null) {
  if (!url) return "";
  try { return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "").replace(/_/g, " "); }
  catch { return ""; }
}

async function fetchWikitext(page: string) {
  const url = `https://runescape.wiki/api.php?action=parse&prop=wikitext&format=json&page=${encodeURIComponent(page)}`;
  const response = await fetch(url, { headers: { "User-Agent": "CapeForge/1.0 achievement importer" } });
  if (!response.ok) throw new Error(`RuneScape Wiki returned ${response.status} for ${page}`);
  const data = await response.json() as { parse?: { title: string; wikitext: { "*": string } }; error?: { info: string } };
  if (!data.parse) throw new Error(data.error?.info ?? `Could not parse ${page}`);
  return { title: data.parse.title, text: data.parse.wikitext["*"] };
}

function parseRequirements(wikitext: string) {
  const lines = wikitext.split(/\r?\n/);
  const start = lines.findIndex((line) => /^\|requirements\s*=/.test(line));
  if (start < 0) throw new Error("Requirements field not found");
  const requirements: Requirement[] = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("*")) break;
    const match = line.match(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/);
    if (match) requirements.push({ target: match[1].split("#")[0].trim(), label: (match[2] ?? match[1]).trim() });
  }
  return requirements;
}

function stripWikiMarkup(value: string) {
  return value
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function field(wikitext: string, name: string) {
  return wikitext.match(new RegExp(`^\\|${name}\\s*=\\s*(.+)$`, "mi"))?.[1]?.trim() ?? null;
}

function buildTaskIndex(tasks: ExistingTask[]) {
  const index = new Map<string, ExistingTask[]>();
  for (const task of tasks) {
    for (const key of new Set([normalize(task.name), normalize(pageNameFromUrl(task.wikiUrl))])) {
      if (!key) continue;
      index.set(key, [...(index.get(key) ?? []), task]);
    }
  }
  return index;
}

function matchTask(requirement: Requirement, index: Map<string, ExistingTask[]>) {
  const candidates = [...(index.get(normalize(requirement.label)) ?? []), ...(index.get(normalize(requirement.target)) ?? [])];
  return [...new Map(candidates.map((task) => [task.id, task])).values()][0] ?? null;
}

async function createMissingTask(requirement: Requirement) {
  const page = await fetchWikitext(requirement.target);
  const description = stripWikiMarkup(field(page.text, "description") ?? `Complete the ${requirement.label} achievement.`);
  const category = stripWikiMarkup(field(page.text, "maincategory") ?? field(page.text, "category") ?? "Completionist");
  const subcategory = field(page.text, "subcategory");
  const releaseDate = stripWikiMarkup(field(page.text, "release") ?? "") || null;
  const sourceKey = `wiki-achievement-${createHash("sha256").update(page.title).digest("hex").slice(0, 20)}`;
  return prisma.task.upsert({
    where: { sourceKey },
    create: {
      sourceKey,
      name: requirement.label,
      description,
      category,
      subcategory: subcategory && !/^(no|n\/a)$/i.test(subcategory) ? stripWikiMarkup(subcategory) : null,
      releaseDate,
      wikiUrl: `https://runescape.wiki/w/${encodeURIComponent(requirement.target.replace(/ /g, "_"))}`,
    },
    update: { name: requirement.label, description, wikiUrl: `https://runescape.wiki/w/${encodeURIComponent(requirement.target.replace(/ /g, "_"))}` },
    select: { id: true, name: true, wikiUrl: true },
  });
}

try {
  const existingTasks = await prisma.task.findMany({ select: { id: true, name: true, wikiUrl: true } });
  const index = buildTaskIndex(existingTasks);
  const resolved = new Map<string, { requirements: Requirement[]; taskIds: string[]; missing: Requirement[] }>();

  for (const cape of CAPES) {
    const source = await fetchWikitext(cape.page);
    const requirements = parseRequirements(source.text);
    if (requirements.length < cape.minimumDirect) throw new Error(`${cape.name}: only ${requirements.length} requirements were parsed; expected at least ${cape.minimumDirect}`);
    const taskIds: string[] = [];
    const missing: Requirement[] = [];
    for (const requirement of requirements) {
      const task = matchTask(requirement, index);
      if (task) taskIds.push(task.id);
      else missing.push(requirement);
    }
    resolved.set(cape.slug, { requirements, taskIds, missing });
    console.log(`${cape.shortName}: ${requirements.length} direct requirements, ${taskIds.length} matched, ${missing.length} missing`);
    if (missing.length) console.log(`  Missing: ${missing.map((item) => item.label).join(" | ")}`);
  }

  if (!apply) {
    console.log("Dry run complete. Run with --apply to create missing tasks and enable both capes.");
    process.exitCode = resolved.size === CAPES.length ? 0 : 1;
  } else {
    for (const cape of CAPES) {
      const entry = resolved.get(cape.slug)!;
      for (const requirement of entry.missing) {
        await createMissingTask(requirement);
      }
    }

    const refreshedIndex = buildTaskIndex(await prisma.task.findMany({ select: { id: true, name: true, wikiUrl: true } }));
    for (const entry of resolved.values()) {
      entry.taskIds = entry.requirements.map((requirement) => {
        const task = matchTask(requirement, refreshedIndex);
        if (!task) throw new Error(`Could not resolve ${requirement.label} after import`);
        return task.id;
      });
    }

    const compCape = await prisma.cape.findUniqueOrThrow({ where: { slug: "completionist" }, select: { id: true } });
    const compIds = (await prisma.capeRequirement.findMany({ where: { capeId: compCape.id }, select: { taskId: true } })).map((item) => item.taskId);
    const mqcEntry = resolved.get("master-quest")!;
    const trimEntry = resolved.get("trimmed-completionist")!;
    const trimmedMetaNames = new Set([normalize("Completionist Cape"), normalize("Master Quest Cape")]);
    const trimmedDirectIds = trimEntry.requirements
      .map((requirement, indexPosition) => ({ requirement, taskId: trimEntry.taskIds[indexPosition] }))
      .filter((item) => item.taskId && !trimmedMetaNames.has(normalize(item.requirement.label)))
      .map((item) => item.taskId);

    for (const cape of CAPES) {
      const record = await prisma.cape.upsert({
        where: { slug: cape.slug },
        create: { slug: cape.slug, name: cape.name, shortName: cape.shortName, description: cape.description, isAvailable: true, sortOrder: cape.sortOrder },
        update: { name: cape.name, shortName: cape.shortName, description: cape.description, isAvailable: true, sortOrder: cape.sortOrder },
        select: { id: true },
      });
      const ids = cape.slug === "trimmed-completionist"
        ? [...new Set([...compIds, ...mqcEntry.taskIds, ...trimmedDirectIds])]
        : [...new Set(mqcEntry.taskIds)];
      await prisma.$transaction(async (tx) => {
        await tx.capeRequirement.deleteMany({ where: { capeId: record.id } });
        await tx.capeRequirement.createMany({ data: ids.map((taskId, sortOrder) => ({ capeId: record.id, taskId, sortOrder })) });
      });
      console.log(`${cape.shortName}: enabled with ${ids.length} actionable requirements`);
    }
  }
} finally {
  await prisma.$disconnect();
}
