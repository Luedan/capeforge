import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Crown, ExternalLink, Filter, Search, Target } from "lucide-react";
import { getCompDashboard } from "@/data/dashboard";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TaskToggle } from "@/components/task-toggle";
import { TaskDetailDialog, TaskDetailTrigger } from "@/components/task-detail-dialog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Completionist Cape" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function CompPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = one(params.q) ?? "";
  const category = one(params.category) ?? "";
  const rawStatus = one(params.status);
  const status = rawStatus === "completed" || rawStatus === "pending" ? rawStatus : "all";
  const page = Number(one(params.page)) || 1;
  const data = await getCompDashboard(user.id, { q, category, status, page });

  const pageHref = (next: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q); if (category) query.set("category", category); if (status !== "all") query.set("status", status); query.set("page", String(next));
    return `/app/comp?${query}`;
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-r from-[#182a1d] via-[#121a15] to-[#161510] p-6 sm:p-8">
        <div className="rune-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div><div className="eyebrow"><Crown className="size-3.5" /> Ruta activa</div><h1 className="mt-3 font-display text-4xl sm:text-5xl">Completionist Cape</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Domina misiones, habilidades, exploración y combate. Cada check te acerca a uno de los símbolos más reconocibles de Gielinor.</p></div>
          <div className="grid min-w-0 gap-4 sm:min-w-[430px] sm:grid-cols-[1fr_auto] sm:items-end"><div><div className="mb-2 flex justify-between text-xs text-muted"><span>Progreso total</span><strong className="text-cream">{data.completed} de {data.total}</strong></div><Progress value={data.percent} className="h-3" /></div><strong className="font-display text-5xl text-gold-light">{data.percent}%</strong></div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Metric icon={CheckCircle2} label="Completadas" value={data.completed} tone="text-emerald-300" />
        <Metric icon={Clock3} label="Pendientes" value={data.pending} tone="text-amber-300" />
        <Metric icon={Target} label="Meta total" value={data.total} tone="text-gold-light" />
      </div>

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface/75">
        <div className="border-b border-line p-4 sm:p-5">
          <form className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]" method="get">
            <div className="relative"><Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" /><Input name="q" defaultValue={q} className="pl-10" placeholder="Buscar un logro…" /></div>
            <select className="select-field" name="category" defaultValue={category}><option value="">Todas las categorías</option>{data.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select className="select-field" name="status" defaultValue={status}><option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="completed">Completadas</option></select>
            <Button variant="secondary" type="submit"><Filter /> Filtrar</Button>
          </form>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-line bg-black/10 text-[10px] uppercase tracking-[.14em] text-muted"><th className="w-16 px-5 py-3">Estado</th><th className="px-4 py-3">Requisito</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Ruta</th><th className="w-14 px-5 py-3"><span className="sr-only">Wiki</span></th></tr></thead>
            <tbody>{data.tasks.map((task) => <TaskTableRow key={task.id} task={task} />)}</tbody>
          </table>
        </div>
        <div className="divide-y divide-line md:hidden">{data.tasks.map((task) => <TaskMobileRow key={task.id} task={task} />)}</div>
        {!data.tasks.length && <div className="px-6 py-16 text-center"><Search className="mx-auto size-8 text-muted" /><h3 className="mt-4 font-display text-2xl">No encontramos logros</h3><p className="mt-2 text-sm text-muted">Prueba con otra búsqueda o limpia los filtros.</p></div>}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-muted sm:flex-row">
          <span>Mostrando {data.tasks.length} de {data.filteredTotal} resultados</span>
          <div className="flex items-center gap-2"><Link aria-disabled={data.page <= 1} href={data.page > 1 ? pageHref(data.page - 1) : "#"} className={buttonClassName({ variant: "ghost", size: "sm", className: data.page <= 1 ? "pointer-events-none opacity-40" : "" })}><ArrowLeft /> Anterior</Link><span className="rounded-lg bg-white/4 px-3 py-2">{data.page} / {data.totalPages}</span><Link aria-disabled={data.page >= data.totalPages} href={data.page < data.totalPages ? pageHref(data.page + 1) : "#"} className={buttonClassName({ variant: "ghost", size: "sm", className: data.page >= data.totalPages ? "pointer-events-none opacity-40" : "" })}>Siguiente <ArrowRight /></Link></div>
        </div>
      </section>
    </div>
  );
}

type TaskItem = Awaited<ReturnType<typeof getCompDashboard>>["tasks"][number];

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Crown; label: string; value: number; tone: string }) { return <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-5"><span className={cn("grid size-10 place-items-center rounded-xl bg-white/4", tone)}><Icon className="size-5" /></span><div><span className="block text-xs text-muted">{label}</span><strong className="mt-1 block font-display text-2xl">{value}</strong></div></div>; }
function TaskTableRow({ task }: { task: TaskItem }) { const done = Boolean(task.completedAt); return <tr className={cn("border-b border-line/70 transition last:border-0 hover:bg-white/[.025]", done && "bg-emerald-400/[.025]")}><td className="px-5 py-4"><TaskToggle taskId={task.id} completed={done} /></td><td className="max-w-xl px-4 py-4"><TaskDetailDialog task={task}><TaskDetailTrigger className="rounded-lg py-1"><strong className={cn("block text-sm transition hover:text-gold-light", done ? "text-muted line-through" : "text-cream")}>{task.name}</strong><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{task.compInstructions ?? task.description ?? "Sin descripción disponible."}</p></TaskDetailTrigger></TaskDetailDialog></td><td className="px-4 py-4"><Badge>{task.category ?? "General"}</Badge>{task.subcategory && <span className="mt-1.5 block text-[10px] text-muted">{task.subcategory}</span>}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{task.compDifficulty && <Badge tone={task.compDifficulty.toLowerCase().includes("dific") ? "red" : "gold"}>{task.compDifficulty}</Badge>}{task.compTimeType && <Badge tone="purple">{task.compTimeType}</Badge>}</div></td><td className="px-5 py-4">{task.wikiUrl && <a href={task.wikiUrl} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-gold-light" aria-label={`Abrir ${task.name} en la wiki`}><ExternalLink className="size-4" /></a>}</td></tr>; }
function TaskMobileRow({ task }: { task: TaskItem }) { const done = Boolean(task.completedAt); return <div className="p-4"><div className="flex items-start gap-3"><TaskToggle taskId={task.id} completed={done} /><div className="min-w-0 flex-1"><TaskDetailDialog task={task}><TaskDetailTrigger className="rounded-lg"><strong className={cn("block text-sm transition hover:text-gold-light", done && "text-muted line-through")}>{task.name}</strong><p className="mt-1.5 text-xs leading-5 text-muted">{task.compInstructions ?? task.description}</p></TaskDetailTrigger></TaskDetailDialog><div className="mt-3 flex flex-wrap gap-1.5"><Badge>{task.category ?? "General"}</Badge>{task.compDifficulty && <Badge tone="gold">{task.compDifficulty}</Badge>}{task.wikiUrl && <a href={task.wikiUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gold">Wiki <ExternalLink className="size-3" /></a>}</div></div></div></div>; }
