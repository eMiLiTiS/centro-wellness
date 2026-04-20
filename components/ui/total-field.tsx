import { Label } from "@/components/ui/label"
import { formatEUR } from "@/lib/format"

interface TotalFieldProps {
  value: number
}

export function TotalField({ value }: TotalFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Total</Label>
      <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted text-sm font-semibold text-primary">
        {formatEUR(value)}
      </div>
    </div>
  )
}
