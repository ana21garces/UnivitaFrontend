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
  const prompt = config?.prompt ?? objetivo
  const filas = config?.filas ?? 0

  if (filas > 0) {
    return (
      <PlantillaDiarioFilas prompt={prompt} subPrompt={config?.subPrompt ?? ""} filas={filas} enviando={enviando} onEnviar={onEnviar} />
    )
  }

  return <PlantillaDiarioLibre prompt={prompt} enviando={enviando} onEnviar={onEnviar} />
}

function PlantillaDiarioLibre({
  prompt,
  enviando,
  onEnviar,
}: {
  prompt: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [texto, setTexto] = useState("")

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

// Diario en N filas repetidas (ej. 3 gratitudes), cada una con su campo
// principal y una segunda pregunta corta debajo — para diarios que piden
// "escribe X cosas y, debajo de cada una, responde Y".
function PlantillaDiarioFilas({
  prompt,
  subPrompt,
  filas,
  enviando,
  onEnviar,
}: {
  prompt: string
  subPrompt: string
  filas: number
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [principal, setPrincipal] = useState<string[]>(() => Array(filas).fill(""))
  const [secundario, setSecundario] = useState<string[]>(() => Array(filas).fill(""))

  const actualizar = (setter: typeof setPrincipal, i: number, valor: string) => {
    setter((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const hayContenido = principal.some((v) => v.trim().length > 0)

  const enviar = () => {
    const texto = principal
      .map((v, i) => (v.trim() ? `${i + 1}. ${v.trim()}${secundario[i]?.trim() ? `\n   → ${secundario[i].trim()}` : ""}` : null))
      .filter(Boolean)
      .join("\n\n")
    onEnviar(texto)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-[#6B7280]">{prompt}</p>
      <div className="flex flex-col gap-3">
        {Array.from({ length: filas }, (_, i) => (
          <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[10px] shrink-0">
                {i + 1}
              </span>
              <input
                type="text"
                value={principal[i]}
                onChange={(e) => actualizar(setPrincipal, i, e.target.value)}
                placeholder="Sé concreto..."
                className="flex-1 border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            {subPrompt && (
              <div className="pl-7 flex flex-col gap-1">
                <label className="text-[11px] text-[#94A3B8]">{subPrompt}</label>
                <input
                  type="text"
                  value={secundario[i]}
                  onChange={(e) => actualizar(setSecundario, i, e.target.value)}
                  className="border border-[#E2E8F0] rounded-lg p-2 text-xs text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
                />
              </div>
            )}
          </div>
        ))}
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
