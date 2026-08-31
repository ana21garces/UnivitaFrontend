"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, estadoDeError, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { ArrowLeft, AlertCircle, Stethoscope } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { TarjetaSeguimiento } from "@/components/tarjeta-seguimiento"
import type { SeguimientoRecomendacion, TarjetasSeguimientoResponse } from "@/lib/seguimiento-recomendaciones"

// ── Página principal ───────────────────────────────────────────────────────

export default function RecomendacionesRSPage() {
  const router = useRouter()
  const [data, setData] = useState<TarjetasSeguimientoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [noEncuesta, setNoEncuesta] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/"); return }

    api
      .get("/seguimiento-recomendaciones/responsabilidad-salud/tarjetas")
      .then((res) => setData(res.data))
      .catch((err) => {
        if (redirigirPorError(err, router)) return
        if (estadoDeError(err) === 404) { setNoEncuesta(true); return }
        setError("No se pudo cargar el plan. Intenta de nuevo más tarde.")
      })
      .finally(() => setLoading(false))
  }, [router])

  const actualizarSeguimiento = (nuevo: SeguimientoRecomendacion) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            tarjetas: prev.tarjetas.map((t) =>
              t.seguimiento.id === nuevo.id ? { ...t, seguimiento: nuevo } : t
            ),
          }
        : prev
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="user" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">

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
            <div className="w-10 h-10 rounded-2xl bg-[#ECFEFF] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#0891B2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#1F2937]">Responsabilidad en Salud</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">Recomendaciones personalizadas</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-sm font-bold text-[#1F2937]">{Math.round(data.indice_dimension)}%</p>
                <p className="text-[10px] text-[#6B7280]">Porcentaje</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-sm font-bold text-[#1F2937]">{data.nivel_dimension}</p>
                <p className="text-[10px] text-[#6B7280]">Nivel</p>
              </div>
            </div>
          )}
        </div>

        {noEncuesta && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Stethoscope className="w-12 h-12 text-[#CBD5E1]" />
            <div>
              <p className="font-semibold text-[#1F2937]">Completa la encuesta primero</p>
              <p className="text-sm text-[#6B7280] mt-1">
                Debes completar el cuestionario de salud para ver tus recomendaciones.
              </p>
            </div>
            <Link
              href="/onboarding/survey"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#0891B2,#06B6D4)" }}
            >
              Ir a la encuesta
            </Link>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && !noEncuesta && data && (
          <>
            {data.tarjetas.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-[#1F2937]">¡Excelente responsabilidad!</p>
                <p className="text-sm mt-1">No tienes áreas de mejora en esta dimensión.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.tarjetas.map((t) => (
                  <TarjetaSeguimiento
                    key={t.seguimiento.id}
                    tarjeta={t.tarjeta}
                    seguimiento={t.seguimiento}
                    onUpdate={actualizarSeguimiento}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
