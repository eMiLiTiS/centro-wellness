"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TarjetaFormValues } from "@/lib/validators/tarjeta-schema"

type ActionResult = { error: string | null }

export async function crearTarjeta(
  data: TarjetaFormValues & { mes: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase.from("tarjetas_regalo").insert({
    fecha: data.fecha,
    descripcion: data.descripcion,
    cantidad: data.cantidad,
    importe_unitario: data.importe_unitario,
    pago: data.pago,
    profesional_id: data.profesional_id,
    profesional_nombre: data.profesional_nombre,
    mes: data.mes,
  })

  if (error) return { error: error.message }

  revalidatePath("/tarjetas")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function actualizarTarjeta(
  id: string,
  data: TarjetaFormValues & { mes: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }
  if (user.user_metadata?.role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase
    .from("tarjetas_regalo")
    .update({
      fecha: data.fecha,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      importe_unitario: data.importe_unitario,
      pago: data.pago,
      profesional_id: data.profesional_id,
      profesional_nombre: data.profesional_nombre,
      mes: data.mes,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/tarjetas")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function eliminarTarjeta(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }
  if (user.user_metadata?.role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase.from("tarjetas_regalo").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/tarjetas")
  revalidatePath("/dashboard")
  return { error: null }
}
