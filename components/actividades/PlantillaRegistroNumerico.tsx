"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

export function PlantillaRegistroNumerico({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [valor, setValor] = useState("")
  const [comentario, setComentario] = useState("")
  const unidad = config?.unidad ?? "veces"

  const enviar = () => {
    if (!valor.trim()) return
    const texto = comentario.trim()
      ? `${valor} ${unidad} · ${comentario.trim()}`
      : `${valor} ${unidad}`
    onEnviar(texto)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0"
          className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
        />
        <span className="text-sm text-[#6B7280]">{unidad}</span>
      </div>
      <input
        type="text"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Comentario opcional..."
        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
      />
      <button
        type="button"
        disabled={enviando || !valor.trim()}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar registro"}
      </button>
    </div>
  )
}
