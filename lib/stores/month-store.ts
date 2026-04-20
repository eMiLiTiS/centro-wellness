import { create } from "zustand"
import { persist } from "zustand/middleware"
import { format } from "date-fns"

function currentMonth() {
  return format(new Date(), "yyyy-MM")
}

interface MonthState {
  selectedMonth: string
  setMonth: (month: string) => void
  resetToCurrentMonth: () => void
}

export const useMonthStore = create<MonthState>()(
  persist(
    (set) => ({
      selectedMonth: currentMonth(),
      setMonth: (month) => set({ selectedMonth: month }),
      resetToCurrentMonth: () => set({ selectedMonth: currentMonth() }),
    }),
    {
      name: "centro-wellness-month",
    }
  )
)
