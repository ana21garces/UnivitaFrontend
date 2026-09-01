"use client"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { api } from "@/lib/api"
import {
  ESTILO_RAREZA,
  iconoInsignia,
  type InsigniasResponse,
} from "@/lib/insignias"

export function InsigniasGrid() {
  const [data, setData] = useState<InsigniasResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let vivo = true
    api
      .get<InsigniasResponse>("/gamificacion/insignias")
      .then((res) => vivo && setData(res.data))
      .catch(() => vivo && setError(true))
    return () => {
      vivo = false
    }
  }, [])

  if (error) return null

  return (
    <section className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="text-lg font-bold font-heading text-[#1F2937]">Insignias</h2>
        {data && (
          <span className="text-xs font-semibold text-[#6B7280]">
            {data.ganadas} / {data.total} ganadas
          </span>
        )}
      </div>
      <p className="text-xs text-[#6B7280] mb-4">
        Se ganan por hitos concretos y suman puntos extra. Las grises te dicen cómo conseguirlas.
      </p>

      {!data ? (
        <p className="text-sm text-[#6B7280]">Cargando…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.insignias.map((ins) => {
            const Icono = iconoInsignia(ins.icono)
            const est = ESTILO_RAREZA[ins.rareza]
            return (
              <div
                key={ins.id}
                title={ins.ganada ? ins.descripcion : ins.criterio}
                className={`flex flex-col items-center text-center gap-2 rounded-xl border p-3 transition-colors ${
                  ins.ganada ? "border-[#E2E8F0] bg-white" : "border-dashed border-[#E2E8F0] bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center ${
                    ins.ganada ? `${est.fondo} ${est.anillo}` : "bg-[#F1F5F9] ring-2 ring-[#E2E8F0]"
                  }`}
                >
                  <Icono className={`w-6 h-6 ${ins.ganada ? est.icono : "text-[#CBD5E1]"}`} />
                  {!ins.ganada && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-[#94A3B8]" />
                    </span>
                  )}
                </div>
                <div>
                  <p className={`text-xs font-semibold leading-tight ${ins.ganada ? "text-[#1F2937]" : "text-[#94A3B8]"}`}>
                    {ins.nombre}
                  </p>
                  <p className="mt-1 text-[10px] leading-tight text-[#94A3B8]">
                    {ins.ganada ? ins.descripcion : ins.criterio}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
