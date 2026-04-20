import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const { email, role } = await request.json() as { email: string; role: "admin" | "recepcion" }

  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ error: null })
}
