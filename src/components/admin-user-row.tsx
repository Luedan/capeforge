"use client";

import { useTransition } from "react";
import { LoaderCircle, Shield, UserRoundCheck, UserRoundX } from "lucide-react";
import { setUserActiveAction, setUserRoleAction } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { initials } from "@/lib/utils";

type AdminUser = { id: string; username: string; displayName: string; role: "ADMIN" | "USER"; isActive: boolean; createdAt: Date; _count: { progress: number } };

export function AdminUserRow({ user, currentUserId, totalComp }: { user: AdminUser; currentUserId: string; totalComp: number }) {
  const [pending, startTransition] = useTransition();
  const isSelf = user.id === currentUserId;
  const percent = totalComp ? Math.round((Math.min(user._count.progress, totalComp) / totalComp) * 100) : 0;

  return (
    <tr className="border-b border-line/70 last:border-0">
      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-900 text-xs font-bold">{initials(user.displayName)}</span><div><strong className="block text-sm">{user.displayName} {isSelf && <span className="text-xs font-normal text-muted">(tú)</span>}</strong><span className="text-xs text-muted">@{user.username}</span></div></div></td>
      <td className="px-4 py-4"><Badge tone={user.role === "ADMIN" ? "gold" : "neutral"}>{user.role === "ADMIN" ? "Administrador" : "Jugador"}</Badge></td>
      <td className="px-4 py-4"><Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "Activo" : "Desactivado"}</Badge></td>
      <td className="min-w-48 px-4 py-4"><div className="mb-1.5 flex justify-between text-[11px] text-muted"><span>Comp</span><span>{user._count.progress}/{totalComp}</span></div><Progress value={percent} /></td>
      <td className="px-4 py-4 text-xs text-muted">{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(user.createdAt)}</td>
      <td className="px-5 py-4"><div className="flex justify-end gap-2">{pending && <LoaderCircle className="mt-2 size-4 animate-spin text-gold" />}<Button variant="ghost" size="sm" disabled={pending || isSelf} onClick={() => startTransition(() => setUserRoleAction(user.id, user.role === "ADMIN" ? "USER" : "ADMIN"))}><Shield /> {user.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}</Button><Button variant={user.isActive ? "danger" : "secondary"} size="sm" disabled={pending || isSelf} onClick={() => startTransition(() => setUserActiveAction(user.id, !user.isActive))}>{user.isActive ? <UserRoundX /> : <UserRoundCheck />}{user.isActive ? "Desactivar" : "Activar"}</Button></div></td>
    </tr>
  );
}
