import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return <div className="w-full max-w-md"><span className="eyebrow">Bienvenido de vuelta</span><h1 className="mt-4 font-display text-4xl">Continúa tu aventura.</h1><p className="mt-3 mb-8 text-sm leading-6 text-muted">Tus logros siguen exactamente donde los dejaste.</p><LoginForm /><p className="mt-7 text-center text-sm text-muted">¿Primera vez en CapeForge? <Link href="/registro" className="font-semibold text-gold hover:text-gold-light">Crea tu cuenta</Link></p></div>;
}
