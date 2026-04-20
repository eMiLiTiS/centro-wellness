import { createClient } from "@/lib/supabase/server"
import { VentasMonthProvider } from "@/components/ventas/month-data-provider"
import type { UserRole } from "@/lib/supabase/types"

export default async function VentasPage() {
  const supabase = await createClient()
  const [{ data: { user } }, { data: profesionales }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profesionales").select("*").eq("activo", true).order("nombre"),
  ])

  const role = (user?.user_metadata?.role ?? "recepcion") as UserRole

  return (
    <VentasMonthProvider
      profesionales={profesionales ?? []}
      role={role}
    />
  )
}
