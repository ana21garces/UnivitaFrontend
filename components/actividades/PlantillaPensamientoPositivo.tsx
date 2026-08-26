"use client"

import { useState } from "react"

export function PlantillaPensamientoPositivo({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [afirmacion, setAfirmacion] = useState("")
  const [ocurrio, setOcurrio] = useState<"si" | "no" | null>(null)
  const [pensamientoNegativo, setPensamientoNegativo] = useState("")
  const [perspectivaAlterna, setPerspectivaAlterna] = useState("")

  const hayContenido = afirmacion.trim().length > 0

  const enviar = () => {
    let texto = `Afirmación de hoy: ${afirmacion.trim()}`
    if (ocurrio) texto += `\n¿Ocurrió algo positivo?: ${ocurrio === "si" ? "Sí" : "No"}`
    if (pensamientoNegativo.trim()) {
      texto += `\nPensamiento negativo: ${pensamientoNegativo.trim()}`
      texto += `\nPerspectiva alternativa: ${perspectivaAlterna.trim() || "—"}`
    }
    onEnviar(texto)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">Afirmación de hoy</label>
        <input
          type="text"
          value={afirmacion}
          onChange={(e) => setAfirmacion(e.target.value)}
          placeholder="Ej: Hoy voy a disfrutar mi café de la mañana"
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">¿Ocurrió algo positivo hoy?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOcurrio("si")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              ocurrio === "si" ? "bg-[#16A34A] text-white border-transparent" : "border-[#E2E8F0] text-[#374151]"
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => setOcurrio("no")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              ocurrio === "no" ? "bg-slate-500 text-white border-transparent" : "border-[#E2E8F0] text-[#374151]"
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#6B7280]">Si un pensamiento negativo dominó hoy (opcional)</label>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={pensamientoNegativo}
            onChange={(e) => setPensamientoNegativo(e.target.value)}
            placeholder="El pensamiento negativo"
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
          />
          <input
            type="text"
            value={perspectivaAlterna}
            onChange={(e) => setPerspectivaAlterna(e.target.value)}
            placeholder="Una perspectiva alternativa"
            disabled={!pensamientoNegativo.trim()}
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] disabled:opacity-50"
          />
        </div>
      </div>

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
