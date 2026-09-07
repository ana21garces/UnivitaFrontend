"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

// Un sueño + metas SMART por cada área de vida fija (config.areas), con un
// campo por cada plazo pedido (config.campos, ej. corto y mediano plazo).

export function PlantillaMetasSmart({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const areas = config?.areas ?? []
  const metas = config?.campos ?? ["Meta SMART"]

  const [suenos, setSuenos] = useState<string[]>(() => areas.map(() => ""))
  const [valoresMetas, setValoresMetas] = useState<string[][]>(() => areas.map(() => metas.map(() => "")))

  const actualizarSueno = (i: number, valor: string) => {
    setSuenos((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const actualizarMeta = (i: number, j: number, valor: string) => {
    setValoresMetas((prev) => {
      const next = prev.map((fila) => [...fila])
      next[i][j] = valor
      return next
    })
  }

  const hayContenido = suenos.some((v) => v.trim().length > 0)

  const enviar = () => {
    const texto = areas
      .map((area, i) => {
        if (!suenos[i]?.trim()) return null
        const lineasMetas = metas
          .map((etiqueta, j) => (valoresMetas[i][j]?.trim() ? `   · ${etiqueta}: ${valoresMetas[i][j].trim()}` : null))
          .filter(Boolean)
          .join("\n")
        return `${area} — Sueño: ${suenos[i].trim()}${lineasMetas ? `\n${lineasMetas}` : ""}`
      })
      .filter(Boolean)
      .join("\n\n")
    onEnviar(texto || null)
  }

  return (
    <div className="flex flex-col gap-3">
      {areas.map((area, i) => (
        <div key={area} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col gap-2">
          <p className="text-xs font-bold text-[#16A34A] uppercase tracking-wide">{area}</p>
          <input
            type="text"
            value={suenos[i]}
            onChange={(e) => actualizarSueno(i, e.target.value)}
            placeholder="Tu sueño en esta área..."
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
          />
          {metas.map((etiqueta, j) => (
            <div key={j} className="pl-3 flex flex-col gap-1">
              <label className="text-[11px] text-[#94A3B8]">{etiqueta}</label>
              <input
                type="text"
                value={valoresMetas[i][j]}
                onChange={(e) => actualizarMeta(i, j, e.target.value)}
                placeholder="Meta específica, medible, alcanzable, con tiempo definido..."
                className="w-full border border-[#E2E8F0] rounded-lg p-2 text-xs text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        disabled={enviando || !hayContenido}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar mis metas"}
      </button>
    </div>
  )
}
