"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { VentaFormValues } from "@/lib/validators/venta-schema"

type ActionResult = { error: string | null }

export async function crearVenta(
  data: VentaFormValues & { mes: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase.from("ventas").insert({
    fecha: data.fecha,
    producto: data.producto,
    cantidad: data.cantidad,
    importe_unitario: data.importe_unitario,
    pago: data.pago,
    profesional_id: data.profesional_id,
    profesional_nombre: data.profesional_nombre,
    mes: data.mes,
  })

  if (error) return { error: error.message }

  revalidatePath("/ventas")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function actualizarVenta(
  id: string,
  data: VentaFormValues & { mes: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }
  if (user.user_metadata?.role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase
    .from("ventas")
    .update({
      fecha: data.fecha,
      producto: data.producto,
      cantidad: data.cantidad,
      importe_unitario: data.importe_unitario,
      pago: data.pago,
      profesional_id: data.profesional_id,
      profesional_nombre: data.profesional_nombre,
      mes: data.mes,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/ventas")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function eliminarVenta(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }
  if (user.user_metadata?.role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase.from("ventas").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/ventas")
  revalidatePath("/dashboard")
  return { error: null }
}
