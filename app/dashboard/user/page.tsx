"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Zap, Activity, Timer, Star, Lock } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
  psicologia_positiva: "Crecimiento espiritual",
  actividad_fisica: "Actividad física",
  relaciones_interpersonales: "Relaciones interpersonales",
  nutricion: "Nutrición",
  manejo_estres: "Manejo del estrés",
}

const ACTIVITIES_BY_DIMENSION: Record<string, Array<{ title: string; xp: number }>> = {
  actividad_fisica: [
    { title: "Caminata de 30 min al aire libre", xp: 20 },
    { title: "Rutina de estiramientos matutinos", xp: 15 },
  ],
  manejo_estres: [
    { title: "Ejercicio de respiración 4-7-8", xp: 15 },
    { title: "30 min sin pantallas antes de dormir", xp: 15 },
  ],
  nutricion: [
    { title: "Registrar lo que comí hoy", xp: 10 },
    { title: "Incluir una fruta en el desayuno", xp: 10 },
  ],
  relaciones_interpersonales: [{ title: "Llama a un amigo o familiar hoy", xp: 10 }],
  responsabilidad_salud: [{ title: "Programa una consulta médica preventiva", xp: 20 }],
  psicologia_positiva: [{ title: "Escribe 3 cosas por las que estás agradecido", xp: 10 }],
}

const PUNTAJE_RANGES: Record<string, string> = {
  Pobre: "52–90",
  Moderado: "91–129",
  Bueno: "130–168",
  Excelente: "169–208",
}

const XP_TARGETS: Record<number, number> = { 1: 100, 2: 400, 3: 800, 4: 1000 }

