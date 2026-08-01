import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Crown, LockKeyhole, Map, Sparkles } from "lucide-react";
import { getCapeOverview } from "@/data/dashboard";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mis capas" };

export default async function CapesPage() {
  const user = await requireUser();
  const capes = await getCapeOverview(user.id);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><span className="eyebrow"><Map className="size-3.5" /> Sala de expediciones</span><h1 className="mt-3 font-display text-4xl sm:text-5xl">Elige tu próxima leyenda.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Cada capa tiene su propio camino. Comp está abierta; las rutas más exigentes se preparan para la siguiente expedición.</p></div>
        <Badge tone="gold"><Sparkles className="mr-1 size-3" /> {capes.reduce((sum, cape) => sum + cape.completed, 0)} logros completados</Badge>
      </div>

      <Link href="/app/hoy" className="group relative mt-8 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-[#193021] to-[#151812] p-6 transition hover:-translate-y-0.5 hover:border-gold/35 sm:flex-row sm:items-center">
        <div className="rune-grid pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-gold/20 bg-gold/10 text-gold-light"><BrainCircuit /></span><div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300">Nuevo · motor inteligente</span><h2 className="mt-1 font-display text-2xl">CapeForge ya puede decidir qué te conviene hacer hoy.</h2><p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted">Combina tareas time-gated, victorias rápidas, grinds y el tiempo que tienes disponible.</p></div></div>
        <span className="relative inline-flex shrink-0 items-center gap-2 text-sm font-bold text-gold-light">Ver mi briefing <ArrowRight className="transition group-hover:translate-x-1" /></span>
      </Link>

      <div className="mt-9 grid gap-5 xl:grid-cols-3">
        {capes.map((cape, index) => (
          <article key={cape.id} className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${cape.isAvailable ? "border-gold/30 bg-gradient-to-br from-[#1a2d20] via-surface to-[#151912]" : "border-line bg-surface/55"}`}>
            <div className="rune-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative flex items-start justify-between">
              <span className={`grid size-13 place-items-center rounded-2xl border ${cape.isAvailable ? "border-gold/25 bg-gold/10 text-gold-light" : "border-line bg-white/3 text-muted"}`}><Crown /></span>
              {cape.isAvailable ? <Badge tone="green">Disponible</Badge> : <Badge><LockKeyhole className="mr-1 size-3" /> Próximamente</Badge>}
            </div>
            <div className="relative mt-9"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">Ruta 0{index + 1}</span><h2 className="mt-2 font-display text-3xl">{cape.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-muted">{cape.description}</p></div>
            {cape.isAvailable ? (
              <div className="relative mt-8">
                <div className="mb-2 flex items-center justify-between text-xs"><span className="text-muted">Tu progreso</span><strong>{cape.completed} / {cape.total}</strong></div><Progress value={cape.percent} /><div className="mt-6 flex items-center justify-between"><strong className="font-display text-3xl text-gold-light">{cape.percent}%</strong><Link href="/app/comp" className={buttonClassName({ size: "sm" })}>Continuar <ArrowRight /></Link></div>
              </div>
            ) : <div className="relative mt-8 h-[85px] rounded-2xl border border-dashed border-line bg-black/10 p-4 text-xs leading-5 text-muted">Esta sala se abrirá cuando su catálogo de requisitos esté listo.</div>}
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border border-line bg-surface/65 p-6"><span className="eyebrow">Consejo del día</span><p className="mt-3 font-display text-2xl">Empieza hoy los requisitos time-gated.</p><p className="mt-2 text-sm leading-6 text-muted">Ports, reputaciones y actividades semanales avanzan poco a poco. Iniciarlos temprano convierte meses de espera en progreso pasivo.</p></div>
        <div className="rounded-2xl border border-line bg-black/15 p-6"><span className="text-xs font-bold uppercase tracking-[.15em] text-muted">Catálogo maestro</span><strong className="mt-3 block font-display text-4xl text-gold-light">4.155</strong><span className="text-sm text-muted">logros de RuneScape 3 preparados para futuras rutas.</span></div>
      </div>
    </div>
  );
}
