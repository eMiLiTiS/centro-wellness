"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Database, UserRole } from "@/lib/supabase/types"
import { formatEUR, isoToDisplay } from "@/lib/format"
import { eliminarVenta } from "@/app/(app)/ventas/actions"
import { useToast } from "@/hooks/use-toast"
import { VentasForm } from "./ventas-form"

type Venta = Database["public"]["Tables"]["ventas"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface VentasTableProps {
  ventas: Venta[]
  profesionales: Profesional[]
  productosAnteriores: string[]
  mes: string
  role: UserRole
}

export function VentasTable({
  ventas,
  profesionales,
  productosAnteriores,
  mes,
  role,
}: VentasTableProps) {
  const { toast } = useToast()
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "fecha", desc: true }])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [editingVenta, setEditingVenta] = React.useState<Venta | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const canEdit = role === "admin"

  const columns: ColumnDef<Venta>[] = [
    {
      accessorKey: "fecha",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => isoToDisplay(row.getValue("fecha")),
    },
    { accessorKey: "producto", header: "Producto" },
    { accessorKey: "cantidad", header: "Uds." },
    {
      accessorKey: "importe_unitario",
      header: "Precio ud.",
      cell: ({ row }) => formatEUR(row.getValue("importe_unitario")),
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) =>
        formatEUR(Number(row.original.importe_unitario) * row.original.cantidad),
    },
    {
      accessorKey: "pago",
      header: "Pago",
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("pago")}</Badge>,
    },
    { accessorKey: "profesional_nombre", header: "Profesional" },
    ...(canEdit
      ? [
          {
            id: "acciones",
            header: "",
            cell: ({ row }: { row: { original: Venta } }) => (
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingVenta(row.original)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingId(row.original.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as ColumnDef<Venta>,
        ]
      : []),
  ]

  const table = useReactTable({
    data: ventas,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    const result = await eliminarVenta(deletingId)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Venta eliminada" })
    }
    setDeleting(false)
    setDeletingId(null)
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar producto, profesional…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Sin ventas para este mes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{table.getFilteredRowModel().rows.length} venta{table.getFilteredRowModel().rows.length !== 1 && "s"}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
        </div>
      </div>

      <Dialog open={Boolean(editingVenta)} onOpenChange={(o) => !o && setEditingVenta(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar venta</DialogTitle></DialogHeader>
          {editingVenta && (
            <VentasForm
              profesionales={profesionales}
              productosAnteriores={productosAnteriores}
              mes={mes}
              venta={editingVenta}
              onSuccess={() => setEditingVenta(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingId)} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar venta</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer. ¿Confirmas?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
