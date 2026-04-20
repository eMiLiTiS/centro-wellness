"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { tarjetaSchema, type TarjetaFormValues } from "@/lib/validators/tarjeta-schema"
import { FORMAS_PAGO } from "@/lib/validators/servicio-schema"
import type { Database } from "@/lib/supabase/types"
import { crearTarjeta, actualizarTarjeta } from "@/app/(app)/tarjetas/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { formatEUR } from "@/lib/format"

type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]
type Tarjeta = Database["public"]["Tables"]["tarjetas_regalo"]["Row"]

interface TarjetasFormProps {
  profesionales: Profesional[]
  mes: string
  tarjeta?: Tarjeta | null
  onSuccess?: () => void
}

export function TarjetasForm({ profesionales, mes, tarjeta, onSuccess }: TarjetasFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isEditing = Boolean(tarjeta)

  const form = useForm<TarjetaFormValues>({
    resolver: zodResolver(tarjetaSchema),
    defaultValues: tarjeta
      ? {
          fecha: tarjeta.fecha,
          descripcion: tarjeta.descripcion,
          cantidad: tarjeta.cantidad,
          importe_unitario: tarjeta.importe_unitario,
          pago: tarjeta.pago as TarjetaFormValues["pago"],
          profesional_id: tarjeta.profesional_id ?? "",
          profesional_nombre: tarjeta.profesional_nombre,
        }
      : {
          fecha: format(new Date(), "yyyy-MM-dd"),
          descripcion: "",
          cantidad: 1,
          importe_unitario: 0,
          pago: "Efectivo",
          profesional_id: "",
          profesional_nombre: "",
        },
  })

  const profesionalOptions = profesionales
    .filter((p) => p.activo)
    .map((p) => ({ value: p.id, label: p.nombre }))

  const cantidad = form.watch("cantidad")
  const importeUnitario = form.watch("importe_unitario")
  const totalCalculado = (Number(cantidad) || 0) * (Number(importeUnitario) || 0)

  function onSubmit(values: TarjetaFormValues) {
    startTransition(async () => {
      const result = isEditing && tarjeta
        ? await actualizarTarjeta(tarjeta.id, { ...values, mes })
        : await crearTarjeta({ ...values, mes })

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: isEditing ? "Tarjeta actualizada" : "Tarjeta registrada" })
      if (!isEditing) form.reset()
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Input placeholder="Ej: Masaje + Facial" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="importe_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor unitario (€)</FormLabel>
                <FormControl><Input type="number" step="0.01" min={0} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Total</FormLabel>
            <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted text-sm font-semibold text-primary">
              {formatEUR(totalCalculado)}
            </div>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FORMAS_PAGO.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profesional_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profesional</FormLabel>
                <FormControl>
                  <Combobox
                    options={profesionalOptions}
                    value={field.value}
                    onSelect={(opt) => {
                      field.onChange(opt.value)
                      form.setValue("profesional_nombre", opt.label)
                    }}
                    placeholder="Selecciona profesional…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Guardar cambios" : "Registrar tarjeta"}
        </Button>
      </form>
    </Form>
  )
}
