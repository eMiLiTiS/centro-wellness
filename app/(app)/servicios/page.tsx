import { createClient } from "@/lib/supabase/server"
import { MonthDataProvider } from "@/components/servicios/month-data-provider"
import type { UserRole } from "@/lib/supabase/types"

export default async function ServiciosPage() {
  const supabase = await createClient()

  const [
    { data: { user } },
    { data: servicios },
    { data: profesionales },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("servicios_catalogo")
      .select("*")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("profesionales")
      .select("*")
      .eq("activo", true)
      .order("nombre"),
  ])

  const role = (user?.user_metadata?.role ?? "recepcion") as UserRole

  return (
    <MonthDataProvider
      servicios={servicios ?? []}
      profesionales={profesionales ?? []}
      role={role}
    />
  )
}
