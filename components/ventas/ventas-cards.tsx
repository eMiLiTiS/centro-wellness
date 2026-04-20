"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { formatEUR, isoToDisplay } from "@/lib/format"
import { eliminarVenta } from "@/app/(app)/ventas/actions"
import { useToast } from "@/hooks/use-toast"
import { VentasForm } from "./ventas-form"
import type { Database, UserRole } from "@/lib/supabase/types"

type Venta = Database["public"]["Tables"]["ventas"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface VentasCardsProps {
  ventas: Venta[]
  profesionales: Profesional[]
  productosAnteriores: string[]
  mes: string
  role: UserRole
}

export function VentasCards({
  ventas,
  profesionales,
  productosAnteriores,
  mes,
  role,
}: VentasCardsProps) {
  const { toast } = useToast()
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const canEdit = role === "admin"

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

  if (!ventas.length) {
    return <p className="text-center py-12 text-muted-foreground text-sm">Sin ventas para este mes</p>
  }

  return (
    <>
      <div className="space-y-3">
        {ventas.map((v) => (
          <Card key={v.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{v.producto}</p>
                  <p className="text-xs text-muted-foreground">{v.cantidad} ud{v.cantidad !== 1 && "s"}. × {formatEUR(v.importe_unitario)}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">
                      {formatEUR(Number(v.importe_unitario) * v.cantidad)}
                    </span>
                    <Badge variant="secondary" className="text-xs">{v.pago}</Badge>
                    <span className="text-xs text-muted-foreground">{v.profesional_nombre}</span>
                    <span className="text-xs text-muted-foreground">{isoToDisplay(v.fecha)}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingVenta(v)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(v.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
