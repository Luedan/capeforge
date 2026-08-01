"use client";

import { useActionState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { registerAction } from "@/app/actions/auth-actions";
import { SECRET_QUESTIONS } from "@/lib/auth-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ErrorText({ messages }: { messages?: string[] }) { return messages?.[0] ? <p className="mt-1.5 text-xs text-red-300">{messages[0]}</p> : null; }

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      <div><label className="field-label" htmlFor="displayName">Nombre visible</label><Input id="displayName" name="displayName" placeholder="Como te conocen en el clan" required /><ErrorText messages={state?.fieldErrors?.displayName} /></div>
      <div><label className="field-label" htmlFor="username">Usuario</label><Input id="username" name="username" autoComplete="username" placeholder="runemaster_92" required /><ErrorText messages={state?.fieldErrors?.username} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="password">Contraseña</label><Input id="password" name="password" type="password" autoComplete="new-password" required /><ErrorText messages={state?.fieldErrors?.password} /></div>
        <div><label className="field-label" htmlFor="confirmPassword">Confirmar</label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required /><ErrorText messages={state?.fieldErrors?.confirmPassword} /></div>
      </div>
      <div><label className="field-label" htmlFor="secretQuestion">Pregunta secreta</label><select className="select-field" id="secretQuestion" name="secretQuestion" defaultValue="" required><option value="" disabled>Elige una pregunta</option>{SECRET_QUESTIONS.map((question) => <option key={question} value={question}>{question}</option>)}</select><ErrorText messages={state?.fieldErrors?.secretQuestion} /></div>
      <div><label className="field-label" htmlFor="secretAnswer">Respuesta secreta</label><Input id="secretAnswer" name="secretAnswer" type="password" autoComplete="off" placeholder="Guárdala en un lugar seguro" required /><ErrorText messages={state?.fieldErrors?.secretAnswer} /></div>
      <Button className="w-full" size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />} Crear mi cuenta</Button>
    </form>
  );
}
