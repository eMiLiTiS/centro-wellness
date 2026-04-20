"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ventaSchema, type VentaFormValues } from "@/lib/validators/venta-schema"
import { FORMAS_PAGO } from "@/lib/validators/servicio-schema"
import type { Database } from "@/lib/supabase/types"
import { crearVenta, actualizarVenta } from "@/app/(app)/ventas/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TotalField } from "@/components/ui/total-field"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]
type Venta = Database["public"]["Tables"]["ventas"]["Row"]

interface VentasFormProps {
  profesionales: Profesional[]
  productosAnteriores: string[]
  mes: string
  venta?: Venta | null
  onSuccess?: () => void
}

export function VentasForm({
  profesionales,
  productosAnteriores,
  mes,
  venta,
  onSuccess,
}: VentasFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isEditing = Boolean(venta)

  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: venta
      ? {
          fecha: venta.fecha,
          producto: venta.producto,
          cantidad: venta.cantidad,
          importe_unitario: venta.importe_unitario,
          pago: venta.pago as VentaFormValues["pago"],
          profesional_id: venta.profesional_id ?? "",
          profesional_nombre: venta.profesional_nombre,
        }
      : {
          fecha: format(new Date(), "yyyy-MM-dd"),
          producto: "",
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

  function onSubmit(values: VentaFormValues) {
    startTransition(async () => {
      const result = isEditing && venta
        ? await actualizarVenta(venta.id, { ...values, mes })
        : await crearVenta({ ...values, mes })

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: isEditing ? "Venta actualizada" : "Venta registrada" })
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
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="producto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto</FormLabel>
                <FormControl>
                  <AutocompleteInput
                    placeholder="Nombre del producto"
                    suggestions={productosAnteriores}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
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
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="importe_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio unitario (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TotalField value={totalCalculado} />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FORMAS_PAGO.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
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
          {isEditing ? "Guardar cambios" : "Registrar venta"}
        </Button>
      </form>
    </Form>
  )
}
