"use client"

import { useState } from "react"

const NUM_VALORES = 5

export function PlantillaMapaValores({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [valores, setValores] = useState<string[]>(() => Array(NUM_VALORES).fill(""))
  const [acciones, setAcciones] = useState<string[]>(() => Array(NUM_VALORES).fill(""))
  const [reflexion, setReflexion] = useState("")

  const actualizarValor = (i: number, v: string) => {
    setValores((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }
  const actualizarAccion = (i: number, v: string) => {
    setAcciones((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }

  const hayContenido = valores.some((v) => v.trim().length > 0)

  const enviar = () => {
    const lineas = valores
      .map((v, i) => (v.trim() ? `${v.trim()}${acciones[i]?.trim() ? ` → ${acciones[i].trim()}` : ""}` : null))
      .filter(Boolean)
      .join("\n")
    const texto = reflexion.trim() ? `${lineas}\n\nDónde no fui coherente: ${reflexion.trim()}` : lineas
    onEnviar(texto || null)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-[#6B7280]">Tus 5 valores más importantes y la acción que los refleja esta semana</p>
      {Array.from({ length: NUM_VALORES }, (_, i) => (
        <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[10px] shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              value={valores[i]}
              onChange={(e) => actualizarValor(i, e.target.value)}
              placeholder="Un valor (ej: familia, honestidad...)"
              className="flex-1 border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
            />
          </div>
          <input
            type="text"
            value={acciones[i]}
            onChange={(e) => actualizarAccion(i, e.target.value)}
            placeholder="Acción concreta esta semana que lo refleje"
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-xs text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
          />
        </div>
      ))}

      <div className="pt-1 flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">¿Dónde no actuaste coherente con tus valores esta semana? (opcional)</label>
        <textarea
          value={reflexion}
          onChange={(e) => setReflexion(e.target.value)}
          rows={2}
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
        />
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
