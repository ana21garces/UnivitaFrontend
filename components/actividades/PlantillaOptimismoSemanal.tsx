"use client"

import { useState } from "react"

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"]

export function PlantillaOptimismoSemanal({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [cosaPositiva, setCosaPositiva] = useState("")
  const [metaSemana, setMetaSemana] = useState("")
  const [evaluacion, setEvaluacion] = useState("")
  const [dias, setDias] = useState<boolean[]>(() => DIAS_SEMANA.map(() => false))

  const toggleDia = (i: number) => {
    setDias((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const racha = (() => {
    let actual = 0
    let maxima = 0
    for (const d of dias) {
      actual = d ? actual + 1 : 0
      maxima = Math.max(maxima, actual)
    }
    return maxima
  })()

  const hayContenido = cosaPositiva.trim().length > 0 || metaSemana.trim().length > 0

  const enviar = () => {
    let texto = ""
    if (cosaPositiva.trim()) texto += `Algo positivo que espero hoy: ${cosaPositiva.trim()}`
    if (metaSemana.trim()) texto += `${texto ? "\n" : ""}Meta positiva de la semana: ${metaSemana.trim()}`
    if (evaluacion.trim()) texto += `${texto ? "\n" : ""}Evaluación de la semana: ${evaluacion.trim()}`
    onEnviar(texto)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">Algo positivo que espero hoy</label>
        <input
          type="text"
          value={cosaPositiva}
          onChange={(e) => setCosaPositiva(e.target.value)}
          placeholder="Ej: Voy a tener una buena conversación con un amigo"
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">Meta positiva para esta semana</label>
        <input
          type="text"
          value={metaSemana}
          onChange={(e) => setMetaSemana(e.target.value)}
          placeholder="Ej: Terminar el proyecto que he estado postergando"
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
        />
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#6B7280]">Cuadro de hábitos: Pensamiento Positivo del Día</label>
          {racha > 0 && (
            <span className="text-[10px] font-bold text-orange-600">🔥 Racha de {racha} día{racha === 1 ? "" : "s"}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {DIAS_SEMANA.map((dia, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDia(i)}
              className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-colors ${
                dias[i] ? "bg-[#16A34A] text-white border-transparent" : "border-[#E2E8F0] text-[#6B7280] hover:border-[#16A34A]"
              }`}
              aria-label={`Día ${dia}`}
            >
              {dias[i] ? "✓" : dia}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">
          Al final de la semana: ¿qué salió bien? ¿qué aprendiste de lo que no salió como esperabas? (opcional)
        </label>
        <textarea
          value={evaluacion}
          onChange={(e) => setEvaluacion(e.target.value)}
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
        {enviando ? "..." : "Guardar entrada de hoy"}
      </button>
    </div>
  )
}
