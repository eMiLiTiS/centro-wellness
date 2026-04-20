"use client"

import { useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { useAuthStore } from "@/lib/stores/auth-store"

interface AuthProviderProps {
  user: User | null
  children: React.ReactNode
}

export function AuthProvider({ user, children }: AuthProviderProps) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return <>{children}</>
}
