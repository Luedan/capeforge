import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "gold" | "green" | "purple" | "red" }) {
  const tones = {
    neutral: "border-line bg-white/4 text-muted",
    gold: "border-gold/25 bg-gold/10 text-gold-light",
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    purple: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide", tones[tone], className)} {...props} />;
}
