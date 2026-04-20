import { createClient } from "@/lib/supabase/server"
import { MonthSelector } from "./month-selector"
import type { UserRole } from "@/lib/supabase/types"

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user?.user_metadata?.role ?? "recepcion") as UserRole

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border">
      <MonthSelector role={role} />
      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-xs text-muted-foreground">
          {user?.email}
        </span>
        <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium capitalize">
          {role}
        </span>
      </div>
    </header>
  )
}
