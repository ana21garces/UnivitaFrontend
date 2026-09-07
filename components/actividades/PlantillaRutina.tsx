"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

// Rutina de N pasos con casilla (ej. Meditación, Lectura, Oración) +
// reflexión final libre, para técnicas que piden hacer varios pasos cortos
// y luego escribir cómo fue.

export function PlantillaRutina({
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
  const pasos = config?.pasos ?? []
  const prompt = config?.prompt ?? objetivo
  const [hechos, setHechos] = useState<boolean[]>(() => pasos.map(() => false))
  const [reflexion, setReflexion] = useState("")

  const toggle = (i: number) => {
    setHechos((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const enviar = () => {
    const pasosTexto = pasos
      .map((p, i) => `${hechos[i] ? "✓" : "—"} ${p}`)
      .join("\n")
    onEnviar(`${pasosTexto}\n\n${reflexion.trim()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {pasos.map((paso, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
              hechos[i] ? "bg-[#F0FDF4] border-[#16A34A]/40" : "bg-white border-[#E2E8F0] hover:border-[#16A34A]/40"
            }`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                hechos[i] ? "bg-[#16A34A] border-[#16A34A]" : "border-[#CBD5E1]"
              }`}
            >
              {hechos[i] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </span>
            <span className={`text-sm ${hechos[i] ? "text-[#166534] font-medium" : "text-[#374151]"}`}>{paso}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">{prompt}</label>
        <textarea
          value={reflexion}
          onChange={(e) => setReflexion(e.target.value)}
          rows={3}
          placeholder="Escribe tu entrada de hoy..."
          className="w-full border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
        />
      </div>

      <button
        type="button"
        disabled={enviando || reflexion.trim().length === 0}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar entrada de hoy"}
      </button>
    </div>
  )
}
