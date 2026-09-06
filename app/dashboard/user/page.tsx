"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, estadoDeError, redirigirPorError } from "@/lib/api"
import Link from "next/link"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { MisionesHoySection } from "@/components/misiones-hoy"
import { InsigniasContador } from "@/components/insignias-contador"
import { AsistenteUnacHealth } from "@/components/asistente-unachealth"
import { getAccessToken, setSurveyDone } from "@/lib/auth"
import { TrendingUp } from "lucide-react"
import type { ProgresoDimension } from "@/lib/seguimiento-recomendaciones"

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

// Emoji + color pastel por dimensión — coordinados con la gama del
// dashboard (los mismos tonos suaves que ya usan las secciones de nivel
// y prioridad) en vez de un solo color plano para todas.
const DIMENSION_BADGE: Record<string, { emoji: string; bg: string }> = {
  responsabilidad_salud:      { emoji: "🩺", bg: "#EFF6FF" },
  psicologia_positiva:        { emoji: "🧠", bg: "#F5F3FF" },
  actividad_fisica:           { emoji: "💪", bg: "#FFF7ED" },
  relaciones_interpersonales: { emoji: "🤝", bg: "#FDF2F8" },
  nutricion:                  { emoji: "🥗", bg: "#F0FDF4" },
  manejo_estres:              { emoji: "🧘", bg: "#ECFEFF" },
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

// Rango en porcentaje (0–100) de cada nivel. Es la misma escala que la barra
// de cada dimensión, para que se lea igual en toda la pantalla.
const NIVEL_RANGO_PCT: Record<string, string> = {
  Pobre: "0 a 25%",
  Moderado: "26 a 50%",
  Bueno: "51 a 75%",
  Excelente: "76 a 100%",
}

// Explicación en lenguaje sencillo de qué significa cada nivel, para que
// cualquier persona lo entienda sin tecnicismos.
const NIVEL_EXPLICACION: Record<string, string> = {
  Pobre: "Varios de tus hábitos de vida pueden mejorar. El plan de abajo te muestra por dónde empezar.",
  Moderado: "Vas bien en varias cosas y todavía puedes fortalecer algunos hábitos.",
  Bueno: "Tus hábitos de vida son sólidos. Puedes seguir afinando algunos detalles.",
  Excelente: "Tus hábitos de vida son muy saludables. ¡Sigue así!",
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

export default function UserDashboard() {  const router = useRouter()
  const [resultado, setResultado] = useState<EncuestaResultado | null>(null)
  const [loading, setLoading] = useState(true)
  const [progreso, setProgreso] = useState<Record<string, ProgresoDimension>>({})

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

    // Progreso de seguimiento por dimensión — solo informativo, si falla
    // (ej. todavía sin encuesta) simplemente no se muestran los badges.
    api.get("/seguimiento-recomendaciones/progreso")
      .then(({ data }) => {
        const porDimension: Record<string, ProgresoDimension> = {}
        for (const d of data.dimensiones as ProgresoDimension[]) porDimension[d.dimension] = d
        setProgreso(porDimension)
      })
      .catch(() => {})
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
  // Prioriza las 3 dimensiones más bajas, pero si hay empate en el corte
  // (ej. todas en 0/Pobre) se incluyen todas las empatadas, no solo las
  // primeras 3 del orden de array — si no, dimensiones igual de mal
  // calificadas quedarían sin "Ver plan" por pura casualidad de posición.
  const indiceCorte = sortedAsc[Math.min(2, sortedAsc.length - 1)]?.indice ?? 0
  const dimensionesPrioritarias = sortedAsc.filter((d) => d.indice <= indiceCorte)
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
          <div className="flex items-center gap-3 shrink-0">
            <InsigniasContador />
            <Link
              href="/dashboard/mi-evolucion"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-white shadow-md shadow-[#16A34A]/20 hover:shadow-lg transition-all shrink-0"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              <TrendingUp className="w-4 h-4" /> Mi evolución
            </Link>
          </div>
        </div>

        {/* PEPS II global + dimensiones — primero los resultados */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Resultado global */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Resultado global PEPS II</h3>
            <p className="text-xs text-[#6B7280] mb-4">Tu bienestar general según el cuestionario de salud</p>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold" style={{ color: getNivelColor(resultados.nivel_global) }}>
                {Math.round(resultados.indice_global)}%
              </p>
              <span
                className="inline-block mt-3 px-5 py-2 rounded-full text-lg font-bold"
                style={{ backgroundColor: `${getNivelColor(resultados.nivel_global)}18`, color: getNivelColor(resultados.nivel_global) }}
              >
                {resultados.nivel_global}
              </span>
            </div>
            {/* Barra 0–100% con las cuatro zonas de nivel */}
            <div className="relative h-3 rounded-full bg-[#F1F5F9] mb-1">
              <div
                className={`h-full rounded-full ${getBarColor(resultados.nivel_global)}`}
                style={{ width: `${Math.max(2, Math.round(resultados.indice_global))}%` }}
              />
              {[25, 50, 75].map((m) => (
                <span key={m} className="absolute top-0 h-full w-px bg-white" style={{ left: `${m}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-4">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
            <p className="text-xs text-[#6B7280] mb-4">
              Es un resumen de tus respuestas al cuestionario de salud, de 0% a 100%.
              No son los puntos que ganas al completar tus misiones diarias.
            </p>
            <p className="text-xs font-semibold text-[#6B7280] mb-2">Los cuatro niveles</p>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {["Pobre", "Moderado", "Bueno", "Excelente"].map((nivel) => (
                <div
                  key={nivel}
                  className={`text-center py-1.5 rounded text-xs font-semibold leading-tight ${
                    nivel === resultados.nivel_global ? "bg-[#16A34A] text-white" : "bg-[#F1F5F9] text-[#6B7280]"
                  }`}
                >
                  {nivel}
                  <span className="block text-[10px] font-normal opacity-90">{NIVEL_RANGO_PCT[nivel]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280]">
              <span className="font-semibold">Nivel {resultados.nivel_global.toLowerCase()}:</span>{" "}
              {NIVEL_EXPLICACION[resultados.nivel_global]}
            </p>
          </section>

          {/* Nivel por dimensión */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-2">Nivel por dimensión</h3>
            <div className="flex-1 flex flex-col divide-y divide-[#F1F5F9]">
              {dimensions.map((dim) => (
                <div key={dim.key} className="flex-1 flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="text-xs font-medium text-[#374151] w-28 sm:w-36 shrink-0 leading-tight">
                    {DIMENSION_NAMES[dim.key]}
                  </span>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getBarColor(dim.nivel)}`} style={{ width: `${Math.max(dim.indice, 3)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937] w-8 text-right shrink-0 tabular-nums">
                    {Math.round(dim.indice)}%
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full w-[76px] text-center shrink-0"
                    style={{ backgroundColor: `${getNivelColor(dim.nivel)}18`, color: getNivelColor(dim.nivel) }}
                  >
                    {dim.nivel}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-4">
              El color de la barra indica el nivel: rojo es prioritario, ámbar por mejorar y verde va bien.
            </p>
          </section>
        </div>

        {/* Misiones del día — después de los resultados */}
        <div id="misiones-hoy" className="scroll-mt-24">
          <MisionesHoySection />
        </div>

        {/* Dimensiones prioritarias — las recomendaciones van al final */}
        <div className="grid lg:grid-cols-1 gap-6 items-start">
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Dimensiones prioritarias</h3>
            {!esNivelMaximo ? (
              <>
                <p className="text-xs text-[#6B7280] mb-1">
                  {dimensionesPrioritarias.length > 3
                    ? "Con base en tus resultados, todas estas dimensiones necesitan la misma atención para mejorar tu estilo de vida:"
                    : "Con base en tus resultados, estas tres dimensiones son las que más pueden mejorar tu estilo de vida:"}
                </p>
                <p className="text-xs text-[#6B7280] mb-4">
                  Entra a cada plan para ver las indicaciones que debes seguir para subirlas. Cada
                  día marcas las que hiciste; una recomendación cuenta como completada del plan
                  cuando decides cerrarla.
                </p>
                <div className="flex flex-col divide-y divide-[#F1F5F9]">
                  {dimensionesPrioritarias.map((d) => {
                    const planRoute = DIMENSION_PLAN_ROUTE[d.key]
                    const esLaMasBaja = d.indice === sortedAsc[0].indice
                    const prioColor = esLaMasBaja ? "#EF4444" : "#F59E0B"
                    const prioBg = esLaMasBaja ? "#FEF2F2" : "#FFFBEB"
                    const prioLabel = esLaMasBaja ? "Prioridad alta" : "Prioridad media"
                    const prog = progreso[d.key]
                    return (
                      <div key={d.key} className="flex items-center justify-between py-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="flex items-center justify-center w-9 h-9 rounded-full text-base shrink-0"
                            style={{ background: DIMENSION_BADGE[d.key].bg }}
                          >
                            {DIMENSION_BADGE[d.key].emoji}
                          </span>
                          <span className="text-sm text-[#1F2937] min-w-0">
                            {DIMENSION_NAMES[d.key]}
                            {prog && prog.total > 0 && (
                              <span className="block text-[10px] text-[#9CA3AF] font-normal">
                                {prog.mensaje_cierre
                                  ? "✓ Recomendaciones del plan completadas"
                                  : `Plan: ${prog.completadas}/${prog.total} recomendaciones completadas · Hoy: ${prog.registradas_hoy}/${prog.activas} registradas`}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: prioBg, color: prioColor }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: prioColor }} />
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

      <AsistenteUnacHealth />
    </>
  )
}
