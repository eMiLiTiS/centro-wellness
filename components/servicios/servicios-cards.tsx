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
import { eliminarRegistro } from "@/app/(app)/servicios/actions"
import { useToast } from "@/hooks/use-toast"
import { ServiciosForm } from "./servicios-form"
import type { Database, UserRole } from "@/lib/supabase/types"

type Registro = Database["public"]["Tables"]["registros"]["Row"]
type Servicio = Database["public"]["Tables"]["servicios_catalogo"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface ServiciosCardsProps {
  registros: Registro[]
  servicios: Servicio[]
  profesionales: Profesional[]
  mes: string
  role: UserRole
}

export function ServiciosCards({
  registros,
  servicios,
  profesionales,
  mes,
  role,
}: ServiciosCardsProps) {
  const { toast } = useToast()
  const [editingRegistro, setEditingRegistro] = useState<Registro | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const canEdit = role === "admin"

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

  if (!registros.length) {
    return (
      <p className="text-center py-12 text-muted-foreground text-sm">
        Sin registros para este mes
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {registros.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.cliente}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.servicio_nombre}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">
                      {formatEUR(r.importe)}
                    </span>
                    <Badge variant="secondary" className="text-xs">{r.pago}</Badge>
                    <span className="text-xs text-muted-foreground">{r.profesional_nombre}</span>
                    <span className="text-xs text-muted-foreground">{isoToDisplay(r.fecha)}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingRegistro(r)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeletingId(r.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      <Dialog open={Boolean(deletingId)} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
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
    </>
  )
}
