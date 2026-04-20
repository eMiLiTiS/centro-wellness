import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalisisIA } from "@/components/analisis/analisis-ia"

export default async function AnalisisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role !== "admin") redirect("/dashboard")

  return <AnalisisIA />
}
