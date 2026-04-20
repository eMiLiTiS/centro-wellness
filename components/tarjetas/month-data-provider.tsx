"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMonthStore } from "@/lib/stores/month-store"
import { TarjetasForm } from "./tarjetas-form"
import { TarjetasTable } from "./tarjetas-table"
import { TarjetasCards } from "./tarjetas-cards"
import { monthLabel, formatEUR } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import type { Database, UserRole } from "@/lib/supabase/types"

type Tarjeta = Database["public"]["Tables"]["tarjetas_regalo"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface TarjetasMonthProviderProps {
  profesionales: Profesional[]
  role: UserRole
}

export function TarjetasMonthProvider({ profesionales, role }: TarjetasMonthProviderProps) {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [pasivoTotal, setPasivoTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  async function fetchTarjetas(mes: string) {
    const supabase = createClient()
    setLoading(true)

    const [mesRes, totalRes] = await Promise.all([
      supabase
        .from("tarjetas_regalo")
        .select("*")
        .eq("mes", mes)
        .order("fecha", { ascending: false }),
      supabase
        .from("tarjetas_regalo")
        .select("importe_unitario, cantidad"),
    ])

    setTarjetas(mesRes.data ?? [])
    const pasivo = (totalRes.data ?? []).reduce(
      (acc, t) => acc + Number(t.importe_unitario) * t.cantidad,
      0
    )
    setPasivoTotal(pasivo)
    setLoading(false)
  }

  useEffect(() => {
    fetchTarjetas(selectedMonth)
  }, [selectedMonth])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tarjetas regalo</h1>
        <p className="text-sm text-muted-foreground">{monthLabel(selectedMonth)}</p>
      </div>

      {/* KPI pasivo pendiente */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pasivo pendiente (histórico global)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
                {formatEUR(pasivoTotal)}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                Total de todas las tarjetas vendidas no canjeadas aún
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Nueva tarjeta</h2>
        <TarjetasForm
          profesionales={profesionales}
          mes={selectedMonth}
          onSuccess={() => fetchTarjetas(selectedMonth)}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Historial del mes</h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <TarjetasTable tarjetas={tarjetas} profesionales={profesionales} mes={selectedMonth} role={role} />
            </div>
            <div className="md:hidden">
              <TarjetasCards tarjetas={tarjetas} profesionales={profesionales} mes={selectedMonth} role={role} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
