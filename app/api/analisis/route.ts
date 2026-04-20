import { createClient } from "@/lib/supabase/server"
import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const { mes } = await request.json() as { mes: string }

  // Recopilar datos del mes
  const [registrosRes, ventasRes, tarjetasRes] = await Promise.all([
    supabase.from("registros").select("importe,duracion,servicio_nombre,profesional_nombre,pago").eq("mes", mes),
    supabase.from("ventas").select("producto,cantidad,importe_unitario,pago").eq("mes", mes),
    supabase.from("tarjetas_regalo").select("descripcion,cantidad,importe_unitario,pago").eq("mes", mes),
  ])

  const registros = registrosRes.data ?? []
  const ventas = ventasRes.data ?? []
  const tarjetas = tarjetasRes.data ?? []

  const importeServicios = registros.reduce((a, r) => a + Number(r.importe), 0)
  const importeVentas = ventas.reduce((a, v) => a + Number(v.importe_unitario) * v.cantidad, 0)
  const importeTarjetas = tarjetas.reduce((a, t) => a + Number(t.importe_unitario) * t.cantidad, 0)

  // Resumen por profesional
  const profMap: Record<string, { facturacion: number; servicios: number }> = {}
  registros.forEach((r) => {
    if (!profMap[r.profesional_nombre]) profMap[r.profesional_nombre] = { facturacion: 0, servicios: 0 }
    profMap[r.profesional_nombre].facturacion += Number(r.importe)
    profMap[r.profesional_nombre].servicios++
  })

  // Servicios más frecuentes
  const svcMap: Record<string, number> = {}
  registros.forEach((r) => { svcMap[r.servicio_nombre] = (svcMap[r.servicio_nombre] ?? 0) + 1 })
  const topServicios = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Desglose pago
  const pagoMap: Record<string, number> = {}
  ;[...registros, ...ventas.map(v => ({ pago: v.pago, importe: Number(v.importe_unitario) * v.cantidad })),
    ...tarjetas.map(t => ({ pago: t.pago, importe: Number(t.importe_unitario) * t.cantidad }))
  ].forEach((r: { pago: string; importe?: number }) => {
    pagoMap[r.pago] = (pagoMap[r.pago] ?? 0) + (r.importe ?? 0)
  })

  const prompt = `Eres un consultor especializado en centros de bienestar y estética. Analiza los datos de ${mes} y proporciona un análisis detallado y accionable.

## Datos del mes ${mes}

### Resumen económico
- Facturación por servicios: ${importeServicios.toFixed(2)}€ (${registros.length} servicios)
- Ventas de producto: ${importeVentas.toFixed(2)}€
- Tarjetas regalo: ${importeTarjetas.toFixed(2)}€
- **TOTAL: ${(importeServicios + importeVentas + importeTarjetas).toFixed(2)}€**
- Ticket medio por servicio: ${registros.length > 0 ? (importeServicios / registros.length).toFixed(2) : 0}€

### Por profesional
${Object.entries(profMap).map(([nombre, { facturacion, servicios }]) =>
  `- ${nombre}: ${facturacion.toFixed(2)}€ (${servicios} servicios, ticket medio: ${(facturacion/servicios).toFixed(2)}€)`
).join("\n")}

### Top 5 servicios más solicitados
${topServicios.map(([nombre, count]) => `- ${nombre}: ${count} veces`).join("\n")}

### Formas de pago
${Object.entries(pagoMap).map(([pago, total]) => `- ${pago}: ${total.toFixed(2)}€`).join("\n")}

Por favor analiza:
1. **Rendimiento del mes**: ¿Qué destacas positivamente? ¿Qué preocupa?
2. **Análisis por profesional**: Diferencias de productividad y posibles causas
3. **Servicios estrella**: Cuáles impulsar y cuáles revisar
4. **Mix de pagos**: ¿La distribución es saludable para el negocio?
5. **Recomendaciones**: 3-5 acciones concretas para el próximo mes

Responde en español, con formato markdown claro y tono constructivo.`

  // Streaming con ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const messageStream = await anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      })

      let fullText = ""

      for await (const chunk of messageStream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          fullText += chunk.delta.text
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }

      // Guardar en Supabase
      await supabase.from("analisis_guardados").insert({
        mes,
        contenido: fullText,
        autor_id: user.id,
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  })
}
