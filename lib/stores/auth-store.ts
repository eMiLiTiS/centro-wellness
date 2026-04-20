import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/supabase/types"

interface AuthState {
  user: User | null
  role: UserRole | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) =>
    set({
      user,
      role: (user?.user_metadata?.role as UserRole) ?? null,
    }),
}))
