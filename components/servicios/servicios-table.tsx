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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/types"
import { formatEUR, isoToDisplay } from "@/lib/format"
import { eliminarRegistro } from "@/app/(app)/servicios/actions"
import { useToast } from "@/hooks/use-toast"
import { ServiciosForm } from "./servicios-form"
import type { UserRole } from "@/lib/supabase/types"

type Registro = Database["public"]["Tables"]["registros"]["Row"]
type Servicio = Database["public"]["Tables"]["servicios_catalogo"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface ServiciosTableProps {
  registros: Registro[]
  servicios: Servicio[]
  profesionales: Profesional[]
  mes: string
  role: UserRole
}

export function ServiciosTable({
  registros,
  servicios,
  profesionales,
  mes,
  role,
}: ServiciosTableProps) {
  const { toast } = useToast()
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "fecha", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [editingRegistro, setEditingRegistro] = React.useState<Registro | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const canEdit = role === "admin"

  const columns: ColumnDef<Registro>[] = [
    {
      accessorKey: "fecha",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => isoToDisplay(row.getValue("fecha")),
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
    },
    {
      accessorKey: "servicio_nombre",
      header: "Servicio",
    },
    {
      accessorKey: "duracion",
      header: "Min",
      cell: ({ row }) => `${row.getValue("duracion")} min`,
    },
    {
      accessorKey: "importe",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Importe <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => formatEUR(row.getValue("importe")),
    },
    {
      accessorKey: "pago",
      header: "Pago",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("pago")}</Badge>
      ),
    },
    {
      accessorKey: "profesional_nombre",
      header: "Profesional",
    },
    ...(canEdit
      ? [
          {
            id: "acciones",
            header: "",
            cell: ({ row }: { row: { original: Registro } }) => (
              <div className="flex gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingRegistro(row.original)}
                  aria-label="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(row.original.id)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as ColumnDef<Registro>,
        ]
      : []),
  ]

  const table = useReactTable({
    data: registros,
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
    const result = await eliminarRegistro(deletingId)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Registro eliminado" })
    }
    setDeleting(false)
    setDeletingId(null)
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar cliente, servicio, profesional…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                  Sin registros para este mes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} registro
          {table.getFilteredRowModel().rows.length !== 1 && "s"}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Dialog editar */}
      <Dialog open={Boolean(editingRegistro)} onOpenChange={(o) => !o && setEditingRegistro(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
          </DialogHeader>
          {editingRegistro && (
            <ServiciosForm
              servicios={servicios}
              profesionales={profesionales}
              mes={mes}
              registro={editingRegistro}
              onSuccess={() => setEditingRegistro(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar borrado */}
      <Dialog open={Boolean(deletingId)} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Confirmas?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
