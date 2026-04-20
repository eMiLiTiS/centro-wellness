"use server"

import { createClient } from "@/lib/supabase/server"

type ActionResult = { error: string | null }

export async function upsertHoras(
  profesionalId: string,
  mes: string,
  horas: number
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }
  if (user.user_metadata?.role !== "admin") return { error: "Sin permisos" }

  const { error } = await supabase
    .from("horas_disponibles")
    .upsert(
      { profesional_id: profesionalId, mes, horas },
      { onConflict: "profesional_id,mes" }
    )

  if (error) return { error: error.message }
  return { error: null }
}
