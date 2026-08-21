"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, estadoDeError, redirigirPorError } from "@/lib/api"
import Link from "next/link"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { MisionesHoySection } from "@/components/misiones-hoy"
import { getAccessToken, setSurveyDone } from "@/lib/auth"
import { TrendingUp } from "lucide-react"

type DimensionResult = { indice: number; nivel: string }
type EncuestaResultado = {
  encuesta_id: number
  usuario_id: string
  fecha: string
  resultados: {
    puntaje_crudo: number
    indice_global: number
    nivel_global: string
    relaciones_interpersonales: DimensionResult
    nutricion: DimensionResult
    responsabilidad_salud: DimensionResult
    actividad_fisica: DimensionResult
    manejo_estres: DimensionResult
    psicologia_positiva: DimensionResult
  }
}

const DIMENSION_NAMES: Record<string, string> = {
  responsabilidad_salud: "Responsabilidad salud",
  psicologia_positiva: "Psicología positiva",
  actividad_fisica: "Actividad física",
  relaciones_interpersonales: "Relaciones interpersonales",
  nutricion: "Nutrición",
  manejo_estres: "Manejo del estrés",
}

// Dimensiones que ya tienen plan en el backend — las demás no muestran enlace
const DIMENSION_PLAN_ROUTE: Record<string, string> = {
  psicologia_positiva:   "/dashboard/plan-semanal",
  actividad_fisica:      "/dashboard/recomendaciones-af",
  responsabilidad_salud: "/dashboard/recomendaciones/responsabilidad-salud",
  relaciones_interpersonales: "/dashboard/recomendaciones-ri",
  manejo_estres:         "/dashboard/recomendaciones-me",
  nutricion: "/dashboard/recomendaciones-n",
}

const PUNTAJE_RANGES: Record<string, string> = {
  Pobre: "52–90",
  Moderado: "91–129",
  Bueno: "130–168",
  Excelente: "169–208",
}

function getNivelColor(nivel: string) {
  switch (nivel) {
    case "Excelente": return "#22C55E"
    case "Bueno": return "#2563EB"
    case "Moderado": return "#F59E0B"
    case "Pobre": return "#EF4444"
    default: return "#6B7280"
  }
}

function getBarColor(nivel: string) {
  switch (nivel) {
    case "Excelente":
    case "Bueno": return "bg-green-500"
    case "Moderado": return "bg-amber-400"
    case "Pobre": return "bg-red-500"
    default: return "bg-gray-300"
  }
}

