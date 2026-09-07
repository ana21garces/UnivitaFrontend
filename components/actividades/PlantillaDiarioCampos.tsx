"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

// Diario con varios campos distintos en una sola entrada (ej. "¿Dónde
// sentí...?" + "Petición" + "Acción de gracias"), a diferencia de
// PlantillaDiario en filas que repite el mismo par de campos N veces.

export function PlantillaDiarioCampos({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const campos = config?.campos ?? []
  const [valores, setValores] = useState<string[]>(() => campos.map(() => ""))

  const actualizar = (i: number, valor: string) => {
    setValores((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const hayContenido = valores.some((v) => v.trim().length > 0)

  const enviar = () => {
    const texto = campos
      .map((etiqueta, i) => (valores[i]?.trim() ? `${etiqueta}: ${valores[i].trim()}` : null))
      .filter(Boolean)
      .join("\n")
    onEnviar(texto || null)
  }

  return (
    <div className="flex flex-col gap-3">
      {campos.map((etiqueta, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#6B7280]">{etiqueta}</label>
          <textarea
            value={valores[i]}
            onChange={(e) => actualizar(i, e.target.value)}
            rows={i === 0 ? 2 : 1}
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
          />
        </div>
      ))}
      <button
        type="button"
        disabled={enviando || !hayContenido}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar entrada de hoy"}
      </button>
    </div>
  )
}
