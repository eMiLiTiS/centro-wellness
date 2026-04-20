import { z } from "zod"
import { FORMAS_PAGO } from "./servicio-schema"

export const ventaSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  producto: z.string().min(1, "Requerido"),
  cantidad: z.coerce.number().int().positive("Cantidad inválida"),
  importe_unitario: z.coerce.number().positive("Importe inválido"),
  pago: z.enum(FORMAS_PAGO, { required_error: "Selecciona forma de pago" }),
  profesional_id: z.string().uuid("Selecciona un profesional"),
  profesional_nombre: z.string().min(1),
})

export type VentaFormValues = z.infer<typeof ventaSchema>
