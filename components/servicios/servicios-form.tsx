"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { registroSchema, type RegistroFormValues, FORMAS_PAGO } from "@/lib/validators/servicio-schema"
import type { Database } from "@/lib/supabase/types"
import { crearRegistro, actualizarRegistro } from "@/app/(app)/servicios/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

type Servicio = Database["public"]["Tables"]["servicios_catalogo"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]
type Registro = Database["public"]["Tables"]["registros"]["Row"]

interface ServiciosFormProps {
  servicios: Servicio[]
  profesionales: Profesional[]
  mes: string
  registro?: Registro | null
  onSuccess?: () => void
}

export function ServiciosForm({
  servicios,
  profesionales,
  mes,
  registro,
  onSuccess,
}: ServiciosFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isEditing = Boolean(registro)

  const form = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: registro
      ? {
          fecha: registro.fecha,
          cliente: registro.cliente,
          servicio_id: registro.servicio_id ?? "",
          servicio_nombre: registro.servicio_nombre,
          duracion: registro.duracion,
          tarifa: registro.tarifa,
          importe: registro.importe,
          pago: registro.pago as RegistroFormValues["pago"],
          profesional_id: registro.profesional_id ?? "",
          profesional_nombre: registro.profesional_nombre,
        }
      : {
          fecha: format(new Date(), "yyyy-MM-dd"),
          cliente: "",
          servicio_id: "",
          servicio_nombre: "",
          duracion: 60,
          tarifa: "",
          importe: 0,
          pago: "Efectivo",
          profesional_id: "",
          profesional_nombre: "",
        },
  })

  const servicioOptions = servicios
    .filter((s) => s.activo)
    .map((s) => ({
      value: s.id,
      label: s.nombre,
      meta: { duracion_default: s.duracion_default },
    }))

  const profesionalOptions = profesionales
    .filter((p) => p.activo)
    .map((p) => ({ value: p.id, label: p.nombre }))

  function onSubmit(values: RegistroFormValues) {
    startTransition(async () => {
      const data = { ...values, mes }
      const result = isEditing && registro
        ? await actualizarRegistro(registro.id, data)
        : await crearRegistro(data)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: isEditing ? "Servicio actualizado" : "Servicio registrado",
      })
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
            name="cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="servicio_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servicio</FormLabel>
              <FormControl>
                <Combobox
                  options={servicioOptions}
                  value={field.value}
                  onSelect={(option) => {
                    field.onChange(option.value)
                    form.setValue("servicio_nombre", option.label)
                    const dur = option.meta?.duracion_default as number | null
                    if (dur) form.setValue("duracion", dur)
                  }}
                  placeholder="Buscar servicio…"
                  searchPlaceholder="Escribe para buscar…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="duracion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tarifa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarifa</FormLabel>
                <FormControl>
                  <Input placeholder="Normal, VIP…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="importe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Importe (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0,00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    onSelect={(option) => {
                      field.onChange(option.value)
                      form.setValue("profesional_nombre", option.label)
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
          {isEditing ? "Guardar cambios" : "Registrar servicio"}
        </Button>
      </form>
    </Form>
  )
}
