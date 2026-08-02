import { AlarmClock, ArrowUpRight, Brain, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { RecommendationControls } from "@/components/recommendation-controls";
import { TaskDetailDialog, TaskDetailTrigger } from "@/components/task-detail-dialog";
import { TaskToggle } from "@/components/task-toggle";
import { Badge } from "@/components/ui/badge";
import type { SmartTask } from "@/data/recommendations";
import { cn } from "@/lib/utils";

const cadenceLabel = {
  DAILY: "Rutina diaria",
  WEEKLY: "Rutina semanal",
  REPEATED: "Revisar con frecuencia",
  NONE: null,
};

export function SmartTaskCard({ task, index, featured = false }: { task: SmartTask; index?: number; featured?: boolean }) {
  const cadence = cadenceLabel[task.cadence];
  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border border-line bg-surface/70 p-5 transition hover:border-gold/25", featured && "bg-gradient-to-br from-[#17281c] to-surface sm:p-6")}>
      {featured && <div className="rune-grid pointer-events-none absolute inset-0 opacity-25" />}
      <div className="relative flex items-start gap-4">
        {typeof index === "number" ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/8 font-display text-lg text-gold-light">{String(index + 1).padStart(2, "0")}</span>
        ) : <TaskToggle taskId={task.id} completed={false} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={task.isTimeGated ? "gold" : task.isGrind ? "purple" : "neutral"}>{task.category ?? "General"}</Badge>
            {cadence && <Badge tone="green"><CalendarDays className="mr-1 size-3" />{cadence}</Badge>}
            {task.pinned && <Badge tone="gold">Prioridad tuya</Badge>}
          </div>
          <TaskDetailDialog task={task}><TaskDetailTrigger className="mt-3 rounded-lg"><h3 className={cn("font-display text-xl leading-tight text-cream transition hover:text-gold-light", featured && "text-2xl")}>{task.name}</h3></TaskDetailTrigger></TaskDetailDialog>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{task.compInstructions ?? task.description ?? "Consulta la wiki para conocer todos los pasos."}</p>

          <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[.045] px-3.5 py-3">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-300"><Brain className="size-3" /> Por qué te la recomiendo</span>
            <p className="mt-1.5 text-xs leading-5 text-[#bfccbf]">{task.reasons.join(" · ")}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> ~{task.minutes} min</span>
              {task.compTimeType && <span className="flex items-center gap-1.5"><AlarmClock className="size-3.5" /> {task.compTimeType}</span>}
              {task.wikiUrl && <a className="flex items-center gap-1 text-gold hover:text-gold-light" href={task.wikiUrl} target="_blank" rel="noreferrer">Wiki <ArrowUpRight className="size-3" /></a>}
            </div>
            <div className="flex items-center gap-2">
              {featured && <TaskToggle taskId={task.id} completed={false} />}
              <RecommendationControls taskId={task.id} pinned={task.pinned} />
            </div>
          </div>
        </div>
      </div>
      {featured && index === 0 && <Sparkles className="absolute top-5 right-5 size-4 text-gold/50" />}
    </article>
  );
}
