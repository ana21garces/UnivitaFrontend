"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

// Lista de retos ordenados de menor a mayor dificultad (local, brainstorm)
// + el reto elegido para esta semana con su reflexión (esto se registra
// como el día, igual que en las demás plantillas).

export function PlantillaRetoGradual({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [retos, setRetos] = useState<string[]>([""])
  const [retoElegido, setRetoElegido] = useState("")
  const [reflexion, setReflexion] = useState("")

  const actualizar = (i: number, valor: string) => {
    setRetos((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const agregar = () => setRetos((prev) => [...prev, ""])
  const quitar = (i: number) => setRetos((prev) => prev.filter((_, idx) => idx !== i))

  const hayContenido = retoElegido.trim().length > 0

  const enviar = () => {
    let texto = `Reto de esta semana: ${retoElegido.trim()}`
    if (reflexion.trim()) texto += `\nReflexión: ${reflexion.trim()}`
    onEnviar(texto)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-[#6B7280]">Tus retos, de menor a mayor dificultad</p>
        {retos.map((valor, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[10px] shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              value={valor}
              onChange={(e) => actualizar(i, e.target.value)}
              placeholder="Reto que te genera curiosidad o temor"
              className="flex-1 border-b border-[#CBD5E1] py-1 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] bg-transparent"
            />
            {retos.length > 1 && (
              <button type="button" onClick={() => quitar(i)} className="text-[#9CA3AF] hover:text-red-500 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={agregar}
          className="self-start flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1F2937]"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar reto
        </button>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
        <p className="text-xs font-semibold text-[#6B7280]">Esta semana me comprometo a</p>
        <input
          type="text"
          value={retoElegido}
          onChange={(e) => setRetoElegido(e.target.value)}
          placeholder="El reto más pequeño de tu lista"
          className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
        />
        <textarea
          value={reflexion}
          onChange={(e) => setReflexion(e.target.value)}
          rows={2}
          placeholder="Después de hacerlo: ¿qué aprendí de mí mismo? ¿fue tan difícil como pensaba?"
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
