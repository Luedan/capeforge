import type { Metadata } from "next";
import { BookOpen, Crown, Database, Search, Sparkles } from "lucide-react";
import { TaskDataTable } from "@/components/task-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTaskCatalog, type CatalogFilters } from "@/data/catalog";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Todas las tareas" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = one(params.q) ?? "";
  const category = one(params.category) ?? "";
  const rawScope = one(params.scope);
  const scope: NonNullable<CatalogFilters["scope"]> = rawScope === "comp" || rawScope === "catalog" ? rawScope : "all";
  const rawSort = one(params.sort);
  const sort: NonNullable<CatalogFilters["sort"]> = rawSort === "category" || rawSort === "subcategory" ? rawSort : "name";
  const direction: NonNullable<CatalogFilters["direction"]> = one(params.direction) === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(one(params.page)) || 1);
  const pageSize = Number(one(params.pageSize)) || 50;
  const data = await getTaskCatalog(user.id, { q, category, scope, sort, direction, page, pageSize });

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-[#1b3022] via-[#121b16] to-[#12130f] p-6 sm:p-8">
        <div className="rune-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="eyebrow"><Database className="size-3.5" /> Archivo maestro de Gielinor</div>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Todas las tareas.<br /><span className="text-gold-light italic">Un solo catálogo.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">Explora el catálogo completo de RuneScape 3 y distingue fácilmente los requisitos de Completionist. Pulsa cualquier logro para leer su resumen y abrir su guía.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line bg-black/20 px-5 py-4 text-center"><Database className="mx-auto size-5 text-gold" /><strong className="mt-2 block font-display text-3xl">{data.total.toLocaleString("es-CO")}</strong><span className="text-[10px] uppercase tracking-[.14em] text-muted">en esta vista</span></div>
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.05] px-5 py-4 text-center"><Crown className="mx-auto size-5 text-emerald-300" /><strong className="mt-2 block font-display text-3xl">{data.compTotal.toLocaleString("es-CO")}</strong><span className="text-[10px] uppercase tracking-[.14em] text-muted">Completionist</span></div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-surface/65 p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div><span className="eyebrow"><BookOpen className="size-3.5" /> Biblioteca de logros</span><h2 className="mt-2 font-display text-3xl">Busca tu próxima aventura.</h2></div>
          <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(230px,1fr)_190px_180px_auto]" method="get">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input className="pl-10" name="q" defaultValue={q} placeholder="Nombre o descripción…" /></div>
            <select className="select-field" name="category" defaultValue={category}><option value="">Todas las categorías</option>{data.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select className="select-field" name="scope" defaultValue={scope}><option value="all">Todo el catálogo</option><option value="comp">Solo Completionist</option><option value="catalog">Otras tareas RS3</option></select>
            <input type="hidden" name="pageSize" value={data.pageSize} />
            <Button variant="secondary" type="submit"><Sparkles /> Aplicar</Button>
          </form>
        </div>

        <div className="mb-4 flex flex-wrap gap-2"><Badge tone="gold">{data.total.toLocaleString("es-CO")} resultados</Badge>{q && <Badge>Texto: {q}</Badge>}{category && <Badge>{category}</Badge>}{scope === "comp" && <Badge tone="green">Completionist</Badge>}</div>
        <TaskDataTable data={data.rows} page={data.page} pageCount={data.pageCount} total={data.total} sort={data.sort} direction={data.direction} query={{ q, category, scope, pageSize: data.pageSize }} />
      </section>
    </div>
  );
}
