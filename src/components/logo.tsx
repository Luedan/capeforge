import Link from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <span className="grid size-10 place-items-center rounded-xl border border-gold/30 bg-gradient-to-br from-gold/25 to-emerald-900/40 text-gold-light shadow-[inset_0_1px_rgba(255,255,255,.14)]">
        <Crown className="size-5" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-xl font-semibold tracking-wide text-cream">CapeForge</span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.28em] text-gold/75">Gielinor Tracker</span>
        </span>
      )}
    </Link>
  );
}
