import type { Metadata } from "next";
import { RecoveryForm } from "@/components/auth/recovery-form";

export const metadata: Metadata = { title: "Recuperar cuenta" };

export default function RecoveryPage() {
  return <div className="w-full max-w-md"><span className="eyebrow">Recupera tu acceso</span><h1 className="mt-4 font-display text-4xl">Vuelve a la aventura.</h1><p className="mt-3 mb-8 text-sm leading-6 text-muted">Responde tu pregunta secreta para elegir una nueva contraseña.</p><RecoveryForm /></div>;
}
