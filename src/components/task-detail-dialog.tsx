"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, Map, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TaskDetailData = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  subsubcategory?: string | null;
  releaseDate?: Date | string | null;
  wikiUrl?: string | null;
  compPriority?: string | null;
  compDifficulty?: string | null;
  compTimeType?: string | null;
  compInstructions?: string | null;
  capes?: Array<{ slug: string; shortName: string }>;
  completedAt?: Date | string | null;
};

const TaskDialogContext = createContext<(() => void) | null>(null);

export function TaskDetailTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const open = useContext(TaskDialogContext);
  if (!open) return <>{children}</>;
  return <button type="button" className={cn("block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-gold/50", className)} onClick={open}>{children}</button>;
}

export function TaskDetailDialog({ task, children }: { task: TaskDetailData; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const summary = task.compInstructions ?? task.description ?? "Este logro todavía no tiene una descripción disponible.";
  const releaseDate = task.releaseDate ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(task.releaseDate)) : null;

  return (
    <TaskDialogContext.Provider value={() => setOpen(true)}>
      {children}
      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-end bg-black/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby={`task-title-${task.id}`} className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-[#111814] shadow-2xl sm:max-w-2xl sm:rounded-3xl">
            <div className="rune-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-20" />
            <div className="relative border-b border-line bg-gradient-to-br from-emerald-950/75 to-transparent p-6 sm:p-8">
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-cream" aria-label="Cerrar detalle"><X className="size-5" /></button>
              <div className="flex flex-wrap gap-2 pr-12">
                <Badge tone="gold">{task.category ?? "General"}</Badge>
                {task.capes?.map((cape) => <Badge key={cape.slug} tone="green">{cape.shortName}</Badge>)}
                {task.completedAt && <Badge tone="green">Completada</Badge>}
              </div>
              <h2 id={`task-title-${task.id}`} className="mt-4 max-w-xl font-display text-3xl leading-tight text-cream sm:text-4xl">{task.name}</h2>
              {(task.subcategory || task.subsubcategory) && <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Map className="size-4 text-gold" />{[task.subcategory, task.subsubcategory].filter(Boolean).join(" · ")}</p>}
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-gold"><BookOpen className="size-4" /> Resumen del requisito</span>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#c7d0c7]">{summary}</p>
              </div>
              {task.compInstructions && task.description && task.description !== task.compInstructions && <details className="rounded-2xl border border-line bg-white/[.025] p-4"><summary className="cursor-pointer text-xs font-semibold text-cream">Descripción original del catálogo</summary><p className="mt-3 whitespace-pre-line text-xs leading-6 text-muted">{task.description}</p></details>}

              <div className="grid gap-3 sm:grid-cols-2">
                {task.compDifficulty && <Info label="Dificultad" value={task.compDifficulty} />}
                {task.compTimeType && <Info label="Tipo de progreso" value={task.compTimeType} icon={<Clock3 className="size-4" />} />}
                {task.compPriority && <Info label="Prioridad" value={task.compPriority} />}
                {releaseDate && <Info label="Publicado" value={releaseDate} icon={<CalendarDays className="size-4" />} />}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setOpen(false)} className={buttonClassName({ variant: "ghost" })}>Cerrar</button>
                {task.wikiUrl && <a href={task.wikiUrl} target="_blank" rel="noreferrer" className={buttonClassName({ variant: "default" })}>Abrir guía en la Wiki <ArrowUpRight className="size-4" /></a>}
              </div>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </TaskDialogContext.Provider>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border border-line bg-white/[.025] px-4 py-3"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-muted">{icon}{label}</span><strong className="mt-1.5 block text-sm text-cream">{value}</strong></div>;
}
