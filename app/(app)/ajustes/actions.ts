"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { error: string | null }

// ─── Profesionales ────────────────────────────────────────────────────────────

export async function crearProfesional(nombre: string): Promise<ActionResult> {
  const supabase = await createClient()
  if ((await supabase.auth.getUser()).data.user?.user_metadata?.role !== "admin")
    return { error: "Sin permisos" }

  const { error } = await supabase.from("profesionales").insert({ nombre })
  if (error) return { error: error.message }
  revalidatePath("/ajustes")
  return { error: null }
}

export async function toggleProfesional(id: string, activo: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  if ((await supabase.auth.getUser()).data.user?.user_metadata?.role !== "admin")
    return { error: "Sin permisos" }

  const { error } = await supabase.from("profesionales").update({ activo }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/ajustes")
  return { error: null }
}

export async function eliminarProfesional(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  if ((await supabase.auth.getUser()).data.user?.user_metadata?.role !== "admin")
    return { error: "Sin permisos" }

  const { error } = await supabase.from("profesionales").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/ajustes")
  return { error: null }
}

// ─── Catálogo de servicios ────────────────────────────────────────────────────

export async function crearServicioCatalogo(data: {
  nombre: string
  duracion_default: number | null
}): Promise<ActionResult> {
  const supabase = await createClient()
  if ((await supabase.auth.getUser()).data.user?.user_metadata?.role !== "admin")
    return { error: "Sin permisos" }

  const { error } = await supabase.from("servicios_catalogo").insert(data)
  if (error) return { error: error.message }
  revalidatePath("/ajustes")
  return { error: null }
}

export async function actualizarServicioCatalogo(
  id: string,
  data: { nombre: string; duracion_default: number | null }
): Promise<ActionResult> {
  const supabase = await createClient()
  if ((await supabase.auth.getUser()).data.user?.user_metadata?.role !== "admin")
    return { error: "Sin permisos" }

  const { error } = await supabase.from("servicios_catalogo").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/ajustes")
  return { error: null }
}

export async function toggleServicioCatalogo(id: string, activo: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  if ((await supabase.auth.getUser()).data.user?.user_metadata?.role !== "admin")
    return { error: "Sin permisos" }

  const { error } = await supabase.from("servicios_catalogo").update({ activo }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/ajustes")
  return { error: null }
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export async function invitarUsuario(
  email: string,
  role: "admin" | "recepcion"
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.user_metadata?.role !== "admin") return { error: "Sin permisos" }

  // Crear usuario con service role (desde cliente browser limitado)
  // La creación real se hace desde API route para usar service_role key
  const response = await fetch("/api/admin/crear-usuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  })
  const result = await response.json()
  return { error: result.error ?? null }
}