function getLevelInfo(indice: number) {
  if (indice >= 84) return { numero: 4, nivel: "Excelente", nextThreshold: null, nextNivel: null }
  if (indice >= 67) return { numero: 3, nivel: "Bueno", nextThreshold: 84, nextNivel: "Excelente" }
  if (indice >= 34) return { numero: 2, nivel: "Moderado", nextThreshold: 67, nextNivel: "Bueno" }
  return { numero: 1, nivel: "Pobre", nextThreshold: 34, nextNivel: "Moderado" }
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

// ── Badges ────────────────────────────────────────────────────────────────────
type Badge = {
  id: string
  emoji: string
  name: string
  description: string
  gradient: string
  unlocked: boolean
  rarity: "inicio" | "plata" | "oro" | "platino"
}

function buildBadges(r: EncuestaResultado["resultados"]): Badge[] {
  const nivel = r.nivel_global
  const dim = r

  return [
    {
      id: "peps_done",
      emoji: "📋",
      name: "Explorador PEPS II",
      description: "Completaste el cuestionario PEPS II",
      gradient: "linear-gradient(135deg, #16A34A, #22C55E)",
      unlocked: true,
      rarity: "inicio",
    },
    {
      id: "atleta",
      emoji: "🏃",
      name: "Atleta",
      description: "Actividad física en nivel Bueno o superior",
      gradient: "linear-gradient(135deg, #2563EB, #38BDF8)",
      unlocked: dim.actividad_fisica.nivel === "Bueno" || dim.actividad_fisica.nivel === "Excelente",
      rarity: "plata",
    },
    {
      id: "nutricionista",
      emoji: "🥗",
      name: "Nutricionista",
      description: "Nutrición en nivel Bueno o superior",
      gradient: "linear-gradient(135deg, #16A34A, #86EFAC)",
      unlocked: dim.nutricion.nivel === "Bueno" || dim.nutricion.nivel === "Excelente",
      rarity: "plata",
    },
    {
      id: "zen",
      emoji: "🧘",
      name: "Mente Zen",
      description: "Manejo del estrés en nivel Bueno o superior",
      gradient: "linear-gradient(135deg, #7C3AED, #C4B5FD)",
      unlocked: dim.manejo_estres.nivel === "Bueno" || dim.manejo_estres.nivel === "Excelente",
      rarity: "plata",
    },
    {
      id: "social",
      emoji: "🤝",
      name: "Conector Social",
      description: "Relaciones interpersonales en nivel Bueno o superior",
      gradient: "linear-gradient(135deg, #EA580C, #FCD34D)",
      unlocked: dim.relaciones_interpersonales.nivel === "Bueno" || dim.relaciones_interpersonales.nivel === "Excelente",
      rarity: "plata",
    },
    {
      id: "responsable",
      emoji: "🩺",
      name: "Responsable",
      description: "Responsabilidad en salud en nivel Bueno o superior",
      gradient: "linear-gradient(135deg, #0891B2, #67E8F9)",
      unlocked: dim.responsabilidad_salud.nivel === "Bueno" || dim.responsabilidad_salud.nivel === "Excelente",
      rarity: "plata",
    },
    {
      id: "espiritual",
      emoji: "✨",
      name: "Crecimiento Espiritual",
      description: "Psicología positiva en nivel Bueno o superior",
      gradient: "linear-gradient(135deg, #DB2777, #F9A8D4)",
      unlocked: dim.psicologia_positiva.nivel === "Bueno" || dim.psicologia_positiva.nivel === "Excelente",
      rarity: "oro",
    },
    {
      id: "moderado",
      emoji: "⭐",
      name: "Estilo Moderado",
      description: "Alcanza nivel Moderado en PEPS II",
      gradient: "linear-gradient(135deg, #F59E0B, #FCD34D)",
      unlocked: nivel === "Moderado" || nivel === "Bueno" || nivel === "Excelente",
      rarity: "plata",
    },
    {
      id: "bueno",
      emoji: "🌟",
      name: "Estilo Bueno",
      description: "Alcanza nivel Bueno en PEPS II",
      gradient: "linear-gradient(135deg, #2563EB, #818CF8)",
      unlocked: nivel === "Bueno" || nivel === "Excelente",
      rarity: "oro",
    },
    {
      id: "excelente",
      emoji: "🏆",
      name: "Estilo Excelente",
      description: "Alcanza el nivel máximo en PEPS II",
      gradient: "linear-gradient(135deg, #D97706, #FDE68A)",
      unlocked: nivel === "Excelente",
      rarity: "platino",
    },
  ]
}

const rarityColors: Record<string, { text: string; bg: string; border: string }> = {
  inicio:  { text: "#6B7280", bg: "#F1F5F9", border: "#E2E8F0" },
  plata:   { text: "#475569", bg: "#F1F5F9", border: "#CBD5E1" },
  oro:     { text: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  platino: { text: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
}

export default function UserDashboard() {
  const router = useRouter()
  const [resultado, setResultado] = useState<EncuestaResultado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResultado = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) { router.push("/"); return }
      try {
        const { data } = await axios.get(`${API_URL}/encuesta/resultado`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        })
        setResultado(data)
      } catch (err: any) {
        if (err.response?.status === 404) {
          document.cookie = "univita8_survey_done=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
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
  const levelInfo = getLevelInfo(resultados.indice_global)
  const xpTotal = Math.round(100 + resultados.indice_global * 1.9)
  const xpTarget = XP_TARGETS[levelInfo.numero] ?? 1000

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

  const recommendedActivities = lowestThree
    .flatMap((d) => (ACTIVITIES_BY_DIMENSION[d.key] ?? []).map((act) => ({ ...act, dimension: DIMENSION_NAMES[d.key] })))
    .slice(0, 5)

  const badges = buildBadges(resultados)
  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <>
      <DashboardNavbar
        role="user"
        userName="Estudiante"
        xp={xpTotal}
        maxXp={xpTarget}
        level={levelInfo.numero}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold font-heading text-[#1F2937]">Welcome back, Student!</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Completaste el cuestionario PEPS II — aquí están tus resultados de estilo de vida.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Zap className="w-5 h-5 text-[#22C55E]" />, bg: "bg-[#22C55E]/10", value: xpTotal, label: "XP Earned" },
            { icon: <Activity className="w-5 h-5 text-[#7C3AED]" />, bg: "bg-[#7C3AED]/10", value: Math.round(resultados.indice_global), label: "PEPS II índice" },
            { icon: <Timer className="w-5 h-5 text-[#FACC15]" />, bg: "bg-[#FACC15]/10", value: 5, label: "Day Streak" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1F2937]">{stat.value}</p>
                <p className="text-xs text-[#6B7280]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Level banner */}
        <div
          className="flex items-center justify-between p-5 mb-6 rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-heading">
                Nivel {levelInfo.numero} — {levelInfo.nivel}
              </p>
              <p className="text-sm text-white/80">
                Tu estilo de vida PEPS II es {levelInfo.nivel.toLowerCase()}
                {levelInfo.nextNivel && ` · Sube a Nivel ${levelInfo.numero + 1} (${levelInfo.nextNivel})`}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold mb-1">{xpTotal} / {xpTarget} XP</p>
            <div className="w-36 h-2 bg-white/30 rounded-full">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${Math.min((xpTotal / xpTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

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
            <p className="text-xs text-[#6B7280] mb-4">
              Puntaje crudo: {resultados.puntaje_crudo}/208 · Rango {resultados.nivel_global.toLowerCase()}:{" "}
              {PUNTAJE_RANGES[resultados.nivel_global]}
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#22C55E]/10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/20 text-xs font-bold text-[#16A34A]">
                <Zap className="w-3 h-3" />+100 XP
              </span>
              <span className="text-xs text-[#1F2937] font-medium">Encuesta completada</span>
            </div>
          </section>

          {/* Índice por dimensión */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4">Índice por dimensión</h3>
            <div className="flex flex-col gap-3.5">
              {dimensions.map((dim) => (
                <div key={dim.key} className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280] w-44 shrink-0">{DIMENSION_NAMES[dim.key]}</span>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full">
                    <div className={`h-full rounded-full ${getBarColor(dim.nivel)}`} style={{ width: `${dim.indice}%` }} />
                  </div>
                  <span className="text-sm font-bold text-[#1F2937] w-8 text-right">{Math.round(dim.indice)}</span>
                  <span className="text-xs font-semibold w-20 text-right" style={{ color: getNivelColor(dim.nivel) }}>
                    {dim.nivel}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-4">Las barras en rojo indican dimensiones prioritarias a mejorar.</p>
          </section>
        </div>

        {/* ── Medallas y logros ── */}
        <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold font-heading text-[#1F2937]">Medallas y logros</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {unlockedCount} de {badges.length} desbloqueadas
              </p>
            </div>
            {/* progress */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-32 h-2 bg-[#F1F5F9] rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(unlockedCount / badges.length) * 100}%`,
                    background: "linear-gradient(90deg, #16A34A, #22C55E)",
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-[#6B7280]">{Math.round((unlockedCount / badges.length) * 100)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {badges.map((badge) => {
              const rc = rarityColors[badge.rarity]
              return (
                <div
                  key={badge.id}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    badge.unlocked
                      ? "shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      : "opacity-50 grayscale"
                  }`}
                  style={badge.unlocked ? { borderColor: rc.border, backgroundColor: rc.bg } : { borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                >
                  {/* rarity tag */}
                  <span
                    className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ color: rc.text, backgroundColor: `${rc.bg}` }}
                  >
                    {badge.rarity}
                  </span>

                  {/* icon circle */}
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-full text-2xl shadow-sm"
                    style={badge.unlocked ? { background: badge.gradient } : { background: "#E2E8F0" }}
                  >
                    {badge.unlocked ? badge.emoji : <Lock className="w-5 h-5 text-[#9CA3AF]" />}
                  </div>

                  <p className="text-xs font-bold text-[#1F2937] leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-[#6B7280] leading-tight">{badge.description}</p>

                  {badge.unlocked && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[10px] font-bold text-[#16A34A]">
                      ✓ Desbloqueada
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Actividades + Ruta siguiente nivel */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Actividades recomendadas */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Actividades recomendadas</h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Basadas en tus dimensiones más bajas: {lowestThree.map((d) => DIMENSION_NAMES[d.key]).join(", ")}
            </p>
            <div className="flex flex-col gap-2">
              {recommendedActivities.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#16A34A]/40 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{act.title}</p>
                    <p className="text-xs text-[#6B7280]">{act.dimension}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                    <Zap className="w-3 h-3" />+{act.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Ruta siguiente nivel */}
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Ruta hacia el siguiente nivel</h3>
            {levelInfo.nextThreshold ? (
              <>
                <p className="text-xs text-[#6B7280] mb-4">
                  Para subir a Nivel {levelInfo.numero + 1} ({levelInfo.nextNivel}) necesitas mejorar tu índice global a {levelInfo.nextThreshold}+
                </p>
                <p className="text-xs text-[#6B7280] mb-1">XP acumulado</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#1F2937]">{xpTotal} / {xpTarget}</span>
                </div>
                <div className="w-full h-3 bg-[#F1F5F9] rounded-full mb-5">
                  <div
                    className="h-full bg-[#22C55E] rounded-full"
                    style={{ width: `${Math.min((xpTotal / xpTarget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-[#1F2937] mb-2">Dimensiones que más impactan tu nivel:</p>
                {lowestThree.map((d, i) => (
                  <div key={d.key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-[#1F2937]">{DIMENSION_NAMES[d.key]} ({Math.round(d.indice)})</span>
                    <span className="text-xs font-semibold" style={{ color: i === 0 ? "#EF4444" : "#F59E0B" }}>
                      {i === 0 ? "Prioridad alta" : "Prioridad media"}
                    </span>
                  </div>
                ))}
                <button className="w-full mt-4 h-10 rounded-lg border border-[#E2E8F0] text-sm text-[#6B7280] hover:bg-[#F1F5F9] transition-colors">
                  Ver plan semanal personalizado ↗
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-4">
                <div
                  className="flex items-center justify-center w-24 h-24 rounded-full text-5xl shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D97706, #FDE68A)" }}
                >
                  🏆
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#D97706]">¡Nivel Máximo Alcanzado!</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Tu estilo de vida PEPS II es Excelente. ¡Sigue así!
                  </p>
                </div>
                <div className="flex gap-2 text-2xl">
                  <span title="Oro">🥇</span>
                  <span title="Estrellas">⭐</span>
                  <span title="Brillante">✨</span>
                </div>
                <div
                  className="w-full py-2 rounded-lg text-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #D97706, #FDE68A)", color: "#fff" }}
                >
                  Eres parte del top de estudiantes saludables
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
