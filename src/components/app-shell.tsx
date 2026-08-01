import Link from "next/link";
import { Crown, LayoutGrid, LogOut, Shield, Swords } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

type ShellUser = { displayName: string; username: string; role: "ADMIN" | "USER" };

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  return (
    <div className="site-shell min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-line bg-[#0d130f]/95 p-5 lg:flex">
        <Logo className="px-1 py-2" />
        <nav className="mt-10 space-y-2">
          <ShellLink href="/app" icon={LayoutGrid}>Mis capas</ShellLink>
          <ShellLink href="/app/comp" icon={Crown}>Completionist</ShellLink>
          {user.role === "ADMIN" && <ShellLink href="/admin" icon={Shield}>Administración</ShellLink>}
        </nav>
        <div className="mt-auto rounded-2xl border border-line bg-white/3 p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 text-sm font-bold text-cream">{initials(user.displayName)}</span>
            <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{user.displayName}</strong><span className="block truncate text-[11px] text-muted">@{user.username}</span></div>
          </div>
          <form action={logoutAction} className="mt-3"><Button variant="ghost" size="sm" className="w-full justify-start"><LogOut /> Cerrar sesión</Button></form>
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-line bg-ink/85 px-5 backdrop-blur-xl lg:px-8">
          <div className="lg:hidden"><Logo compact /></div>
          <div className="hidden items-center gap-2 text-xs text-muted lg:flex"><Swords className="size-4 text-gold" /> <span>Diario de expedición de</span><strong className="text-cream">{user.displayName}</strong></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden rounded-full border border-line bg-white/3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-muted sm:inline">{user.role === "ADMIN" ? "Administrador" : "Aventurero"}</span><span className="grid size-9 place-items-center rounded-xl bg-emerald-900 text-xs font-bold">{initials(user.displayName)}</span></div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-7 pb-28 sm:px-6 lg:px-9 lg:py-9">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 rounded-2xl border border-line bg-[#111814]/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        <MobileLink href="/app" icon={LayoutGrid}>Capas</MobileLink><MobileLink href="/app/comp" icon={Crown}>Comp</MobileLink>{user.role === "ADMIN" ? <MobileLink href="/admin" icon={Shield}>Admin</MobileLink> : <form action={logoutAction}><button className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-muted"><LogOut className="size-4" /> Salir</button></form>}
      </nav>
    </div>
  );
}

function ShellLink({ href, icon: Icon, children }: { href: string; icon: typeof Crown; children: React.ReactNode }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-muted transition hover:bg-white/5 hover:text-cream"><Icon className="size-4 text-gold" />{children}</Link>;
}
function MobileLink({ href, icon: Icon, children }: { href: string; icon: typeof Crown; children: React.ReactNode }) {
  return <Link href={href} className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-muted hover:bg-white/5 hover:text-cream"><Icon className="size-4" />{children}</Link>;
}
