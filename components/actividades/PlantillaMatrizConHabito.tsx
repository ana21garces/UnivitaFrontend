"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

// Matriz de Eisenhower + hábito semanal + reflexión. La matriz se registra
// como el día (igual que las demás plantillas); el hábito, la tabla de la
// semana y la reflexión son locales al navegador y no viajan al backend —
// mismo patrón ya usado en PlantillaHabitoCalendario (ver ese archivo).

const CUADRANTE_ESTILO: Record<string, { bg: string; border: string; texto: string }> = {
  "Urgente + Importante": { bg: "bg-rose-50", border: "border-rose-300 focus:border-rose-500", texto: "text-rose-700" },
  "Importante + No urgente": { bg: "bg-sky-50", border: "border-sky-300 focus:border-sky-500", texto: "text-sky-700" },
  "Urgente + No importante": { bg: "bg-amber-50", border: "border-amber-300 focus:border-amber-500", texto: "text-amber-700" },
  "Ni urgente ni importante": { bg: "bg-slate-100", border: "border-slate-300 focus:border-slate-500", texto: "text-slate-600" },
}

const CUADRANTE_SUBTITULO: Record<string, string> = {
  "Urgente + Importante": "Hazlo ya",
  "Importante + No urgente": "Planifícalo",
  "Urgente + No importante": "Delégalo",
  "Ni urgente ni importante": "Elimínalo",
}

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"]

export function PlantillaMatrizConHabito({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const cuadrantes = config?.cuadrantes ?? []
  const [valores, setValores] = useState<string[]>(() => cuadrantes.map(() => ""))
  const [habito, setHabito] = useState("")
  const [dias, setDias] = useState<boolean[]>(() => DIAS_SEMANA.map(() => false))
  const [reflexion, setReflexion] = useState("")

  const actualizar = (i: number, valor: string) => {
    setValores((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const toggleDia = (i: number) => {
    setDias((prev) => {
      const next = [...prev]
      next[i] = !next[i]
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
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-[#6B7280] mb-2">Matriz de Eisenhower de hoy</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {cuadrantes.map((etiqueta, i) => {
            const estilo = CUADRANTE_ESTILO[etiqueta] ?? {
              bg: "bg-[#F8FAFC]",
              border: "border-[#E2E8F0] focus:border-[#16A34A]",
              texto: "text-[#374151]",
            }
            return (
              <div key={i} className={`flex flex-col gap-1.5 rounded-xl p-3 ${estilo.bg}`}>
                <label className="flex flex-col">
                  <span className={`text-xs font-bold ${estilo.texto}`}>{etiqueta}</span>
                  <span className="text-[10px] text-[#6B7280]">{CUADRANTE_SUBTITULO[etiqueta] ?? ""}</span>
                </label>
                <textarea
                  value={valores[i]}
                  onChange={(e) => actualizar(i, e.target.value)}
                  rows={2}
                  placeholder="Tareas de hoy..."
                  className={`w-full border rounded-lg p-2 text-sm text-[#1F2937] bg-white focus:outline-none resize-none ${estilo.border}`}
                />
              </div>
            )
          })}
        </div>
        <button
          type="button"
          disabled={enviando || !hayContenido}
          onClick={enviar}
          className="mt-3 self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
        >
          {enviando ? "..." : "Guardar matriz de hoy"}
        </button>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#6B7280]">Hábito de esta semana</label>
        <input
          type="text"
          value={habito}
          onChange={(e) => setHabito(e.target.value)}
          placeholder="Ej: leer 15 minutos, tomar agua al despertar..."
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
        />

        <div className="flex items-center gap-2 mt-1">
          {DIAS_SEMANA.map((dia, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDia(i)}
              disabled={!habito.trim()}
              className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 ${
                dias[i] ? "bg-[#16A34A] text-white border-transparent" : "border-[#E2E8F0] text-[#6B7280] hover:border-[#16A34A]"
              }`}
              aria-label={`Día ${dia}`}
            >
              {dias[i] ? "✓" : dia}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#94A3B8]">Marca cada día que cumpliste el hábito. No rompas la cadena.</p>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">Reflexión de la semana (cuando quieras)</label>
        <textarea
          value={reflexion}
          onChange={(e) => setReflexion(e.target.value)}
          rows={2}
          placeholder="¿Qué hábitos te suman? ¿cuáles te restan? ¿qué creencias limitantes aparecieron?"
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
        />
      </div>
    </div>
  )
}
