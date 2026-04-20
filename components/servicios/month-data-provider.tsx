"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMonthStore } from "@/lib/stores/month-store"
import { ServiciosForm } from "./servicios-form"
import { ServiciosTable } from "./servicios-table"
import { ServiciosCards } from "./servicios-cards"
import { monthLabel } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import type { Database, UserRole } from "@/lib/supabase/types"

type Registro = Database["public"]["Tables"]["registros"]["Row"]
type Servicio = Database["public"]["Tables"]["servicios_catalogo"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface MonthDataProviderProps {
  servicios: Servicio[]
  profesionales: Profesional[]
  role: UserRole
}

export function MonthDataProvider({ servicios, profesionales, role }: MonthDataProviderProps) {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    setLoading(true)

    supabase
      .from("registros")
      .select("*")
      .eq("mes", selectedMonth)
      .order("fecha", { ascending: false })
      .then(({ data }) => {
        setRegistros(data ?? [])
        setLoading(false)
      })
  }, [selectedMonth])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Servicios</h1>
        <p className="text-sm text-muted-foreground">{monthLabel(selectedMonth)}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Nuevo registro
        </h2>
        <ServiciosForm
          servicios={servicios}
          profesionales={profesionales}
          mes={selectedMonth}
          onSuccess={() => {
            const supabase = createClient()
            supabase
              .from("registros")
              .select("*")
              .eq("mes", selectedMonth)
              .order("fecha", { ascending: false })
              .then(({ data }) => setRegistros(data ?? []))
          }}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Historial del mes
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <ServiciosTable
                registros={registros}
                servicios={servicios}
                profesionales={profesionales}
                mes={selectedMonth}
                role={role}
              />
            </div>
            <div className="md:hidden">
              <ServiciosCards
                registros={registros}
                servicios={servicios}
                profesionales={profesionales}
                mes={selectedMonth}
                role={role}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
