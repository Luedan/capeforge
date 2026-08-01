import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return <div className="w-full max-w-lg"><span className="eyebrow">Únete a la expedición</span><h1 className="mt-4 font-display text-4xl">Forja tu propia ruta.</h1><p className="mt-3 mb-7 text-sm leading-6 text-muted">La primera cuenta registrada se convierte en administradora y hereda los 31 checks del Excel.</p><RegisterForm /><p className="mt-6 text-center text-sm text-muted">¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-gold hover:text-gold-light">Inicia sesión</Link></p></div>;
}
