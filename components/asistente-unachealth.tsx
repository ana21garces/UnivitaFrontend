"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Bot, X, Sparkles, Target, ClipboardList } from "lucide-react"
import { api } from "@/lib/api"

type PlanDimension = {
  dimension: string
  label: string
  completadas: number
  total: number
  activas: number
  registradas_hoy: number
}

type MensajeAsistente = {
  mensaje: string
  misiones: string[]
  plan: PlanDimension[]
  pendientes: number
  todo_hecho: boolean
}

export function AsistenteUnacHealth() {
  const [abierto, setAbierto] = useState(false)
  const [datos, setDatos] = useState<MensajeAsistente | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(() => {
    api
      .get("/asistente/mensaje")
      .then(({ data }) => setDatos(data))
      .catch(() => setDatos(null))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (abierto) cargar()
  }, [abierto, cargar])

  useEffect(() => {
    window.addEventListener("misiones-actualizadas", cargar)
    return () => window.removeEventListener("misiones-actualizadas", cargar)
  }, [cargar])

  const irAMisRetos = () => {
    setAbierto(false)
    document.getElementById("misiones-hoy")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const pendientes = datos?.pendientes ?? 0
  const todoHecho = datos?.todo_hecho ?? false

  return (
    <>
      {abierto && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white leading-tight">Asistente UnacHealth</p>
                <p className="text-[11px] text-white/80 leading-tight">Tu recordatorio de retos</p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="flex items-center justify-center w-7 h-7 rounded-full text-white/90 hover:bg-white/20 transition-colors shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto">
              {cargando ? (
                <p className="text-sm text-[#6B7280]">Cargando tus retos...</p>
              ) : (
                <>
                  <div className="flex gap-2.5">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                      style={{ background: todoHecho ? "#F0FDF4" : "#ECFDF5" }}
                    >
                      <Sparkles className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <p className="text-sm text-[#1F2937] whitespace-pre-line leading-relaxed">
                      {datos?.mensaje || "¡Hola! Revisa tus retos de hoy en el panel."}
                    </p>
                  </div>

                  {!!datos?.misiones.length && (
                    <ListaRetos
                      titulo="Misiones de hoy"
                      icono={<Target className="w-3.5 h-3.5 text-[#16A34A]" />}
                      items={datos.misiones}
                    />
                  )}

                  {!!datos?.plan.length && <PlanSeguimiento plan={datos.plan} />}

                  {!todoHecho && (
                    <button
                      type="button"
                      onClick={irAMisRetos}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white shadow-md shadow-[#16A34A]/20 hover:shadow-lg transition-all"
                      style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                    >
                      Ir a mis retos →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        aria-label="Asistente UnacHealth"
      >
        {abierto ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!abierto && !cargando && pendientes > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#EF4444] text-white text-[11px] font-bold border-2 border-white">
            {pendientes}
          </span>
        )}
      </button>
    </>
  )
}

function PlanSeguimiento({ plan }: { plan: PlanDimension[] }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <ClipboardList className="w-3.5 h-3.5 text-[#16A34A]" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
          Recomendaciones registradas hoy
        </p>
      </div>
      <ul className="flex flex-col gap-1">
        {plan.map((d) => {
          const cerrada = d.total > 0 && d.activas === 0
          const registro = d.registradas_hoy > 0
          return (
            <li key={d.dimension} className="flex items-baseline justify-between gap-2">
              <span className="text-[12px] text-[#374151] leading-tight">{d.label}</span>
              <span
                className={`text-[12px] font-semibold shrink-0 ${
                  cerrada || registro ? "text-[#16A34A]" : "text-[#94A3B8]"
                }`}
              >
                {cerrada ? "completada" : `${d.registradas_hoy}/${d.activas}`}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-[11px] text-[#94A3B8] leading-snug">
        Se reinicia cada día. El avance de tu plan lo ves en el panel.
      </p>
    </div>
  )
}

function ListaRetos({
  titulo,
  icono,
  items,
}: {
  titulo: string
  icono: ReactNode
  items: string[]
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icono}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{titulo}</p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((texto, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-[1.5px] border-[#86EFAC] shrink-0" />
            <span className="text-[12px] text-[#374151] leading-tight">{texto}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
