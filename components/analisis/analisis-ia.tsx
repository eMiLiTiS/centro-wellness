"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMonthStore } from "@/lib/stores/month-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Sparkles, History, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { monthLabel } from "@/lib/format"
import type { Database } from "@/lib/supabase/types"

type Analisis = Database["public"]["Tables"]["analisis_guardados"]["Row"]

function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert
      prose-headings:font-semibold prose-headings:text-foreground
      prose-p:text-foreground prose-li:text-foreground
      prose-strong:text-foreground
      [&_h2]:text-base [&_h3]:text-sm
      [&_ul]:list-disc [&_ol]:list-decimal
      [&_hr]:border-border">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="mt-4 mb-2 font-semibold">{line.slice(3)}</h2>
        if (line.startsWith("### ")) return <h3 key={i} className="mt-3 mb-1 font-medium text-muted-foreground">{line.slice(4)}</h3>
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>
        if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>
        if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\. /, ""))}</li>
        if (line === "") return <br key={i} />
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

export function AnalisisIA() {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const [streaming, setStreaming] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [historico, setHistorico] = useState<Analisis[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadHistorico = useCallback(async () => {
    const supabase = createClient()
    setLoadingHistorico(true)
    const { data } = await supabase
      .from("analisis_guardados")
      .select("*")
      .eq("mes", selectedMonth)
      .order("created_at", { ascending: false })
    setHistorico(data ?? [])
    setLoadingHistorico(false)
  }, [selectedMonth])

  useEffect(() => {
    loadHistorico()
  }, [loadHistorico])

  async function generarAnalisis() {
    setStreaming(true)
    setCurrentText("")

    const response = await fetch("/api/analisis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mes: selectedMonth }),
    })

    if (!response.ok || !response.body) {
      setStreaming(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setCurrentText((t) => t + decoder.decode(value, { stream: true }))
    }

    setStreaming(false)
    await loadHistorico()
    setCurrentText("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Análisis IA</h1>
        <p className="text-sm text-muted-foreground">{monthLabel(selectedMonth)}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Generar análisis con IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Analiza automáticamente el rendimiento del mes: facturación, productividad por profesional, servicios estrella y recomendaciones de mejora.
          </p>
          <Button onClick={generarAnalisis} disabled={streaming} className="gap-2">
            {streaming
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
              : <><Sparkles className="w-4 h-4" /> Generar análisis</>}
          </Button>

          {/* Streaming output */}
          {(streaming || currentText) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 mt-4 min-h-24">
              <MarkdownContent text={currentText} />
              {streaming && <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-0.5" />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <div className="space-y-3">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <History className="w-4 h-4" />
          Análisis anteriores de este mes
        </h2>

        {loadingHistorico ? (
          <Skeleton className="h-16 w-full" />
        ) : historico.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay análisis generados para este mes
          </p>
        ) : (
          <div className="space-y-3">
            {historico.map((a) => (
              <Card key={a.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(a.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                      className="gap-1 text-xs"
                    >
                      {expandedId === a.id ? <><ChevronUp className="w-3 h-3" /> Ocultar</> : <><ChevronDown className="w-3 h-3" /> Ver</>}
                    </Button>
                  </div>
                </CardHeader>
                {expandedId === a.id && (
                  <CardContent className="pt-0 pb-4">
                    <div className="rounded-md bg-muted/30 p-4">
                      <MarkdownContent text={a.contenido} />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
