"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, estadoDeError, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, Brain } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

// ── Tipos ──────────────────────────────────────────────────────────────────

type Tarjeta = {
  pregunta_num: number
  pregunta_texto: string
  nivel: string
  puntaje: number
  tecnica: string
  objetivo: string
  instrucciones: string[]
}

type RecomendacionesMEData = {
  usuario_id: string
  nombre: string
  me_nivel: string
  me_indice: number
  total_tarjetas: number
  tarjetas: Tarjeta[]
}

// ── Helpers de estilo ──────────────────────────────────────────────────────

const NIVEL_CHIP: Record<string, { bg: string; text: string }> = {
  POBRE:     { bg: "#FFF5F5", text: "#E53E3E" },
  MODERADO:  { bg: "#FFFAF0", text: "#DD6B20" },
  BUENO:     { bg: "#EBF8FF", text: "#3182CE" },
  EXCELENTE: { bg: "#F0FFF4", text: "#38A169" },
}

function NivelChip({ nivel }: { nivel: string }) {
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

// ── Tarjeta de recomendación ───────────────────────────────────────────────

function TarjetaME({ tarjeta }: { tarjeta: Tarjeta }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      <button
        className="w-full flex items-start justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <NivelChip nivel={tarjeta.nivel} />
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
          <p className="text-sm text-[#374151] mt-4 mb-3 leading-relaxed">{tarjeta.objetivo}</p>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Instrucciones</p>
          <ol className="flex flex-col gap-2">
            {tarjeta.instrucciones.map((paso, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#374151]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F3FF] text-[#7C3AED] font-bold text-[10px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function RecomendacionesMEPage() {
  const router = useRouter()
  const [data, setData] = useState<RecomendacionesMEData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [noEncuesta, setNoEncuesta] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/"); return }

    api
      .get("/encuesta/recomendaciones/manejo-estres")
      .then((res) => setData(res.data))
      .catch((err) => {
        if (redirigirPorError(err, router)) return
        if (estadoDeError(err) === 404) { setNoEncuesta(true); return }
        setError("No se pudo cargar el plan. Intenta de nuevo más tarde.")
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="user" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/user"
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#1F2937]">Plan de Manejo del Estrés</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">Recomendaciones personalizadas</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-lg font-bold text-[#1F2937]">{data.me_indice.toFixed(1)}</p>
                <p className="text-[10px] text-[#6B7280]">Índice ME</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-sm font-bold text-[#1F2937]">{data.me_nivel}</p>
                <p className="text-[10px] text-[#6B7280]">Nivel ME</p>
              </div>
            </div>
          )}
        </div>

        {/* Encuesta no completada */}
        {noEncuesta && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Brain className="w-12 h-12 text-[#CBD5E1]" />
            <div>
              <p className="font-semibold text-[#1F2937]">Completa la encuesta primero</p>
              <p className="text-sm text-[#6B7280] mt-1">
                Debes completar el cuestionario de salud para ver tus recomendaciones de manejo del estrés.
              </p>
            </div>
            <Link
              href="/onboarding/survey"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}
            >
              Ir a la encuesta
            </Link>
          </div>
        )}

        {/* Carga */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error genérico */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tarjetas */}
        {!loading && !error && !noEncuesta && data && (
          <>
            {data.tarjetas.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">¡Excelente! No tienes áreas de mejora en manejo del estrés.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.tarjetas.map((t, i) => (
                  <TarjetaME key={i} tarjeta={t} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
