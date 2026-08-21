"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Flame, Loader2, Target } from "lucide-react"
import { api } from "@/lib/api"
import { XpProgressBar } from "@/components/xp-progress-bar"
import type { MisionesHoy } from "@/lib/gamificacion"

interface MisionesHoyProps {
  onProgresoChange?: (progreso: MisionesHoy["progreso"]) => void
}

export function MisionesHoySection({ onProgresoChange }: MisionesHoyProps) {
  const [data, setData] = useState<MisionesHoy | null>(null)
  const [loading, setLoading] = useState(true)
  const [completando, setCompletando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      const { data: res } = await api.get<MisionesHoy>("/gamificacion/misiones/hoy")
      setData(res)
      onProgresoChange?.(res.progreso)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [onProgresoChange])

  useEffect(() => {
    cargar()
  }, [cargar])

  const completar = async (misionId: string) => {
    setCompletando(misionId)
    setMensaje(null)
    try {
      const { data: res } = await api.post(`/gamificacion/misiones/${misionId}/completar`)
      await cargar()
      onProgresoChange?.(res.progreso)
      let texto = `+${res.xp_ganado} XP`
      if (res.subio_nivel) texto += " · ¡Subiste de nivel!"
      if (res.nuevo_rank) texto += ` · Nuevo rango: ${res.nuevo_rank}`
      setMensaje(texto)
    } catch {
      setMensaje("No se pudo registrar la tarea. Intenta de nuevo.")
    } finally {
      setCompletando(null)
    }
  }

  if (loading) {
    return (
      <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6 mb-6 flex items-center justify-center gap-2 text-sm text-[#6B7280]">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando misiones de hoy...
      </section>
    )
  }

  if (!data) return null

  const todasCompletas = data.completadas_hoy === data.total_hoy

  return (
    <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold font-heading text-[#1F2937] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#16A34A]" />
            Misiones de hoy
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            {data.completadas_hoy}/{data.total_hoy} completadas
            {!todasCompletas && data.bonus_disponible > 0 && (
              <> · Bonus al completar todas: +{data.bonus_disponible} XP</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            Racha: {data.progreso.streak_days} días
          </span>
        </div>
      </div>

      <div className="mb-4">
        <XpProgressBar
          currentXp={data.progreso.xp_en_nivel}
          maxXp={data.progreso.xp_para_siguiente}
          level={data.progreso.current_level}
        />
      </div>

      {mensaje && (
        <p className="mb-3 text-sm font-semibold text-[#16A34A]">{mensaje}</p>
      )}

      <div className="flex flex-col gap-2">
        {data.misiones.map((mision) => (
          <div
            key={mision.id}
            className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors ${
              mision.completada
                ? "border-[#16A34A]/30 bg-[#F0FDF4]"
                : "border-[#E2E8F0] hover:border-[#16A34A]/40"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1F2937]">{mision.titulo}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{mision.descripcion}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-1">
                {mision.dimension_label}
                {mision.duracion_min ? ` · ${mision.duracion_min} min` : ""}
                {" · "}
                {mision.xp} XP
              </p>
            </div>
            {mision.completada ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                Hecho
              </span>
            ) : (
              <button
                type="button"
                disabled={completando === mision.id}
                onClick={() => completar(mision.id)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {completando === mision.id ? "..." : "✓ Hice"}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
