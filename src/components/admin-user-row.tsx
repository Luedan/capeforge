"use client";

import { useState, useTransition } from "react";
import { KeyRound, LoaderCircle, Shield, UserRoundCheck, UserRoundX } from "lucide-react";
import { regenerateUserRecoveryCodesAction, setUserActiveAction, setUserRoleAction } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RecoveryCodesPanel } from "@/components/recovery-codes-panel";
import { initials } from "@/lib/utils";

type AdminUser = { id: string; username: string; displayName: string; role: "ADMIN" | "USER"; isActive: boolean; createdAt: Date; _count: { progress: number; recoveryCodes: number } };

export function AdminUserRow({ user, currentUserId, totalComp }: { user: AdminUser; currentUserId: string; totalComp: number }) {
  const [pending, startTransition] = useTransition();
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const isSelf = user.id === currentUserId;
  const percent = totalComp ? Math.round((Math.min(user._count.progress, totalComp) / totalComp) * 100) : 0;

  function regenerateCodes() {
    if (!window.confirm(`Los códigos anteriores de @${user.username} dejarán de funcionar. ¿Generar un paquete nuevo?`)) return;
    startTransition(async () => {
      const result = await regenerateUserRecoveryCodesAction(user.id);
      setRecoveryCodes(result.codes);
    });
  }

  return <>
    <tr className="border-b border-line/70 last:border-0">
      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-900 text-xs font-bold">{initials(user.displayName)}</span><div><strong className="block text-sm">{user.displayName} {isSelf && <span className="text-xs font-normal text-muted">(tú)</span>}</strong><span className="text-xs text-muted">@{user.username}</span></div></div></td>
      <td className="px-4 py-4"><Badge tone={user.role === "ADMIN" ? "gold" : "neutral"}>{user.role === "ADMIN" ? "Administrador" : "Jugador"}</Badge></td>
      <td className="px-4 py-4"><Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "Activo" : "Desactivado"}</Badge></td>
      <td className="min-w-48 px-4 py-4"><div className="mb-1.5 flex justify-between text-[11px] text-muted"><span>Comp</span><span>{user._count.progress}/{totalComp}</span></div><Progress value={percent} /></td>
      <td className="px-4 py-4 text-xs text-muted">{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(user.createdAt)}</td>
      <td className="px-5 py-4"><div className="flex justify-end gap-2">{pending && <LoaderCircle className="mt-2 size-4 animate-spin text-gold" />}<Button variant="secondary" size="sm" disabled={pending || !user.isActive} onClick={regenerateCodes}><KeyRound /> Códigos ({user._count.recoveryCodes})</Button><Button variant="ghost" size="sm" disabled={pending || isSelf} onClick={() => startTransition(() => setUserRoleAction(user.id, user.role === "ADMIN" ? "USER" : "ADMIN"))}><Shield /> {user.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}</Button><Button variant={user.isActive ? "danger" : "secondary"} size="sm" disabled={pending || isSelf} onClick={() => startTransition(() => setUserActiveAction(user.id, !user.isActive))}>{user.isActive ? <UserRoundX /> : <UserRoundCheck />}{user.isActive ? "Desactivar" : "Activar"}</Button></div></td>
    </tr>
    {recoveryCodes && <tr className="border-b border-gold/15 bg-gold/[.025]"><td colSpan={6} className="p-5"><RecoveryCodesPanel codes={recoveryCodes} onDismiss={() => setRecoveryCodes(null)} /></td></tr>}
  </>;
}
