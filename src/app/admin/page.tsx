import type { Metadata } from "next";
import { Shield, UserRoundCheck, Users } from "lucide-react";
import { AdminUserRow } from "@/components/admin-user-row";
import { Badge } from "@/components/ui/badge";
import { getAdminDashboard } from "@/data/dashboard";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminPage() {
  const current = await requireAdmin();
  const data = await getAdminDashboard();
  return (
    <div>
      <div><span className="eyebrow"><Shield className="size-3.5" /> Control de la comunidad</span><h1 className="mt-3 font-display text-4xl sm:text-5xl">Sala de administradores.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Gestiona quién entra a la expedición y qué jugadores pueden ayudarte a mantener el campamento.</p></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3"><Stat icon={Users} label="Cuentas" value={data.users.length} /><Stat icon={UserRoundCheck} label="Activas" value={data.activeUsers} /><Stat icon={Shield} label="Administradores" value={data.admins} /></div>
      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface/75">
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-display text-2xl">Jugadores</h2><p className="mt-1 text-xs text-muted">Si alguien pierde sus códigos, genera un paquete nuevo y entrégaselo por un canal privado.</p></div><Badge tone="green">Registro abierto</Badge></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-left"><thead><tr className="border-b border-line bg-black/10 text-[10px] uppercase tracking-[.14em] text-muted"><th className="px-5 py-3">Jugador</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Progreso</th><th className="px-4 py-3">Registro</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody>{data.users.map((user) => <AdminUserRow key={user.id} user={user} currentUserId={current.id} totalComp={data.totalComp} />)}</tbody></table></div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-5"><span className="grid size-10 place-items-center rounded-xl bg-gold/10 text-gold-light"><Icon className="size-5" /></span><div><span className="text-xs text-muted">{label}</span><strong className="block font-display text-2xl">{value}</strong></div></div>; }
