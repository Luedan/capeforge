"use client";

import { useState, useTransition } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { toggleTaskAction } from "@/app/actions/task-actions";
import { cn } from "@/lib/utils";

export function TaskToggle({ taskId, completed }: { taskId: string; completed: boolean }) {
  const [checked, setChecked] = useState(completed);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={checked ? "Marcar como pendiente" : "Marcar como completada"}
      aria-pressed={checked}
      disabled={pending}
      onClick={() => {
        const next = !checked;
        setChecked(next);
        startTransition(async () => {
          try { await toggleTaskAction(taskId, next); } catch { setChecked(!next); }
        });
      }}
      className={cn("grid size-9 place-items-center rounded-xl border transition", checked ? "border-emerald-400/35 bg-emerald-400/15 text-emerald-300" : "border-line bg-white/3 text-muted hover:border-gold/40 hover:text-gold-light")}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className={cn("size-4", !checked && "opacity-25")} />}
    </button>
  );
}
