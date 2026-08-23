"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

export function PlantillaDiario({
  config,
  objetivo,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [texto, setTexto] = useState("")
  const prompt = config?.prompt ?? objetivo

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-[#6B7280]">{prompt}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        placeholder="Escribe tu entrada de hoy..."
        className="w-full border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
      />
      <button
        type="button"
        disabled={enviando || texto.trim().length === 0}
        onClick={() => onEnviar(texto.trim())}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar entrada de hoy"}
      </button>
    </div>
  )
}
