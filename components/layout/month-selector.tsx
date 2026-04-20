"use client"

import { useMemo } from "react"
import { format, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMonthStore } from "@/lib/stores/month-store"
import { monthLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

interface MonthSelectorProps {
  role: "admin" | "recepcion"
}

function buildMonthList() {
  const months: string[] = []
  const now = new Date()
  for (let i = 24; i >= 0; i--) {
    months.push(format(subMonths(now, i), "yyyy-MM"))
  }
  return months
}

export function MonthSelector({ role }: MonthSelectorProps) {
  const { selectedMonth, setMonth } = useMonthStore()
  const months = useMemo(buildMonthList, [])

  const currentMonth = format(new Date(), "yyyy-MM")
  const isAdmin = role === "admin"

  function prev() {
    const idx = months.indexOf(selectedMonth)
    if (idx > 0) setMonth(months[idx - 1])
  }

  function next() {
    const idx = months.indexOf(selectedMonth)
    if (idx < months.length - 1) setMonth(months[idx + 1])
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Calendar className="w-4 h-4" />
        {monthLabel(currentMonth)}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={prev}
        disabled={months.indexOf(selectedMonth) === 0}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8 text-sm font-medium min-w-36">
            <Calendar className="w-4 h-4 mr-1.5" />
            {monthLabel(selectedMonth)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1" align="center">
          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {[...months].reverse().map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                  selectedMonth === m
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {monthLabel(m)}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={next}
        disabled={months.indexOf(selectedMonth) === months.length - 1}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
