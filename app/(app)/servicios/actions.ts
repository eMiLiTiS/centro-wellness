"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { RegistroFormValues } from "@/lib/validators/servicio-schema"

type ActionResult = { error: string | null }

export async function crearRegistro(
  data: RegistroFormValues & { mes: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "No autenticado" }

  const { error } = await supabase.from("registros").insert({
    fecha: data.fecha,
    cliente: data.cliente,
    servicio_id: data.servicio_id,
    servicio_nombre: data.servicio_nombre,
    duracion: data.duracion,
    tarifa: data.tarifa,
    importe: data.importe,
    pago: data.pago,
    profesional_id: data.profesional_id,
    profesional_nombre: data.profesional_nombre,
    mes: data.mes,
  })

  if (error) return { error: error.message }

  revalidatePath("/servicios")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function actualizarRegistro(
  id: string,
  data: RegistroFormValues & { mes: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "No autenticado" }

  const role = user.user_metadata?.role
  if (role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase
    .from("registros")
    .update({
      fecha: data.fecha,
      cliente: data.cliente,
      servicio_id: data.servicio_id,
      servicio_nombre: data.servicio_nombre,
      duracion: data.duracion,
      tarifa: data.tarifa,
      importe: data.importe,
      pago: data.pago,
      profesional_id: data.profesional_id,
      profesional_nombre: data.profesional_nombre,
      mes: data.mes,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/servicios")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function eliminarRegistro(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "No autenticado" }

  const role = user.user_metadata?.role
  if (role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase.from("registros").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/servicios")
  revalidatePath("/dashboard")
  return { error: null }
}
