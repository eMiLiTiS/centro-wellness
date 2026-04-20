"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { formatEUR, isoToDisplay } from "@/lib/format"
import { eliminarTarjeta } from "@/app/(app)/tarjetas/actions"
import { useToast } from "@/hooks/use-toast"
import { TarjetasForm } from "./tarjetas-form"
import type { Database, UserRole } from "@/lib/supabase/types"

type Tarjeta = Database["public"]["Tables"]["tarjetas_regalo"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface TarjetasCardsProps {
  tarjetas: Tarjeta[]
  profesionales: Profesional[]
  mes: string
  role: UserRole
}

export function TarjetasCards({ tarjetas, profesionales, mes, role }: TarjetasCardsProps) {
  const { toast } = useToast()
  const [editingTarjeta, setEditingTarjeta] = useState<Tarjeta | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const canEdit = role === "admin"

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    const result = await eliminarTarjeta(deletingId)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Tarjeta eliminada" })
    }
    setDeleting(false)
    setDeletingId(null)
  }

  if (!tarjetas.length) {
    return <p className="text-center py-12 text-muted-foreground text-sm">Sin tarjetas para este mes</p>
  }

  return (
    <>
      <div className="space-y-3">
        {tarjetas.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.descripcion}</p>
                  <p className="text-xs text-muted-foreground">{t.cantidad} ud{t.cantidad !== 1 && "s"}. × {formatEUR(t.importe_unitario)}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">
                      {formatEUR(Number(t.importe_unitario) * t.cantidad)}
                    </span>
                    <Badge variant="secondary" className="text-xs">{t.pago}</Badge>
                    <span className="text-xs text-muted-foreground">{t.profesional_nombre}</span>
                    <span className="text-xs text-muted-foreground">{isoToDisplay(t.fecha)}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTarjeta(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(editingTarjeta)} onOpenChange={(o) => !o && setEditingTarjeta(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar tarjeta regalo</DialogTitle></DialogHeader>
          {editingTarjeta && (
            <TarjetasForm profesionales={profesionales} mes={mes} tarjeta={editingTarjeta} onSuccess={() => setEditingTarjeta(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingId)} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar tarjeta</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Eliminando…" : "Eliminar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
