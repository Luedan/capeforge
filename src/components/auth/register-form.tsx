"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { registerAction } from "@/app/actions/auth-actions";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecoveryCodesPanel } from "@/components/recovery-codes-panel";

function ErrorText({ messages }: { messages?: string[] }) { return messages?.[0] ? <p className="mt-1.5 text-xs text-red-300">{messages[0]}</p> : null; }

export function RegisterForm({ authenticated = false }: { authenticated?: boolean }) {
  const [state, action, pending] = useActionState(registerAction, undefined);
  if (state?.registered && state.recoveryCodes) {
    return <div className="space-y-5"><RecoveryCodesPanel codes={state.recoveryCodes} /><Link href="/app" className={buttonClassName({ size: "lg", className: "w-full" })}>Ya los guardé, ir a mi panel <ArrowRight /></Link></div>;
  }
  if (authenticated) return <div className="rounded-2xl border border-gold/20 bg-gold/[.06] p-5 text-center"><p className="text-sm text-muted">Ya tienes una sesión activa en CapeForge.</p><Link href="/app" className={buttonClassName({ className: "mt-4 w-full" })}>Volver a mi panel <ArrowRight /></Link></div>;
  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      <div><label className="field-label" htmlFor="displayName">Nombre visible</label><Input id="displayName" name="displayName" placeholder="Como te conocen en el clan" required /><ErrorText messages={state?.fieldErrors?.displayName} /></div>
      <div><label className="field-label" htmlFor="username">Usuario</label><Input id="username" name="username" autoComplete="username" placeholder="runemaster_92" required /><ErrorText messages={state?.fieldErrors?.username} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="password">Contraseña</label><Input id="password" name="password" type="password" autoComplete="new-password" required /><ErrorText messages={state?.fieldErrors?.password} /></div>
        <div><label className="field-label" htmlFor="confirmPassword">Confirmar</label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required /><ErrorText messages={state?.fieldErrors?.confirmPassword} /></div>
      </div>
      <Button className="w-full" size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />} Crear mi cuenta</Button>
    </form>
  );
}
