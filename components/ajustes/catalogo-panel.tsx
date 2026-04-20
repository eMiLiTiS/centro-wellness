"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Loader2, ToggleLeft, ToggleRight, Pencil, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  crearServicioCatalogo, actualizarServicioCatalogo, toggleServicioCatalogo,
} from "@/app/(app)/ajustes/actions"
import type { Database } from "@/lib/supabase/types"

type Servicio = Database["public"]["Tables"]["servicios_catalogo"]["Row"]

export function CatalogoPanel({ servicios }: { servicios: Servicio[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevaDuracion, setNuevaDuracion] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState("")
  const [editDuracion, setEditDuracion] = useState("")
  const [busqueda, setBusqueda] = useState("")

  const filtrados = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function handleCrear() {
    if (!nuevoNombre.trim()) return
    startTransition(async () => {
      const result = await crearServicioCatalogo({
        nombre: nuevoNombre.trim(),
        duracion_default: nuevaDuracion ? parseInt(nuevaDuracion, 10) : null,
      })
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Servicio creado" })
        setNuevoNombre("")
        setNuevaDuracion("")
      }
    })
  }

  function startEdit(s: Servicio) {
    setEditingId(s.id)
    setEditNombre(s.nombre)
    setEditDuracion(s.duracion_default ? String(s.duracion_default) : "")
  }

  function handleGuardar(id: string) {
    startTransition(async () => {
      const result = await actualizarServicioCatalogo(id, {
        nombre: editNombre.trim(),
        duracion_default: editDuracion ? parseInt(editDuracion, 10) : null,
      })
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        setEditingId(null)
      }
    })
  }

  function handleToggle(id: string, activo: boolean) {
    startTransition(async () => {
      const result = await toggleServicioCatalogo(id, !activo)
      if (result.error) toast({ title: "Error", description: result.error, variant: "destructive" })
    })
  }

  return (
    <div className="space-y-4">
      {/* Formulario nuevo */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Nombre del servicio"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="number"
          placeholder="Dur. (min)"
          value={nuevaDuracion}
          onChange={(e) => setNuevaDuracion(e.target.value)}
          className="w-28"
        />
        <Button onClick={handleCrear} disabled={isPending || !nuevoNombre.trim()} size="sm">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Añadir
        </Button>
      </div>

      {/* Búsqueda */}
      <Input
        placeholder="Buscar en catálogo…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-sm"
      />
      <p className="text-xs text-muted-foreground">{filtrados.length} de {servicios.length} servicios</p>

      {/* Lista */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {filtrados.map((s) => (
          <Card key={s.id} className={!s.activo ? "opacity-50" : ""}>
            <CardContent className="flex items-center gap-2 p-2.5">
              {editingId === s.id ? (
                <>
                  <Input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="h-7 text-sm flex-1"
                  />
                  <Input
                    type="number"
                    value={editDuracion}
                    onChange={(e) => setEditDuracion(e.target.value)}
                    placeholder="min"
                    className="h-7 text-sm w-20"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600"
                    onClick={() => handleGuardar(s.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm flex-1 truncate">{s.nombre}</span>
                  {s.duracion_default && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {s.duracion_default} min
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                    onClick={() => startEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                    onClick={() => handleToggle(s.id, s.activo)} disabled={isPending}
                    title={s.activo ? "Desactivar" : "Activar"}>
                    {s.activo
                      ? <ToggleRight className="h-4 w-4 text-primary" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
