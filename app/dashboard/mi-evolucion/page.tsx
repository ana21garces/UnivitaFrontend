"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, estadoDeError, redirigirPorError } from "@/lib/api"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { getAccessToken, LOGIN_PATH } from "@/lib/auth"
import { ArrowRight, ArrowLeft, TrendingUp, TrendingDown, Minus, LineChart, AlertTriangle } from "lucide-react"

type Dim = { indice: number; nivel: string }
type Resultados = {
  puntaje_crudo: number
  indice_global: number
  nivel_global: string
  relaciones_interpersonales: Dim
  nutricion: Dim
  responsabilidad_salud: Dim
  actividad_fisica: Dim
  manejo_estres: Dim
  psicologia_positiva: Dim
}
type Medicion = {
  encuesta_id: number
  fecha: string
  ciclo: string | null
  ciclo_numero: number | null
  resultados: Resultados
}

const DIMS: { key: keyof Resultados; name: string }[] = [
  { key: "responsabilidad_salud", name: "Responsabilidad en salud" },
  { key: "psicologia_positiva", name: "Psicología positiva" },
  { key: "actividad_fisica", name: "Actividad física" },
  { key: "relaciones_interpersonales", name: "Relaciones interpersonales" },
  { key: "nutricion", name: "Nutrición" },
  { key: "manejo_estres", name: "Manejo del estrés" },
]

const ORDEN_NIVEL: Record<string, number> = { Pobre: 0, Moderado: 1, Bueno: 2, Excelente: 3 }

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })

const etiquetaMedicion = (m: Medicion) =>
  m.ciclo ?? (m.ciclo_numero != null ? `Medición ${m.ciclo_numero}` : "Medición")

// Presentación del cambio: verde si sube, rojo si baja, gris si igual.
function Delta({ antes, despues }: { antes: number; despues: number }) {
  const d = Math.round(despues) - Math.round(antes)
  if (d > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#16A34A]">
        <TrendingUp className="w-3.5 h-3.5" /> +{d}
      </span>
    )
  if (d < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#EF4444]">
        <TrendingDown className="w-3.5 h-3.5" /> {d}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#94A3B8]">
      <Minus className="w-3.5 h-3.5" /> 0
    </span>
  )
}

export default function MiEvolucionPage() {
  const router = useRouter()
  const [mediciones, setMediciones] = useState<Medicion[]>([])
  const [loading, setLoading] = useState(true)
  const [sinDatos, setSinDatos] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(LOGIN_PATH)
      return
    }
    api
      .get("/encuesta/historial")
      .then((res) => setMediciones(res.data.encuestas))
      .catch((err) => {
        if (redirigirPorError(err, router)) return
        if (estadoDeError(err) === 404) setSinDatos(true)
      })
      .finally(() => setLoading(false))
  }, [router])

  // El historial viene del más reciente al más antiguo.
  const latest = mediciones[0]
  const base = mediciones[mediciones.length - 1]
  const hayComparacion = mediciones.length >= 2

  const hayRetroceso =
    hayComparacion &&
    (Math.round(latest.resultados.indice_global) < Math.round(base.resultados.indice_global) ||
      DIMS.some((d) => {
        const antes = ORDEN_NIVEL[(base.resultados[d.key] as Dim).nivel] ?? 0
        const despues = ORDEN_NIVEL[(latest.resultados[d.key] as Dim).nivel] ?? 0
        return despues < antes
      }))

  return (
    <>
      <DashboardNavbar role="user" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard/user"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-6">
          <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Mi evolución</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Compara tu punto de partida con tu medición más reciente.
          </p>
        </div>

        <DisclaimerBanner compact className="mb-6" />

        {loading ? (
          <p className="text-sm text-[#6B7280]">Cargando...</p>
        ) : !hayComparacion ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-10 flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              <LineChart className="w-7 h-7" />
            </div>
            <p className="text-lg font-semibold text-[#1F2937]">Aún no hay con qué comparar</p>
            <p className="mt-1 text-sm text-[#6B7280] max-w-sm">
              {sinDatos
                ? "Cuando respondas la encuesta y luego un seguimiento, aquí verás tu evolución."
                : "Ya tienes tu línea base. Cuando respondas una nueva medición, aquí verás cómo cambió tu bienestar."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Qué se compara */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white shadow-sm px-4 py-3">
              <span className="text-xs font-medium text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1 rounded-lg">
                {etiquetaMedicion(base)} · {formatFecha(base.fecha)}
              </span>
              <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-xs font-medium text-[#3B6D11] bg-[#EAF3DE] border border-[#C0DD97] px-3 py-1 rounded-lg">
                {etiquetaMedicion(latest)} · {formatFecha(latest.fecha)}
              </span>
            </div>

            {/* Aviso de retroceso */}
            {hayRetroceso && (
              <div className="flex items-start gap-3 rounded-xl border border-[#FCD34D] bg-[#FFFBEB] px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#92400E]">Retrocediste respecto a tu punto de partida</p>
                  <p className="text-xs text-[#B45309] mt-0.5">
                    En esta medición bajaste en una o más áreas frente a tu línea base. Revisa las marcadas con ▼ y entra a sus planes para recuperarte.
                  </p>
                </div>
              </div>
            )}

            {/* Global */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-5">
              <p className="text-sm font-semibold text-[#1F2937] mb-3">Bienestar global</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-2xl font-medium text-[#94A3B8]">{Math.round(base.resultados.indice_global)}</span>
                <ArrowRight className="w-5 h-5 text-[#94A3B8]" />
                <span className="text-3xl font-bold text-[#1F2937]">{Math.round(latest.resultados.indice_global)}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F1F5F9]">
                  <Delta antes={base.resultados.indice_global} despues={latest.resultados.indice_global} />
                </span>
                {base.resultados.nivel_global !== latest.resultados.nivel_global && (
                  <span className="sm:ml-auto text-xs font-medium text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full">
                    {base.resultados.nivel_global} → {latest.resultados.nivel_global}
                  </span>
                )}
              </div>
            </div>

            {/* Por dimensión */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
              <div className="flex px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <span className="flex-[2] text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Dimensión</span>
                <span className="flex-[1.4] text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] text-center">Antes → Después</span>
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] text-right">Cambio</span>
              </div>
              {DIMS.map((d, i) => {
                const antes = base.resultados[d.key] as Dim
                const despues = latest.resultados[d.key] as Dim
                const nivelCambio = antes.nivel !== despues.nivel
                return (
                  <div key={d.key} className={`flex items-center px-4 py-3 ${i < DIMS.length - 1 ? "border-b border-[#E2E8F0]" : ""}`}>
                    <div className="flex-[2] min-w-0">
                      <p className="text-sm text-[#1F2937]">{d.name}</p>
                      {nivelCambio && (
                        <p className="text-[11px] font-medium text-[#2563EB] mt-0.5">
                          {antes.nivel} → {despues.nivel}
                        </p>
                      )}
                    </div>
                    <span className="flex-[1.4] text-center text-sm text-[#6B7280]">
                      {Math.round(antes.indice)} <span className="text-[#CBD5E1]">→</span>{" "}
                      <b className="text-[#1F2937]">{Math.round(despues.indice)}</b>
                    </span>
                    <span className="flex-1 flex justify-end">
                      <Delta antes={antes.indice} despues={despues.indice} />
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-[#94A3B8]">
              El índice va de 0 a 100. Un cambio ▲ indica mejora; ▼ indica que esa dimensión bajó.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
