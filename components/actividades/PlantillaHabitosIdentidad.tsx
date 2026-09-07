"use client"

import { useState } from "react"

// Cuadro de hábitos semanal claro (no el "Habit Tracker" oscuro genérico):
// 2 hábitos a reforzar + 1 a eliminar, marcados con X día a día — acorde a
// "Elige 2 hábitos que quieras reforzar y 1 que quieras eliminar. Lleva
// registro semanal con el cuadro de hábitos."

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"]

const FILAS = [
  { tipo: "reforzar" as const, placeholder: "Hábito a reforzar" },
  { tipo: "reforzar" as const, placeholder: "Hábito a reforzar" },
  { tipo: "eliminar" as const, placeholder: "Hábito a eliminar" },
]

export function PlantillaHabitosIdentidad({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [nombres, setNombres] = useState<string[]>(() => FILAS.map(() => ""))
  const [dias, setDias] = useState<boolean[][]>(() => FILAS.map(() => DIAS_SEMANA.map(() => false)))

  const actualizarNombre = (i: number, valor: string) => {
    setNombres((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const toggleDia = (fila: number, dia: number) => {
    setDias((prev) => {
      const next = prev.map((f) => [...f])
      next[fila][dia] = !next[fila][dia]
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {FILAS.map((fila, i) => (
        <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                fila.tipo === "reforzar" ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-red-50 text-red-600"
              }`}
            >
              {fila.tipo === "reforzar" ? "Reforzar" : "Eliminar"}
            </span>
            <input
              type="text"
              value={nombres[i]}
              onChange={(e) => actualizarNombre(i, e.target.value)}
              placeholder={fila.placeholder}
              className="flex-1 border-b border-[#CBD5E1] py-1 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {DIAS_SEMANA.map((dia, d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDia(i, d)}
                disabled={!nombres[i].trim()}
                className={`flex-1 h-8 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 ${
                  dias[i][d]
                    ? fila.tipo === "reforzar"
                      ? "bg-[#16A34A] text-white border-transparent"
                      : "bg-red-500 text-white border-transparent"
                    : "border-[#E2E8F0] text-[#6B7280] hover:border-[#16A34A]"
                }`}
                aria-label={`Día ${dia}`}
              >
                {dias[i][d] ? "✓" : dia}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={enviando}
        onClick={() => onEnviar(null)}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "✓ Lo hice hoy"}
      </button>
    </div>
  )
}
