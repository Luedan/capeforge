"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink } from "lucide-react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TaskDetailDialog, TaskDetailTrigger } from "@/components/task-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CatalogTask } from "@/data/catalog";

type SortKey = "name" | "category" | "subcategory";
type Direction = "asc" | "desc";

export function TaskDataTable({ data, page, pageCount, total, sort, direction, query }: {
  data: CatalogTask[];
  page: number;
  pageCount: number;
  total: number;
  sort: SortKey;
  direction: Direction;
  query: { q?: string; category?: string; scope?: string; pageSize: number };
}) {
  const router = useRouter();

  function navigate(updates: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    Object.entries({ ...query, sort, direction, page, ...updates }).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && !(key === "scope" && value === "all")) params.set(key, String(value));
    });
    router.push(`/app/tareas?${params.toString()}`);
  }

  function sortBy(key: SortKey) {
    navigate({ sort: key, direction: sort === key && direction === "asc" ? "desc" : "asc", page: 1 });
  }

  const columns = useMemo<ColumnDef<CatalogTask>[]>(() => [
    {
      accessorKey: "name",
      header: () => <SortButton label="Logro" active={sort === "name"} direction={direction} onClick={() => sortBy("name")} />,
      cell: ({ row }) => <TaskDetailDialog task={row.original}><TaskDetailTrigger className="rounded-lg py-1"><strong className="block text-sm text-cream transition hover:text-gold-light">{row.original.name}</strong><span className="mt-1 block max-w-xl line-clamp-2 text-xs leading-5 text-muted">{row.original.compInstructions ?? row.original.description ?? "Sin descripción disponible."}</span></TaskDetailTrigger></TaskDetailDialog>,
    },
    {
      accessorKey: "category",
      header: () => <SortButton label="Categoría" active={sort === "category"} direction={direction} onClick={() => sortBy("category")} />,
      cell: ({ row }) => <div><Badge>{row.original.category ?? "General"}</Badge>{row.original.subcategory && <span className="mt-1.5 block max-w-40 truncate text-[10px] text-muted">{row.original.subcategory}</span>}</div>,
    },
    {
      accessorKey: "subcategory",
      header: () => <SortButton label="Ruta" active={sort === "subcategory"} direction={direction} onClick={() => sortBy("subcategory")} />,
      cell: ({ row }) => <span className="text-xs text-muted">{[row.original.subcategory, row.original.subsubcategory].filter(Boolean).join(" · ") || "—"}</span>,
    },
    {
      id: "capes",
      header: "Capa",
      cell: ({ row }) => row.original.capes.length ? <div className="flex flex-wrap gap-1"><Badge tone="green">{row.original.capes.map((cape) => cape.shortName).join(", ")}</Badge></div> : <span className="text-xs text-muted">Catálogo RS3</span>,
    },
    {
      id: "status",
      header: "Tu estado",
      cell: ({ row }) => <Badge tone={row.original.completedAt ? "green" : "neutral"}>{row.original.completedAt ? "Completada" : "Pendiente"}</Badge>,
    },
    {
      id: "wiki",
      header: () => <span className="sr-only">Wiki</span>,
      cell: ({ row }) => row.original.wikiUrl ? <a href={row.original.wikiUrl} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-gold" aria-label={`Abrir ${row.original.name} en la Wiki`}><ExternalLink className="size-4" /></a> : null,
    },
  // The URL is the source of truth; a navigation recreates this table with the new values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [sort, direction]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  const first = total ? (page - 1) * query.pageSize + 1 : 0;
  const last = Math.min(page * query.pageSize, total);

  return (
    <div>
      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <Table>
          <TableHeader><TableRow className="bg-black/15">{table.getHeaderGroups().map((group) => group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow></TableHeader>
          <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted">No encontramos tareas con estos filtros.</TableCell></TableRow>}</TableBody>
        </Table>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line md:hidden">
        {data.map((task) => <article key={task.id} className="bg-surface/45 p-4"><div className="flex items-start justify-between gap-3"><TaskDetailDialog task={task}><TaskDetailTrigger className="rounded-lg"><strong className="block text-sm text-cream">{task.name}</strong><span className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{task.compInstructions ?? task.description}</span></TaskDetailTrigger></TaskDetailDialog>{task.wikiUrl && <a href={task.wikiUrl} target="_blank" rel="noreferrer" className="grid size-9 shrink-0 place-items-center rounded-xl text-gold" aria-label="Abrir Wiki"><ExternalLink className="size-4" /></a>}</div><div className="mt-3 flex flex-wrap gap-1.5"><Badge>{task.category ?? "General"}</Badge>{task.capes.length > 0 && <Badge tone="green">{task.capes.map((cape) => cape.shortName).join(", ")}</Badge>}<Badge tone={task.completedAt ? "green" : "neutral"}>{task.completedAt ? "Completada" : "Pendiente"}</Badge></div></article>)}
        {!data.length && <div className="p-12 text-center text-sm text-muted">No encontramos tareas con estos filtros.</div>}
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-line bg-surface/45 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted">Mostrando <strong className="text-cream">{first}–{last}</strong> de <strong className="text-cream">{total.toLocaleString("es-CO")}</strong> tareas</div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="mr-2 flex items-center gap-2 text-xs text-muted">Por página <select className="select-field h-9 py-1" value={query.pageSize} onChange={(event) => navigate({ pageSize: event.target.value, page: 1 })}><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label>
          <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => navigate({ page: 1 })} aria-label="Primera página"><ChevronsLeft /></Button>
          <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => navigate({ page: page - 1 })} aria-label="Página anterior"><ChevronLeft /></Button>
          <span className="min-w-24 text-center text-xs text-muted">{page} / {pageCount}</span>
          <Button variant="ghost" size="icon" disabled={page >= pageCount} onClick={() => navigate({ page: page + 1 })} aria-label="Página siguiente"><ChevronRight /></Button>
          <Button variant="ghost" size="icon" disabled={page >= pageCount} onClick={() => navigate({ page: pageCount })} aria-label="Última página"><ChevronsRight /></Button>
        </div>
      </div>
    </div>
  );
}

function SortButton({ label, active, direction, onClick }: { label: string; active: boolean; direction: Direction; onClick: () => void }) {
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 transition hover:text-cream">{label}<Icon className="size-3" /></button>;
}
