"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMonthStore } from "@/lib/stores/month-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatEUR, monthLabel } from "@/lib/format"
import {
  TrendingUp, Scissors, ShoppingBag, Gift, Receipt, Zap,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface KPIs {
  totalServicios: number
  importeServicios: number
  totalVentas: number
  importeVentas: number
  totalTarjetas: number
  importeTarjetas: number
  totalGeneral: number
  ticketMedio: number
}

interface ProfesionalStats {
  id: string
  nombre: string
  facturacion: number
  horasDisponibles: number
  eurosPorHora: number
  rankingServicios: { nombre: string; importe: number }[]
}

interface PagoDesglose {
  pago: string
  importe: number
}

const EMPTY: KPIs = {
  totalServicios: 0, importeServicios: 0,
  totalVentas: 0, importeVentas: 0,
  totalTarjetas: 0, importeTarjetas: 0,
  totalGeneral: 0, ticketMedio: 0,
}

const PIE_COLORS = ["#7c3aed", "#db2777", "#2563eb", "#16a34a", "#d97706"]

export function DashboardContent() {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const [kpis, setKpis] = useState<KPIs>(EMPTY)
  const [profesStats, setProfesStats] = useState<ProfesionalStats[]>([])
  const [pagoDesglose, setPagoDesglose] = useState<PagoDesglose[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (mes: string) => {
    const supabase = createClient()
    setLoading(true)

    const [registrosRes, ventasRes, tarjetasRes, horasRes, profesRes] = await Promise.all([
      supabase.from("registros").select("importe,pago,profesional_id,profesional_nombre,duracion,servicio_nombre").eq("mes", mes),
      supabase.from("ventas").select("importe_unitario,cantidad,pago").eq("mes", mes),
      supabase.from("tarjetas_regalo").select("importe_unitario,cantidad,pago").eq("mes", mes),
      supabase.from("horas_disponibles").select("profesional_id,horas").eq("mes", mes),
      supabase.from("profesionales").select("id,nombre").eq("activo", true),
    ])

    const registros = registrosRes.data ?? []
    const ventas = ventasRes.data ?? []
    const tarjetas = tarjetasRes.data ?? []
    const horas = horasRes.data ?? []
    const profesionales = profesRes.data ?? []

    // KPIs globales
    const importeServicios = registros.reduce((a, r) => a + Number(r.importe), 0)
    const importeVentas = ventas.reduce((a, v) => a + Number(v.importe_unitario) * v.cantidad, 0)
    const importeTarjetas = tarjetas.reduce((a, t) => a + Number(t.importe_unitario) * t.cantidad, 0)
    const totalGeneral = importeServicios + importeVentas + importeTarjetas
    const totalServicios = registros.length

    setKpis({
      totalServicios,
      importeServicios,
      totalVentas: ventas.length,
      importeVentas,
      totalTarjetas: tarjetas.length,
      importeTarjetas,
      totalGeneral,
      ticketMedio: totalServicios > 0 ? importeServicios / totalServicios : 0,
    })

    // Stats por profesional
    const horasMap: Record<string, number> = {}
    horas.forEach((h) => { horasMap[h.profesional_id] = Number(h.horas) })

    const stats: ProfesionalStats[] = profesionales.map((p) => {
      const regs = registros.filter((r) => r.profesional_id === p.id)
      const facturacion = regs.reduce((a, r) => a + Number(r.importe), 0)
      const horasDisp = horasMap[p.id] ?? 0
      const eurosPorHora = horasDisp > 0 ? facturacion / horasDisp : 0

      const importeByServicio: Record<string, number> = {}
      regs.forEach((r) => {
        importeByServicio[r.servicio_nombre] = (importeByServicio[r.servicio_nombre] ?? 0) + Number(r.importe)
      })

      const rankingServicios = Object.entries(importeByServicio)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([nombre, importe]) => ({ nombre, importe }))

      return {
        id: p.id,
        nombre: p.nombre,
        facturacion,
        horasDisponibles: horasDisp,
        eurosPorHora,
        rankingServicios,
      }
    }).filter((s) => s.facturacion > 0 || s.horasDisponibles > 0)

    setProfesStats(stats)

    // Desglose por forma de pago
    const pagoMap: Record<string, number> = {}
    const allItems = [
      ...registros.map((r) => ({ pago: r.pago, importe: Number(r.importe) })),
      ...ventas.map((v) => ({ pago: v.pago, importe: Number(v.importe_unitario) * v.cantidad })),
      ...tarjetas.map((t) => ({ pago: t.pago, importe: Number(t.importe_unitario) * t.cantidad })),
    ]
    allItems.forEach(({ pago, importe }) => {
      pagoMap[pago] = (pagoMap[pago] ?? 0) + importe
    })
    setPagoDesglose(
      Object.entries(pagoMap).map(([pago, importe]) => ({ pago, importe }))
    )

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData(selectedMonth)
  }, [selectedMonth, fetchData])

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "registros" }, () => fetchData(selectedMonth))
      .on("postgres_changes", { event: "*", schema: "public", table: "ventas" }, () => fetchData(selectedMonth))
      .on("postgres_changes", { event: "*", schema: "public", table: "tarjetas_regalo" }, () => fetchData(selectedMonth))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedMonth, fetchData])

  const kpiCards = [
    { title: "Servicios", value: formatEUR(kpis.importeServicios), sub: `${kpis.totalServicios} realizados`, icon: Scissors, color: "text-primary" },
    { title: "Ventas producto", value: formatEUR(kpis.importeVentas), sub: `${kpis.totalVentas} venta${kpis.totalVentas !== 1 ? "s" : ""}`, icon: ShoppingBag, color: "text-accent" },
    { title: "Tarjetas regalo", value: formatEUR(kpis.importeTarjetas), sub: `${kpis.totalTarjetas} vendida${kpis.totalTarjetas !== 1 ? "s" : ""}`, icon: Gift, color: "text-yellow-500" },
    { title: "Total general", value: formatEUR(kpis.totalGeneral), sub: "Suma total del mes", icon: TrendingUp, color: "text-green-500" },
    { title: "Ticket medio", value: formatEUR(kpis.ticketMedio), sub: "Por servicio", icon: Receipt, color: "text-blue-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{monthLabel(selectedMonth)}</p>
        </div>
        <Badge variant="secondary" className="ml-auto gap-1 text-xs">
          <Zap className="w-3 h-3 text-green-500" />
          Tiempo real
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {loading
          ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.title}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${card.color}`} />
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Cards por profesional */}
      {!loading && profesStats.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Por profesional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {profesStats.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{p.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Facturación</span>
                    <span className="font-semibold text-primary">{formatEUR(p.facturacion)}</span>
                  </div>
                  {p.horasDisponibles > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">€/hora</span>
                      <span className="font-medium">{formatEUR(p.eurosPorHora)}</span>
                    </div>
                  )}
                  {p.rankingServicios.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Top servicios</p>
                      {p.rankingServicios.map((s) => (
                        <div key={s.nombre} className="flex justify-between text-xs">
                          <span className="truncate text-muted-foreground">{s.nombre}</span>
                          <span className="shrink-0 ml-2">{formatEUR(s.importe)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      {!loading && profesStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barras: facturación por profesional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Facturación por profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={profesStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip formatter={(v) => formatEUR(Number(v))} />
                  <Bar dataKey="facturacion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie: desglose por forma de pago */}
          {pagoDesglose.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Desglose por forma de pago</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pagoDesglose}
                      dataKey="importe"
                      nameKey="pago"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pagoDesglose.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatEUR(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && kpis.totalGeneral === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Sin datos para este mes. Comienza registrando servicios.
        </div>
      )}
    </div>
  )
}