export default function UserDashboard() {
  const router = useRouter()
  const [resultado, setResultado] = useState<EncuestaResultado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResultado = async () => {
      if (!getAccessToken()) { router.push("/"); return }
      try {
        const { data } = await api.get("/encuesta/resultado")
        setResultado(data)
      } catch (err) {
        // Sin esto, una sesion caducada dejaba la pantalla cargando para siempre.
        if (redirigirPorError(err, router)) return
        if (estadoDeError(err) === 404) {
          setSurveyDone(false)
          router.push("/onboarding/survey")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchResultado()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-[#6B7280]">Cargando...</p>
      </div>
    )
  }
  if (!resultado) return null

  const { resultados } = resultado

  const dimensions = [
    { key: "responsabilidad_salud",        ...resultados.responsabilidad_salud },
    { key: "psicologia_positiva",          ...resultados.psicologia_positiva },
    { key: "actividad_fisica",             ...resultados.actividad_fisica },
    { key: "relaciones_interpersonales",   ...resultados.relaciones_interpersonales },
    { key: "nutricion",                    ...resultados.nutricion },
    { key: "manejo_estres",                ...resultados.manejo_estres },
  ]

  const sortedAsc = [...dimensions].sort((a, b) => a.indice - b.indice)
  const lowestThree = sortedAsc.slice(0, 3)
  const esNivelMaximo = resultados.nivel_global === "Excelente"

  return (
    <>
      <DashboardNavbar role="user" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F2937]">¡Bienvenido de nuevo!</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Completaste el cuestionario PEPS II — aquí están tus resultados y misiones de hoy.
            </p>
          </div>
          <Link
            href="/dashboard/mi-evolucion"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-white shadow-md shadow-[#16A34A]/20 hover:shadow-lg transition-all shrink-0"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            <TrendingUp className="w-4 h-4" /> Mi evolución
          </Link>
        </div>

        <MisionesHoySection />

        {/* PEPS II global + dimensiones */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Resultado global */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4">Resultado global PEPS II</h3>
            <div className="text-center mb-5">
              <p className="text-5xl font-bold" style={{ color: getNivelColor(resultados.nivel_global) }}>
                {Math.round(resultados.indice_global)}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">Índice global (0–100)</p>
              <span
                className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${getNivelColor(resultados.nivel_global)}18`, color: getNivelColor(resultados.nivel_global) }}
              >
                {resultados.nivel_global}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#6B7280] mb-2">Progresión de niveles</p>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {["Pobre", "Moderado", "Bueno", "Excelente"].map((nivel) => (
                <div
                  key={nivel}
                  className={`text-center py-1.5 rounded text-xs font-semibold ${
                    nivel === resultados.nivel_global ? "bg-[#16A34A] text-white" : "bg-[#F1F5F9] text-[#6B7280]"
                  }`}
                >
                  {nivel}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280]">
              Puntaje crudo: {resultados.puntaje_crudo}/208 · Rango {resultados.nivel_global.toLowerCase()}:{" "}
              {PUNTAJE_RANGES[resultados.nivel_global]}
            </p>
          </section>

          {/* Índice por dimensión */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4">Índice por dimensión</h3>
            <div className="flex flex-col gap-3.5">
              {dimensions.map((dim) => (
                <div key={dim.key} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-[#6B7280] w-24 sm:w-44 shrink-0 leading-tight">{DIMENSION_NAMES[dim.key]}</span>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full">
                    <div className={`h-full rounded-full ${getBarColor(dim.nivel)}`} style={{ width: `${dim.indice}%` }} />
                  </div>
                  <span className="text-sm font-bold text-[#1F2937] w-8 text-right shrink-0">{Math.round(dim.indice)}</span>
                  <span className="hidden sm:inline text-xs font-semibold w-20 text-right shrink-0" style={{ color: getNivelColor(dim.nivel) }}>
                    {dim.nivel}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-4">Las barras en rojo indican dimensiones prioritarias a mejorar.</p>
          </section>
        </div>

        {/* Dimensiones prioritarias */}
        <div className="grid lg:grid-cols-1 gap-6 items-start">
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Dimensiones prioritarias</h3>
            {!esNivelMaximo ? (
              <>
                <p className="text-xs text-[#6B7280] mb-4">
                  Estas tres dimensiones son las que más pueden mejorar tu estilo de vida:
                </p>
                <div className="flex flex-col divide-y divide-[#F1F5F9]">
                  {lowestThree.map((d, i) => {
                    const planRoute = DIMENSION_PLAN_ROUTE[d.key]
                    const prioColor = i === 0 ? "#EF4444" : "#F59E0B"
                    const prioLabel = i === 0 ? "Prioridad alta" : "Prioridad media"
                    return (
                      <div key={d.key} className="flex items-center justify-between py-2.5 gap-3">
                        <span className="text-sm text-[#1F2937] min-w-0">
                          {DIMENSION_NAMES[d.key]}{" "}
                          <span className="text-[#9CA3AF] font-normal">({Math.round(d.indice)})</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold" style={{ color: prioColor }}>
                            {prioLabel}
                          </span>
                          {planRoute && (
                            <Link
                              href={planRoute}
                              className="text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                              style={{ background: "#F0FDF4", color: "#16A34A" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#DCFCE7")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#F0FDF4")}
                            >
                              Ver plan →
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-full text-4xl shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D97706, #FDE68A)" }}
                >
                  🏆
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#D97706]">¡Estilo de vida Excelente!</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Tus seis dimensiones están en el nivel más alto del instrumento. Sigue así.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
