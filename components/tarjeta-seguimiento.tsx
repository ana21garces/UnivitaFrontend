"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { SeguimientoControles } from "@/components/seguimiento-controles"
import type { SeguimientoRecomendacion, TarjetaRecomendacion } from "@/lib/seguimiento-recomendaciones"

const NIVEL_CHIP: Record<string, { bg: string; text: string }> = {
  POBRE:     { bg: "#FFF5F5", text: "#E53E3E" },
  MODERADO:  { bg: "#FFFAF0", text: "#DD6B20" },
  BUENO:     { bg: "#EBF8FF", text: "#3182CE" },
  EXCELENTE: { bg: "#F0FFF4", text: "#38A169" },
}

export function NivelChip({ nivel }: { nivel: string }) {
  const cfg = NIVEL_CHIP[nivel.toUpperCase()] ?? { bg: "#EDF2F7", text: "#718096" }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {nivel}
    </span>
  )
}

export function TarjetaSeguimiento({
  tarjeta,
  seguimiento,
  onUpdate,
}: {
  tarjeta: TarjetaRecomendacion
  seguimiento: SeguimientoRecomendacion
  onUpdate: (nuevo: SeguimientoRecomendacion) => void
}) {
  const [open, setOpen] = useState(true)
  const completada = seguimiento.estado === "completada"

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${
        completada ? "border-[#16A34A]/30 bg-[#F0FDF4]" : "border-[#E2E8F0] bg-white"
      }`}
    >
      <button
        className="w-full flex items-start justify-between px-5 py-4 hover:bg-black/[0.02] transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <NivelChip nivel={tarjeta.nivel} />
            {completada && (
              <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wide">Completada</span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Pregunta {tarjeta.pregunta_num} · {tarjeta.pregunta_texto}</p>
          <h3 className="text-base font-bold text-[#1F2937]">{tarjeta.tecnica}</h3>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-[#6B7280] shrink-0 mt-1" />
          : <ChevronDown className="w-5 h-5 text-[#6B7280] shrink-0 mt-1" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">Instrucciones</p>
          <ol className="flex flex-col gap-2">
            {tarjeta.instrucciones.map((paso, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#374151]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[10px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{paso}</span>
              </li>
            ))}
          </ol>

          <SeguimientoControles tarjeta={tarjeta} seguimiento={seguimiento} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}
