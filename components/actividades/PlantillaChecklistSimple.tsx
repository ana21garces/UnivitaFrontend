"use client"

import { useState } from "react"

export function PlantillaChecklistSimple({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [mostrarNotas, setMostrarNotas] = useState(false)
  const [notas, setNotas] = useState("")

  return (
    <div className="flex flex-col gap-2">
      {mostrarNotas && (
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Notas de hoy (opcional)..."
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={enviando}
          onClick={() => onEnviar(notas.trim() || null)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
        >
          {enviando ? "..." : "✓ Lo hice hoy"}
        </button>
        {!mostrarNotas && (
          <button
            type="button"
            onClick={() => setMostrarNotas(true)}
            className="text-xs text-[#6B7280] hover:text-[#1F2937] underline"
          >
            + Agregar nota
          </button>
        )}
      </div>
    </div>
  )
}
