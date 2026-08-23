"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

export function PlantillaLista({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const placeholder = config?.placeholder ?? "Escribe un ítem..."
  const [items, setItems] = useState<string[]>([""])

  const actualizar = (i: number, valor: string) => {
    setItems((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const agregar = () => setItems((prev) => [...prev, ""])
  const quitar = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const enviar = () => {
    const limpios = items.map((v) => v.trim()).filter(Boolean)
    const texto = limpios.map((v, i) => `${i + 1}. ${v}`).join("\n")
    onEnviar(texto || null)
  }

  const hayContenido = items.some((v) => v.trim().length > 0)

  return (
    <div className="flex flex-col gap-2">
      {items.map((valor, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#16A34A] w-4 shrink-0">{i + 1}.</span>
          <input
            type="text"
            value={valor}
            onChange={(e) => actualizar(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 border-b border-[#CBD5E1] py-1 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] bg-transparent"
          />
          {items.length > 1 && (
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
        <Plus className="w-3.5 h-3.5" /> Agregar ítem
      </button>
      <button
        type="button"
        disabled={enviando || !hayContenido}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar lista"}
      </button>
    </div>
  )
}
