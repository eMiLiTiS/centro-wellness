"use client"

import Link from "next/link"
import { Clock, Settings, Brain, LogOut } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function MasPage() {
  const role = useAuthStore((s) => s.role)

  const items = [
    ...(role === "admin"
      ? [
          { href: "/horas", label: "Horas disponibles", icon: Clock },
          { href: "/analisis", label: "Análisis IA", icon: Brain },
          { href: "/ajustes", label: "Ajustes", icon: Settings },
        ]
      : []),
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Más opciones</h1>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 p-4 w-full rounded-xl border border-border bg-card hover:bg-muted transition-colors text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </div>
  )
}
