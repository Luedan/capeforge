import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Crown, Search, ShieldCheck, Sparkles, Swords, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonClassName } from "@/components/ui/button";

const sampleTasks = [
  { name: "Port Life", group: "Player Owned Port", done: true },
  { name: "Music Maestro", group: "Activities", done: false },
  { name: "Task Master", group: "Area Tasks", done: false },
  { name: "Annihilator", group: "Lore", done: true },
];

export default function LandingPage() {
  return (
    <main className="site-shell overflow-hidden">
      <div className="rune-grid pointer-events-none absolute inset-x-0 top-0 h-[850px]" />
      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#ruta" className="transition hover:text-cream">La ruta</a>
          <a href="#comunidad" className="transition hover:text-cream">Comunidad</a>
          <a href="#progreso" className="transition hover:text-cream">Progreso</a>
        </div>
        <Link href="/login" className={buttonClassName({ variant: "outline", size: "sm" })}>
          Iniciar sesión <ArrowRight />
        </Link>
      </nav>

      <section className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-16">
        <div className="relative z-10">
          <div className="eyebrow mb-6"><Sparkles className="size-3.5" /> Hecho para completionists</div>
          <h1 className="max-w-3xl font-display text-5xl leading-[.98] font-semibold tracking-[-.045em] text-cream sm:text-6xl lg:text-[5.25rem]">
            Convierte cada logro en una <span className="text-gold-light italic">historia.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
            Tu mapa personal hacia la Completionist Cape. Organiza requisitos, marca victorias y comparte el camino con quienes entienden el grind.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/registro" className={buttonClassName({ size: "lg" })}>
              Empezar mi ruta <ChevronRight />
            </Link>
            <a href="#ruta" className={buttonClassName({ variant: "secondary", size: "lg" })}>Explorar CapeForge</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-muted">
            <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Registro gratuito</span>
            <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> 4.155 logros catalogados</span>
            <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Progreso individual</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px] lg:mx-0">
          <div className="absolute -inset-16 rounded-full bg-emerald-700/10 blur-3xl" />
          <div className="float-soft relative rounded-[28px] border border-gold/20 bg-[#101713]/90 p-3 shadow-[0_40px_100px_rgba(0,0,0,.5)]">
            <div className="rounded-[22px] border border-line bg-surface p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="gold">CAPA ACTIVA</Badge>
                  <h2 className="mt-4 font-display text-2xl text-cream">Completionist Cape</h2>
                  <p className="mt-1 text-sm text-muted">Tu expedición por Gielinor</p>
                </div>
                <div className="grid size-14 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold-light"><Crown /></div>
              </div>
              <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs"><span className="text-muted">Progreso total</span><strong className="text-cream">31 / 102</strong></div>
                  <Progress value={30} />
                </div>
                <strong className="font-display text-4xl text-gold-light">30%</strong>
              </div>
              <div className="my-6 gold-rule" />
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.16em] text-muted">Siguiente tramo</span>
                <Search className="size-4 text-muted" />
              </div>
              <div className="space-y-2.5">
                {sampleTasks.map((task) => (
                  <div key={task.name} className="flex items-center gap-3 rounded-xl border border-line bg-black/15 p-3.5">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-lg border ${task.done ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300" : "border-line bg-white/3 text-transparent"}`}><Check className="size-3.5" /></span>
                    <span className="min-w-0 flex-1"><strong className={`block truncate text-sm ${task.done ? "text-muted line-through" : "text-cream"}`}>{task.name}</strong><span className="text-[11px] text-muted">{task.group}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-8 rounded-2xl border border-gold/20 bg-surface-2 px-5 py-4 shadow-2xl sm:-right-10">
            <span className="block text-[10px] font-bold uppercase tracking-[.16em] text-muted">Esta semana</span>
            <span className="mt-1 flex items-center gap-2 font-display text-xl text-gold-light"><Swords className="size-4" /> +7 logros</span>
          </div>
        </div>
      </section>

      <section id="ruta" className="relative border-y border-line bg-black/15 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow justify-center">Tu aventura, bien trazada</div>
            <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">Menos listas. Más conquistas.</h2>
            <p className="mt-5 text-muted">Todo lo que necesitas para saber dónde estás, qué sigue y cuánto falta para lucir esa capa.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              { icon: Crown, title: "Elige tu capa", text: "Empieza por Comp y prepárate para Trimmed y Master Quest Cape.", num: "01" },
              { icon: Search, title: "Encuentra tu siguiente logro", text: "Filtra por categoría, estado o busca entre cada requisito.", num: "02" },
              { icon: ShieldCheck, title: "Hazlo tuyo", text: "Marca lo completado y conserva tu progreso de forma segura.", num: "03" },
            ].map((item) => (
              <article key={item.title} className="group rounded-2xl border border-line bg-surface/70 p-7 transition hover:-translate-y-1 hover:border-gold/30">
                <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-gold/10 text-gold-light"><item.icon className="size-5" /></span><span className="font-display text-3xl text-white/8">{item.num}</span></div>
                <h3 className="mt-7 font-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comunidad" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="eyebrow"><Users className="size-3.5" /> Construido para compartir</div>
          <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">Que tus amigos también quieran entrar al grind.</h2>
        </div>
        <div className="flex flex-col justify-center">
          <p className="max-w-xl text-lg leading-8 text-muted">Cada jugador tiene su propio progreso. La primera cuenta administra la comunidad y puede convertir a otros jugadores en administradores o pausar accesos cuando sea necesario.</p>
          <div id="progreso" className="mt-8 flex flex-wrap gap-3">
            <Badge tone="green">Progreso independiente</Badge><Badge tone="gold">Panel administrativo</Badge><Badge tone="purple">Recuperación de cuenta</Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-gold/25 bg-gradient-to-br from-[#1b2d20] to-[#121611] px-7 py-14 text-center sm:px-14">
          <div className="rune-grid pointer-events-none absolute inset-0 opacity-60" />
          <Crown className="relative mx-auto size-9 text-gold-light" />
          <h2 className="relative mt-5 font-display text-4xl sm:text-5xl">La capa no se consigue sola.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted">Pero el camino se siente mucho mejor cuando sabes exactamente cuál es tu próxima victoria.</p>
          <Link href="/registro" className={buttonClassName({ size: "lg", className: "relative mt-8" })}>Crear mi cuenta <ArrowRight /></Link>
        </div>
      </section>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-xs text-muted sm:flex-row lg:px-8">
          <Logo />
          <p>Proyecto comunitario no afiliado con Jagex. RuneScape es marca de sus respectivos propietarios.</p>
        </div>
      </footer>
    </main>
  );
}
