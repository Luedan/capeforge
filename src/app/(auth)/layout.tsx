import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="site-shell relative grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <div className="rune-grid pointer-events-none absolute inset-0" />
      <aside className="relative hidden overflow-hidden border-r border-line p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="max-w-lg">
          <span className="eyebrow">Tu ruta comienza aquí</span>
          <blockquote className="mt-6 font-display text-4xl leading-tight">“Cada logro pequeño es una parte de la leyenda que vas a vestir.”</blockquote>
          <p className="mt-5 text-sm text-muted">— El diario del completionist</p>
        </div>
        <p className="text-xs text-muted">4.155 logros de RuneScape 3, una ruta a la vez.</p>
      </aside>
      <section className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <Link href="/" className="absolute top-6 left-5 inline-flex items-center gap-2 text-sm text-muted transition hover:text-cream lg:hidden"><ArrowLeft className="size-4" /> Volver</Link>
        {children}
      </section>
    </main>
  );
}
