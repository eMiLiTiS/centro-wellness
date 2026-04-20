import { format, parse } from "date-fns"
import { es } from "date-fns/locale"

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(isoDate: string): string {
  return format(new Date(isoDate), "dd/MM/yyyy")
}

export function isoToDisplay(isoDate: string): string {
  return format(new Date(isoDate + "T00:00:00"), "dd/MM/yyyy")
}

export function displayToIso(displayDate: string): string {
  const parsed = parse(displayDate, "dd/MM/yyyy", new Date())
  return format(parsed, "yyyy-MM-dd")
}

export function monthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return format(date, "MMMM yyyy", { locale: es })
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function dateToMes(date: Date = new Date()): string {
  return format(date, "yyyy-MM")
}
