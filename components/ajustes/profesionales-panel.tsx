"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Loader2, UserCheck, UserX, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  crearProfesional, toggleProfesional, eliminarProfesional,
} from "@/app/(app)/ajustes/actions"
import type { Database } from "@/lib/supabase/types"

type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

export function ProfesionalesPanel({ profesionales }: { profesionales: Profesional[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleCrear() {
    if (!nuevoNombre.trim()) return
    startTransition(async () => {
      const result = await crearProfesional(nuevoNombre.trim())
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Profesional creado" })
        setNuevoNombre("")
      }
    })
  }

  function handleToggle(id: string, activo: boolean) {
    startTransition(async () => {
      const result = await toggleProfesional(id, !activo)
      if (result.error) toast({ title: "Error", description: result.error, variant: "destructive" })
    })
  }

  async function handleEliminar() {
    if (!deletingId) return
    const result = await eliminarProfesional(deletingId)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Profesional eliminado" })
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nombre del profesional"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCrear()}
          className="max-w-xs"
        />
        <Button onClick={handleCrear} disabled={isPending || !nuevoNombre.trim()} size="sm">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Añadir
        </Button>
      </div>

      <div className="space-y-2">
        {profesionales.map((p) => (
          <Card key={p.id} className={!p.activo ? "opacity-50" : ""}>
            <CardContent className="flex items-center justify-between p-3">
              <span className="text-sm font-medium">{p.nombre}</span>
              <div className="flex items-center gap-2">
                <Badge variant={p.activo ? "default" : "secondary"} className="text-xs">
                  {p.activo ? "Activo" : "Inactivo"}
                </Badge>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => handleToggle(p.id, p.activo)}
                  disabled={isPending}
                  title={p.activo ? "Desactivar" : "Activar"}
                >
                  {p.activo
                    ? <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                    : <UserCheck className="h-3.5 w-3.5 text-green-500" />}
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                  onClick={() => setDeletingId(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(deletingId)} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar profesional</DialogTitle>
            <DialogDescription>
              Se eliminará el profesional. Los registros históricos mantendrán el nombre guardado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleEliminar}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
