"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions: string[]
  onValueChange?: (value: string) => void
}

export function AutocompleteInput({
  suggestions,
  onValueChange,
  value,
  onChange,
  className,
  ...props
}: AutocompleteInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState((value as string) ?? "")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      s.toLowerCase() !== inputValue.toLowerCase()
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    setOpen(true)
    onChange?.(e)
    onValueChange?.(e.target.value)
  }

  function handleSelect(suggestion: string) {
    setInputValue(suggestion)
    setOpen(false)
    onValueChange?.(suggestion)
  }

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={inputValue}
        onChange={handleChange}
        onFocus={() => inputValue && setOpen(true)}
        className={className}
        {...props}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(s)
              }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted truncate"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
