"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { loginAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-5">
      {state?.error && <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      <div><label className="field-label" htmlFor="username">Usuario</label><Input id="username" name="username" autoComplete="username" placeholder="Tu nombre de jugador" required /></div>
      <div><div className="mb-2 flex items-center justify-between"><label className="field-label mb-0" htmlFor="password">Contraseña</label><Link className="text-xs font-semibold text-gold hover:text-gold-light" href="/recuperar">¿La olvidaste?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required /></div>
      <Button className="w-full" size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <LogIn />} Entrar a mi ruta</Button>
    </form>
  );
}
