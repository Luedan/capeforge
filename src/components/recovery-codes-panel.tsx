"use client";

import { useState } from "react";
import { Check, Copy, Download, KeyRound, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecoveryCodesPanel({ codes, onDismiss }: { codes: string[]; onDismiss?: () => void }) {
  const [copied, setCopied] = useState(false);
  const content = codes.join("\n");

  async function copyCodes() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function downloadCodes() {
    const text = `CapeForge — códigos de recuperación\n\n${content}\n\nCada código funciona una sola vez. No compartas este archivo.`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "capeforge-codigos-recuperacion.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[.08] to-emerald-400/[.035] p-5 sm:p-6">
      {onDismiss && <button type="button" onClick={onDismiss} className="absolute right-3 top-3 grid size-9 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-cream" aria-label="Cerrar"><X className="size-4" /></button>}
      <div className="flex items-start gap-3 pr-8"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold-light"><ShieldCheck className="size-5" /></span><div><h2 className="font-display text-2xl text-cream">Guarda tus códigos ahora.</h2><p className="mt-1.5 text-xs leading-5 text-muted">Son la única forma de recuperar tu cuenta sin ayuda de un administrador. Cada uno funciona una sola vez.</p></div></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {codes.map((code, index) => <div key={code} className="flex items-center gap-3 rounded-xl border border-line bg-black/20 px-3.5 py-3 font-mono text-xs tracking-wider text-cream"><span className="text-[10px] text-gold">{String(index + 1).padStart(2, "0")}</span><KeyRound className="size-3.5 text-muted" /><span>{code}</span></div>)}
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row"><Button type="button" variant="secondary" onClick={copyCodes}>{copied ? <Check /> : <Copy />}{copied ? "Copiados" : "Copiar todos"}</Button><Button type="button" variant="outline" onClick={downloadCodes}><Download /> Descargar archivo</Button></div>
      <p className="mt-4 text-[11px] leading-5 text-muted">Guárdalos en un gestor de contraseñas o en un lugar privado. CapeForge almacena solamente versiones irreversibles y no podrá volver a mostrar estos mismos códigos.</p>
    </div>
  );
}
