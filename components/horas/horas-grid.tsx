"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMonthStore } from "@/lib/stores/month-store"
import { useDebounce } from "@/hooks/use-debounce"
import { upsertHoras } from "@/app/(app)/horas/actions"
import { monthLabel } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Loader2 } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type Profesional = Database["public"]["Tables"]["profesionales"]["Row"]
type HorasRow = Database["public"]["Tables"]["horas_disponibles"]["Row"]

interface HorasGridProps {
  profesionales: Profesional[]
}

type SaveStatus = "idle" | "saving" | "saved"

export function HorasGrid({ profesionales }: HorasGridProps) {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, SaveStatus>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    setLoading(true)
    supabase
      .from("horas_disponibles")
      .select("*")
      .eq("mes", selectedMonth)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        ;(data ?? []).forEach((h: HorasRow) => {
          map[h.profesional_id] = String(h.horas)
        })
        setValues(map)
        setLoading(false)
      })
  }, [selectedMonth])

  const saveHoras = useCallback(
    async (profesionalId: string, horas: number, mes: string) => {
      setStatus((s) => ({ ...s, [profesionalId]: "saving" }))
      await upsertHoras(profesionalId, mes, horas)
      setStatus((s) => ({ ...s, [profesionalId]: "saved" }))
      setTimeout(
        () => setStatus((s) => ({ ...s, [profesionalId]: "idle" })),
        2000
      )
    },
    []
  )

  const debouncedSave = useDebounce(saveHoras, 800)

  function handleChange(profesionalId: string, value: string) {
    setValues((v) => ({ ...v, [profesionalId]: value }))
    setStatus((s) => ({ ...s, [profesionalId]: "saving" }))
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      debouncedSave(profesionalId, num, selectedMonth)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Horas disponibles</h1>
        <p className="text-sm text-muted-foreground">{monthLabel(selectedMonth)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Los cambios se guardan automáticamente
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {profesionales.filter((p) => p.activo).map((p) => {
              const st = status[p.id] ?? "idle"
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4"
                >
                  <span className="w-40 shrink-0 text-sm font-medium truncate">
                    {p.nombre}
                  </span>
                  <div className="relative flex-1 max-w-xs">
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="0"
                      value={values[p.id] ?? ""}
                      onChange={(e) => handleChange(p.id, e.target.value)}
                      className="pr-9"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {st === "saving" && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {st === "saved" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
