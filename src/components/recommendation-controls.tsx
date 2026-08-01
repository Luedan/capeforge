"use client";

import { useTransition } from "react";
import { BellOff, LoaderCircle, Pin } from "lucide-react";
import { setTaskPinnedAction, snoozeTaskAction } from "@/app/actions/recommendation-actions";
import { Button } from "@/components/ui/button";

export function RecommendationControls({ taskId, pinned }: { taskId: string; pinned: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={pinned ? "outline" : "ghost"}
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => setTaskPinnedAction(taskId, !pinned))}
      >
        {pending ? <LoaderCircle className="animate-spin" /> : <Pin />} {pinned ? "Fijada" : "Fijar"}
      </Button>
      <label className="relative inline-flex items-center">
        <BellOff className="pointer-events-none absolute left-3 size-3.5 text-muted" />
        <select
          aria-label="Posponer recomendación"
          defaultValue=""
          disabled={pending}
          onChange={(event) => {
            const days = Number(event.currentTarget.value);
            if (days) startTransition(() => snoozeTaskAction(taskId, days));
          }}
          className="h-9 appearance-none rounded-lg border border-line bg-transparent pr-7 pl-8 text-xs font-semibold text-muted outline-none transition hover:border-gold/35 hover:text-cream"
        >
          <option value="" disabled>Posponer</option>
          <option value="1">1 día</option>
          <option value="3">3 días</option>
          <option value="7">7 días</option>
        </select>
      </label>
    </div>
  );
}
