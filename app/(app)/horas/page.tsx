import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HorasGrid } from "@/components/horas/horas-grid"

export default async function HorasPage() {
  const supabase = await createClient()
  const [{ data: { user } }, { data: profesionales }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profesionales").select("*").eq("activo", true).order("nombre"),
  ])

  if (user?.user_metadata?.role !== "admin") redirect("/dashboard")

  return <HorasGrid profesionales={profesionales ?? []} />
}
