import type { Metadata } from "next";
import { AlarmClock, BrainCircuit, Check, Clock3, Flame, Gauge, Route, Sparkles, TimerReset, WandSparkles, Zap } from "lucide-react";
import { updateRecommendationSettingsAction } from "@/app/actions/recommendation-actions";
import { SmartTaskCard } from "@/components/smart-task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSmartRecommendations, RECOMMENDATION_FOCUS } from "@/data/recommendations";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Para hoy" };

const focusNames = {
  BALANCED: "Equilibrado",
  TIME_GATED: "Time-gated",
  QUICK_WINS: "Victorias rápidas",
  GRIND: "Farmeo / grind",
  COMBAT: "Combate",
};

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", hour: "numeric", hour12: false }).format(new Date()));
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default async function TodayPage() {
  const user = await requireUser();
  const data = await getSmartRecommendations(user.id);
  const date = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-[#1b3022] via-[#121b16] to-[#12130f] p-6 sm:p-8">
        <div className="rune-grid pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative grid gap-8 xl:grid-cols-[1fr_350px] xl:items-center">
          <div>
            <div className="eyebrow"><BrainCircuit className="size-3.5" /> Briefing inteligente · {date}</div>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">{greeting()}, {user.displayName}.<br /><span className="text-gold-light italic">Esta es tu mejor ruta de hoy.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">CapeForge analizó tus pendientes, el tiempo disponible, tareas con espera y tu progreso reciente. Hoy está optimizando para {data.settings.focusLabel}.</p>
            <div className="mt-6 flex flex-wrap gap-2"><Badge tone="green"><Check className="mr-1 size-3" /> Ruta actualizada hoy</Badge><Badge tone="gold"><Clock3 className="mr-1 size-3" /> {data.settings.sessionMinutes} min por sesión</Badge><Badge tone="purple"><Route className="mr-1 size-3" /> {data.dailyPlan.length} pasos sugeridos</Badge></div>
          </div>
          <div className="relative mx-auto grid size-56 place-items-center rounded-full border border-gold/20 bg-black/15 shadow-[0_0_70px_rgba(39,113,67,.16)]">
            <div className="absolute inset-5 rounded-full border border-dashed border-emerald-400/20" />
            <div className="absolute inset-10 rounded-full border border-gold/10" />
            <div className="relative text-center"><WandSparkles className="mx-auto size-8 text-gold-light" /><strong className="mt-3 block font-display text-4xl text-cream">{data.stats.pending}</strong><span className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">pendientes analizadas</span></div>
            <span className="absolute top-4 right-8 size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7a5]" />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={AlarmClock} label="Con espera" value={data.stats.rituals} detail="conviene tocarlas hoy" />
        <Metric icon={Zap} label="Victorias rápidas" value={data.stats.quickWins} detail="entran en poco tiempo" />
        <Metric icon={Flame} label="Grinds activos" value={data.stats.longGrinds} detail="para sesiones largas" />
        <Metric icon={TimerReset} label="Pospuestas" value={data.stats.snoozed} detail="volverán después" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_330px]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4"><div><span className="eyebrow"><Route className="size-3.5" /> Tu ruta de hoy</span><h2 className="mt-2 font-display text-3xl">Haz estas primero.</h2></div><span className="hidden text-xs text-muted sm:block">~{data.stats.plannedMinutes} min de acciones útiles</span></div>
          <div className="space-y-4">
            {data.dailyPlan.map((task, index) => <SmartTaskCard key={task.id} task={task} index={index} featured />)}
            {!data.dailyPlan.length && <div className="rounded-2xl border border-line bg-surface/60 p-10 text-center"><Sparkles className="mx-auto size-8 text-gold" /><h3 className="mt-4 font-display text-2xl">No quedan tareas pendientes.</h3><p className="mt-2 text-sm text-muted">Parece que esa capa ya te pertenece.</p></div>}
          </div>
        </section>

        <aside className="space-y-5">
          <form action={updateRecommendationSettingsAction} className="rounded-2xl border border-line bg-surface/75 p-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-gold/10 text-gold-light"><Gauge className="size-5" /></span><div><h2 className="font-display text-xl">Afina el motor</h2><p className="text-[11px] text-muted">Dile cómo quieres jugar hoy.</p></div></div>
            <div className="mt-5"><label className="field-label" htmlFor="sessionMinutes">Tiempo por sesión</label><select className="select-field" id="sessionMinutes" name="sessionMinutes" defaultValue={data.settings.sessionMinutes}>{[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></div>
            <div className="mt-4"><label className="field-label" htmlFor="focus">Quiero enfocarme en</label><select className="select-field" id="focus" name="focus" defaultValue={data.settings.focus}>{RECOMMENDATION_FOCUS.map((focus) => <option key={focus} value={focus}>{focusNames[focus]}</option>)}</select></div>
            <Button className="mt-5 w-full" type="submit"><Sparkles /> Recalcular mi ruta</Button>
          </form>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.045] p-5"><span className="eyebrow text-emerald-300">Cómo aprende</span><ul className="mt-4 space-y-3 text-xs leading-5 text-muted"><li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" /> Las tareas que fijas siempre suben de prioridad.</li><li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" /> Lo pospuesto desaparece y vuelve automáticamente.</li><li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" /> Tu briefing rota cada día para evitar estancarte.</li></ul></div>
        </aside>
      </div>

      {data.timeGated.length > 0 && <section className="mt-10"><div className="mb-4"><span className="eyebrow"><AlarmClock className="size-3.5" /> No dejes pasar el tiempo</span><h2 className="mt-2 font-display text-3xl">Rituales y esperas.</h2><p className="mt-2 text-sm text-muted">CapeForge detectó estas tareas como diarias, semanales o time-gated. Te las recordará al abrir tu briefing mientras sigan pendientes.</p></div><div className="grid gap-4 lg:grid-cols-2">{data.timeGated.slice(0, 4).map((task) => <SmartTaskCard key={task.id} task={task} />)}</div></section>}

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div><div className="mb-4"><span className="eyebrow"><Zap className="size-3.5" /> Momentum</span><h2 className="mt-2 font-display text-3xl">Victorias rápidas.</h2></div><div className="space-y-3">{data.quickWins.slice(0, 3).map((task) => <CompactTask key={task.id} task={task} icon={Zap} />)}</div></div>
        <div><div className="mb-4"><span className="eyebrow"><Flame className="size-3.5" /> Sesión larga</span><h2 className="mt-2 font-display text-3xl">Grinds que vale mover.</h2></div><div className="space-y-3">{data.grinds.slice(0, 3).map((task) => <CompactTask key={task.id} task={task} icon={Flame} />)}</div></div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof AlarmClock; label: string; value: number; detail: string }) { return <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-5"><span className="grid size-10 place-items-center rounded-xl bg-white/4 text-gold-light"><Icon className="size-5" /></span><div><span className="text-xs text-muted">{label}</span><div className="mt-0.5 flex items-baseline gap-2"><strong className="font-display text-2xl">{value}</strong><span className="text-[10px] text-muted">{detail}</span></div></div></div>; }
function CompactTask({ task, icon: Icon }: { task: Awaited<ReturnType<typeof getSmartRecommendations>>["dailyPlan"][number]; icon: typeof Zap }) { return <div className="flex items-center gap-3 rounded-xl border border-line bg-surface/55 p-3.5"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/4 text-gold"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{task.name}</strong><span className="text-[11px] text-muted">~{task.minutes} min · {task.category ?? "General"}</span></div><Badge tone={task.isGrind ? "purple" : "green"}>{task.compTimeType ?? "Sugerida"}</Badge></div>; }
