"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

// Lista de personas a ayudar (local, brainstorm libre) + la acción elegida
// para esta semana con su reflexión posterior (esto último es lo que se
// registra como el día, igual que en las demás plantillas).

type Persona = { nombre: string; comoAyudarias: string; queNecesitas: string }

const PERSONA_VACIA: Persona = { nombre: "", comoAyudarias: "", queNecesitas: "" }

export function PlantillaServicioActivo({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [personas, setPersonas] = useState<Persona[]>([{ ...PERSONA_VACIA }])
  const [personaElegida, setPersonaElegida] = useState("")
  const [accion, setAccion] = useState("")
  const [reflexion, setReflexion] = useState("")

  const actualizarPersona = (i: number, campo: keyof Persona, valor: string) => {
    setPersonas((prev) => {
      const next = prev.map((p) => ({ ...p }))
      next[i][campo] = valor
      return next
    })
  }

  const agregarPersona = () => setPersonas((prev) => [...prev, { ...PERSONA_VACIA }])
  const quitarPersona = (i: number) => setPersonas((prev) => prev.filter((_, idx) => idx !== i))

  const hayContenido = personaElegida.trim().length > 0 && accion.trim().length > 0

  const enviar = () => {
    let texto = `Persona: ${personaElegida.trim()}\nAcción: ${accion.trim()}`
    if (reflexion.trim()) texto += `\nReflexión: ${reflexion.trim()}`
    onEnviar(texto)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-[#6B7280]">Personas a quienes te gustaría ayudar</p>
        {personas.map((p, i) => (
          <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={p.nombre}
                onChange={(e) => actualizarPersona(i, "nombre", e.target.value)}
                placeholder="Persona"
                className="flex-1 border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
              />
              {personas.length > 1 && (
                <button type="button" onClick={() => quitarPersona(i)} className="text-[#9CA3AF] hover:text-red-500 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={p.comoAyudarias}
              onChange={(e) => actualizarPersona(i, "comoAyudarias", e.target.value)}
              placeholder="¿Cómo la ayudarías?"
              className="w-full border border-[#E2E8F0] rounded-lg p-2 text-xs text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
            />
            <input
              type="text"
              value={p.queNecesitas}
              onChange={(e) => actualizarPersona(i, "queNecesitas", e.target.value)}
              placeholder="¿Qué necesitas para hacerlo?"
              className="w-full border border-[#E2E8F0] rounded-lg p-2 text-xs text-[#1F2937] bg-white focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={agregarPersona}
          className="self-start flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1F2937]"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar persona
        </button>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
        <p className="text-xs font-semibold text-[#6B7280]">Esta semana</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={personaElegida}
            onChange={(e) => setPersonaElegida(e.target.value)}
            placeholder="Persona elegida"
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
          />
          <input
            type="text"
            value={accion}
            onChange={(e) => setAccion(e.target.value)}
            placeholder="Acción concreta"
            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
          />
        </div>
        <textarea
          value={reflexion}
          onChange={(e) => setReflexion(e.target.value)}
          rows={2}
          placeholder="Después de hacerlo: ¿qué sentí? ¿esto refleja lo que es importante para mí?"
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
