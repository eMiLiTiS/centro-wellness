import { z } from "zod"

export const FORMAS_PAGO = ["Efectivo", "Tarjeta", "Bizum", "Transferencia"] as const

export const registroSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  cliente: z.string().min(1, "Requerido"),
  servicio_id: z.string().uuid("Selecciona un servicio"),
  servicio_nombre: z.string().min(1),
  duracion: z.coerce.number().int().positive("Duración inválida"),
  tarifa: z.string().min(1, "Requerido"),
  importe: z.coerce.number().positive("Importe inválido"),
  pago: z.enum(FORMAS_PAGO, { required_error: "Selecciona forma de pago" }),
  profesional_id: z.string().uuid("Selecciona un profesional"),
  profesional_nombre: z.string().min(1),
})

export type RegistroFormValues = z.infer<typeof registroSchema>
