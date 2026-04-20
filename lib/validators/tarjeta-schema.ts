import { z } from "zod"
import { FORMAS_PAGO } from "./servicio-schema"

export const tarjetaSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  descripcion: z.string().min(1, "Requerido"),
  cantidad: z.coerce.number().int().positive("Cantidad inválida"),
  importe_unitario: z.coerce.number().positive("Importe inválido"),
  pago: z.enum(FORMAS_PAGO, { required_error: "Selecciona forma de pago" }),
  profesional_id: z.string().uuid("Selecciona un profesional"),
  profesional_nombre: z.string().min(1),
})

export type TarjetaFormValues = z.infer<typeof tarjetaSchema>
