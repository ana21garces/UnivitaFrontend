"use client"

import { useEffect, useState } from "react"
import { ClipboardList, Check, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

type Campana = {
  activa: boolean
  fecha_inicio: string | null
  fecha_fin: string | null
  abierta: boolean
  total_respuestas: number
}

export function CampanaUsabilidad() {
  const [campana, setCampana] = useState<Campana | null>(null)
  const [activa, setActiva] = useState(false)
  const [inicio, setInicio] = useState("")
  const [fin, setFin] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get("/usabilidad/campana")
      .then(({ data }) => {
        setCampana(data)
        setActiva(data.activa)
        setInicio(data.fecha_inicio ?? "")
        setFin(data.fecha_fin ?? "")
      })
      .catch(() => {})
  }, [])

  const guardar = async () => {
    setError("")
    if (inicio && fin && fin < inicio) {
      setError("La fecha 'Hasta' no puede ser anterior a 'Desde'.")
      return
    }
    setGuardando(true)
    try {
      const { data } = await api.put("/usabilidad/campana", {
        activa,
        fecha_inicio: inicio || null,
        fecha_fin: fin || null,
      })
      setCampana(data)
      setAviso("Campaña actualizada.")
      setTimeout(() => setAviso(""), 2600)
    } catch {
      setError("No se pudo guardar. Inténtalo de nuevo.")
    } finally {
      setGuardando(false)
    }
  }

  const inputCls =
    "w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#EAF3DE] text-[#16A34A] shrink-0">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold font-heading text-[#1F2937]">Encuesta de usabilidad</h3>
            {campana && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  campana.abierta ? "bg-[#F0FDF4] text-[#15803D]" : "bg-[#F1F5F9] text-[#6B7280]"
                }`}
              >
                {campana.abierta ? "Abierta" : "Cerrada"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
            Cuando la actives, a estudiantes y profesionales que no hayan respondido se les exige la encuesta al entrar (el admin nunca queda bloqueado).
            {campana ? ` ${campana.total_respuestas} respuesta(s) hasta ahora.` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={activa}
            onClick={() => setActiva((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${activa ? "bg-[#16A34A]" : "bg-[#CBD5E1]"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                activa ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm font-medium text-[#1F2937]">Campaña activa</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2937]">Desde (opcional)</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2937]">Hasta (opcional)</label>
            <input type="date" value={fin} min={inicio || undefined} onChange={(e) => setFin(e.target.value)} className={inputCls} />
          </div>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Si dejas las fechas vacías, la campaña queda abierta mientras esté activa. Con fechas, solo se abre dentro de ese rango.
        </p>

        {error && (
          <p className="text-sm text-[#DC2626] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          {aviso && (
            <span className="text-sm text-[#15803D] inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {aviso}
            </span>
          )}
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="ml-auto h-10 px-5 rounded-lg text-sm font-semibold text-white shadow-md disabled:opacity-60 transition-all"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
