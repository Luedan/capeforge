import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  return <div className="w-full max-w-lg"><span className="eyebrow">Únete a la expedición</span><h1 className="mt-4 font-display text-4xl">Forja tu propia ruta.</h1><p className="mt-3 mb-7 text-sm leading-6 text-muted">Al terminar recibirás códigos privados para recuperar tu cuenta sin preguntas fáciles de adivinar.</p><RegisterForm authenticated={Boolean(user)} /><p className="mt-6 text-center text-sm text-muted">¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-gold hover:text-gold-light">Inicia sesión</Link></p></div>;
}
