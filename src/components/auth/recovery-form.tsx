"use client";

import Link from "next/link";
import { useActionState } from "react";
import { KeyRound, LoaderCircle, Search } from "lucide-react";
import { lookupRecoveryAction, resetPasswordAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RecoveryForm() {
  const [lookup, lookupAction, lookupPending] = useActionState(lookupRecoveryAction, undefined);
  const [reset, resetAction, resetPending] = useActionState(resetPasswordAction, undefined);

  if (lookup?.question && lookup.username) {
    return (
      <form action={resetAction} className="space-y-4">
        <input type="hidden" name="username" value={lookup.username} />
        <div className="rounded-xl border border-gold/20 bg-gold/7 p-4"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-gold">Tu pregunta</span><p className="mt-2 text-sm text-cream">{lookup.question}</p></div>
        {reset?.error && <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">{reset.error}</p>}
        <div><label className="field-label" htmlFor="secretAnswer">Respuesta</label><Input id="secretAnswer" name="secretAnswer" type="password" required /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="password">Nueva contraseña</label><Input id="password" name="password" type="password" required /></div><div><label className="field-label" htmlFor="confirmPassword">Confirmar</label><Input id="confirmPassword" name="confirmPassword" type="password" required /></div></div>
        {reset?.fieldErrors && <p className="text-xs text-red-300">{Object.values(reset.fieldErrors).flat()[0]}</p>}
        <Button className="w-full" size="lg" disabled={resetPending}>{resetPending ? <LoaderCircle className="animate-spin" /> : <KeyRound />} Cambiar contraseña</Button>
      </form>
    );
  }

  return (
    <form action={lookupAction} className="space-y-5">
      {lookup?.error && <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">{lookup.error}</p>}
      <div><label className="field-label" htmlFor="username">Tu usuario</label><Input id="username" name="username" autoComplete="username" placeholder="runemaster_92" required /></div>
      <Button className="w-full" size="lg" disabled={lookupPending}>{lookupPending ? <LoaderCircle className="animate-spin" /> : <Search />} Buscar mi pregunta</Button>
      <Link href="/login" className="block text-center text-sm text-muted hover:text-cream">Volver al inicio de sesión</Link>
    </form>
  );
}
