"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

export function PlantillaMatriz({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const cuadrantes = config?.cuadrantes ?? ["Nota"]
  const [valores, setValores] = useState<string[]>(() => cuadrantes.map(() => ""))

  const actualizar = (i: number, valor: string) => {
    setValores((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const enviar = () => {
    const texto = cuadrantes
      .map((etiqueta, i) => `${etiqueta}: ${valores[i]?.trim() || "—"}`)
      .join("\n")
    onEnviar(texto)
  }

  const hayContenido = valores.some((v) => v.trim().length > 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {cuadrantes.map((etiqueta, i) => (
          <div key={i} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280]">{etiqueta}</label>
            <textarea
              value={valores[i]}
              onChange={(e) => actualizar(i, e.target.value)}
              rows={2}
              className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={enviando || !hayContenido}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar"}
      </button>
    </div>
  )
}
