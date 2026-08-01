import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("h-11 w-full rounded-xl border border-line bg-ink/45 px-3.5 text-sm text-cream outline-none transition placeholder:text-muted/65 focus:border-gold/55 focus:ring-3 focus:ring-gold/10 disabled:opacity-50", className)}
      {...props}
    />
  );
}
