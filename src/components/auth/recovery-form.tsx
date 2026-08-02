"use client";

import Link from "next/link";
import { useActionState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ErrorText({ messages }: { messages?: string[] }) { return messages?.[0] ? <p className="mt-1.5 text-xs text-red-300">{messages[0]}</p> : null; }

export function RecoveryForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      <div><label className="field-label" htmlFor="username">Tu usuario</label><Input id="username" name="username" autoComplete="username" placeholder="runemaster_92" required /><ErrorText messages={state?.fieldErrors?.username} /></div>
      <div><label className="field-label" htmlFor="recoveryCode">Código de recuperación</label><Input id="recoveryCode" name="recoveryCode" autoComplete="off" spellCheck={false} className="font-mono uppercase tracking-wider" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" required /><ErrorText messages={state?.fieldErrors?.recoveryCode} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="password">Nueva contraseña</label><Input id="password" name="password" type="password" autoComplete="new-password" required /><ErrorText messages={state?.fieldErrors?.password} /></div><div><label className="field-label" htmlFor="confirmPassword">Confirmar</label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required /><ErrorText messages={state?.fieldErrors?.confirmPassword} /></div></div>
      <div className="rounded-xl border border-line bg-white/[.025] px-4 py-3 text-xs leading-5 text-muted">¿Perdiste todos tus códigos? Comunícate con un administrador de CapeForge para que genere un nuevo paquete.</div>
      <Button className="w-full" size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <KeyRound />} Restablecer contraseña</Button>
      <Link href="/login" className="block text-center text-sm text-muted hover:text-cream">Volver al inicio de sesión</Link>
    </form>
  );
}
