import { createClient } from "@/lib/supabase/server"
import { TarjetasMonthProvider } from "@/components/tarjetas/month-data-provider"
import type { UserRole } from "@/lib/supabase/types"

export default async function TarjetasPage() {
  const supabase = await createClient()
  const [{ data: { user } }, { data: profesionales }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profesionales").select("*").eq("activo", true).order("nombre"),
  ])

  const role = (user?.user_metadata?.role ?? "recepcion") as UserRole

  return (
    <TarjetasMonthProvider
      profesionales={profesionales ?? []}
      role={role}
    />
  )
}
