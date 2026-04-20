"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMonthStore } from "@/lib/stores/month-store"
import { VentasForm } from "./ventas-form"
import { VentasTable } from "./ventas-table"
import { VentasCards } from "./ventas-cards"
import { monthLabel } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import type { Database, UserRole } from "@/lib/supabase/types"

type Venta = Database["public"]["Tables"]["ventas"]["Row"]
type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]

interface VentasMonthProviderProps {
  profesionales: Profesional[]
  role: UserRole
}

export function VentasMonthProvider({ profesionales, role }: VentasMonthProviderProps) {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const [ventas, setVentas] = useState<Venta[]>([])
  const [productosAnteriores, setProductosAnteriores] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchVentas(mes: string) {
    const supabase = createClient()
    setLoading(true)
    const [ventasRes, productosRes] = await Promise.all([
      supabase
        .from("ventas")
        .select("*")
        .eq("mes", mes)
        .order("fecha", { ascending: false }),
      supabase
        .from("ventas")
        .select("producto")
        .order("producto"),
    ])
    setVentas(ventasRes.data ?? [])
    const seen = new Set<string>()
    const unique = (productosRes.data ?? [])
      .map((v) => v.producto)
      .filter((p) => { if (seen.has(p)) return false; seen.add(p); return true })
    setProductosAnteriores(unique)
    setLoading(false)
  }

  useEffect(() => {
    fetchVentas(selectedMonth)
  }, [selectedMonth])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ventas de producto</h1>
        <p className="text-sm text-muted-foreground">{monthLabel(selectedMonth)}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Nueva venta</h2>
        <VentasForm
          profesionales={profesionales}
          productosAnteriores={productosAnteriores}
          mes={selectedMonth}
          onSuccess={() => fetchVentas(selectedMonth)}
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
              <VentasTable
                ventas={ventas}
                profesionales={profesionales}
                productosAnteriores={productosAnteriores}
                mes={selectedMonth}
                role={role}
              />
            </div>
            <div className="md:hidden">
              <VentasCards
                ventas={ventas}
                profesionales={profesionales}
                productosAnteriores={productosAnteriores}
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
