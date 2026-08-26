"use client"

import { useState } from "react"
import type { ConfigActividad } from "@/lib/seguimiento-recomendaciones"

// Semáforo: cuadrantes que empiezan por un color se pintan como fila de
// semáforo (punto de color + fondo suave) en vez de la grilla genérica.
const COLORES_SEMAFORO: { prefijos: string[]; dot: string; bg: string; border: string; ring: string }[] = [
  { prefijos: ["Verde"], dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-300 focus:border-emerald-500", ring: "ring-emerald-400" },
  { prefijos: ["Amarillo", "Naranja"], dot: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-300 focus:border-amber-500", ring: "ring-amber-400" },
  { prefijos: ["Rojo"], dot: "bg-red-500", bg: "bg-red-50", border: "border-red-300 focus:border-red-500", ring: "ring-red-400" },
]

function colorSemaforo(etiqueta: string) {
  return COLORES_SEMAFORO.find((c) => c.prefijos.some((p) => etiqueta.trim().startsWith(p)))
}

export function PlantillaMatriz({
  config,
  enviando,
  onEnviar,
}: {
  config: ConfigActividad | null
  objetivo: string
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const cuadrantesConfig = config?.cuadrantes ?? []
  const cuadrantes = config?.cuadrantes ?? ["Nota"]
  const campos = config?.campos ?? null
  const esSemaforo = cuadrantesConfig.length > 0 && cuadrantesConfig.every((c) => colorSemaforo(c))

  const [valores, setValores] = useState<string[]>(() => cuadrantes.map(() => ""))
  const [camposValores, setCamposValores] = useState<string[]>(() => (campos ?? []).map(() => ""))
  const [colorElegido, setColorElegido] = useState<number | null>(null)

  const actualizar = (i: number, valor: string) => {
    setValores((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  const actualizarCampo = (i: number, valor: string) => {
    setCamposValores((prev) => {
      const next = [...prev]
      next[i] = valor
      return next
    })
  }

  // Diario estructurado (ej. Tema / Qué aprendiste, o Síntoma / Duración /
  // Intensidad), con todos los campos obligatorios. Si además viene un
  // semáforo de colores, se agrega como selector de un solo color.
  if (campos) {
    const hayContenidoDiario = camposValores.every((v) => v.trim().length > 0) && (!esSemaforo || colorElegido !== null)

    const enviarDiario = () => {
      const detalle = campos.map((etiqueta, i) => `${etiqueta}: ${camposValores[i].trim()}`).join(" · ")
      const color = esSemaforo && colorElegido !== null ? `\nSemáforo: ${cuadrantesConfig[colorElegido]}` : ""
      onEnviar(`${detalle}${color}`)
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="grid sm:grid-cols-3 gap-3">
          {campos.map((etiqueta, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280]">{etiqueta}</label>
              <input
                type="text"
                value={camposValores[i]}
                onChange={(e) => actualizarCampo(i, e.target.value)}
                placeholder={etiqueta}
                className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          ))}
        </div>

        {esSemaforo && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280]">Semáforo de síntomas</label>
            <div className="flex flex-wrap gap-2">
              {cuadrantesConfig.map((etiqueta, i) => {
                const color = colorSemaforo(etiqueta)!
                const activo = colorElegido === i
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setColorElegido(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${color.bg} ${
                      activo ? `ring-2 ${color.ring} border-transparent` : "border-[#E2E8F0]"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                    {etiqueta}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={enviando || !hayContenidoDiario}
          onClick={enviarDiario}
          className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
        >
          {enviando ? "..." : "Guardar en la bitácora"}
        </button>
      </div>
    )
  }

  const enviar = () => {
    const texto = cuadrantes
      .map((etiqueta, i) => `${etiqueta}: ${valores[i]?.trim() || "—"}`)
      .join("\n")
    onEnviar(texto)
  }

  const hayContenido = valores.some((v) => v.trim().length > 0)

  return (
    <div className="flex flex-col gap-3">
      {esSemaforo ? (
        <div className="flex flex-col gap-2">
          {cuadrantes.map((etiqueta, i) => {
            const color = colorSemaforo(etiqueta)!
            return (
              <div key={i} className={`flex flex-col gap-1.5 rounded-xl p-3 ${color.bg}`}>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#374151]">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${color.dot}`} />
                  {etiqueta}
                </label>
                <textarea
                  value={valores[i]}
                  onChange={(e) => actualizar(i, e.target.value)}
                  rows={2}
                  placeholder="¿Qué notaste hoy?"
                  className={`w-full border rounded-lg p-2 text-sm text-[#1F2937] bg-white focus:outline-none resize-none ${color.border}`}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {cuadrantes.map((etiqueta, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280]">{etiqueta}</label>
              <textarea
                value={valores[i]}
                onChange={(e) => actualizar(i, e.target.value)}
                rows={2}
                className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
              />
            </div>
          ))}
        </div>
      )}
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
