"use client"

import { useState } from "react"
import { CheckCircle2, Flame } from "lucide-react"
import { api } from "@/lib/api"
import {
  hoyLocalISO,
  type RegistroDiario,
  type SeguimientoRecomendacion,
  type TarjetaRecomendacion,
} from "@/lib/seguimiento-recomendaciones"
import { PlantillaChecklistSimple } from "@/components/actividades/PlantillaChecklistSimple"
import { PlantillaDiario } from "@/components/actividades/PlantillaDiario"
import { PlantillaHabitoCalendario } from "@/components/actividades/PlantillaHabitoCalendario"
import { PlantillaLista } from "@/components/actividades/PlantillaLista"
import { PlantillaMatriz } from "@/components/actividades/PlantillaMatriz"
import { PlantillaRegistroNumerico } from "@/components/actividades/PlantillaRegistroNumerico"

export function SeguimientoControles({
  tarjeta,
  seguimiento,
  onUpdate,
}: {
  tarjeta: TarjetaRecomendacion
  seguimiento: SeguimientoRecomendacion
  onUpdate: (nuevo: SeguimientoRecomendacion) => void
}) {
  const [enviando, setEnviando] = useState(false)
  const [completando, setCompletando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [historial, setHistorial] = useState<RegistroDiario[] | null>(null)
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  const completada = seguimiento.estado === "completada"
  const yaRegistradoHoy = seguimiento.ultima_fecha_registro === hoyLocalISO()

  const registrarDia = async (notas: string | null) => {
    setEnviando(true)
    setMensaje(null)
    try {
      const { data } = await api.post(
        `/seguimiento-recomendaciones/${seguimiento.id}/registrar-dia`,
        { notas }
      )
      onUpdate(data.seguimiento)
      setHistorial(null)
      setMensaje(
        data.racha_aumento
          ? `¡Racha de ${data.seguimiento.racha_actual} días! +15 XP`
          : "Registrado hoy · +15 XP"
      )
    } catch {
      setMensaje("No se pudo registrar. Intenta de nuevo.")
    } finally {
      setEnviando(false)
    }
  }

  const completar = async () => {
    if (!confirm("¿Marcar esta recomendación como completada? No podrás registrar más días en ella.")) return
    setCompletando(true)
    setMensaje(null)
    try {
      const { data } = await api.post(`/seguimiento-recomendaciones/${seguimiento.id}/completar`)
      onUpdate(data)
      setMensaje("¡Recomendación completada! +50 XP")
    } catch {
      setMensaje("No se pudo completar. Intenta de nuevo.")
    } finally {
      setCompletando(false)
    }
  }

  const toggleHistorial = async () => {
    if (historial !== null) {
      setHistorial(null)
      return
    }
    setCargandoHistorial(true)
    try {
      const { data } = await api.get(`/seguimiento-recomendaciones/${seguimiento.id}/historial`)
      setHistorial(data)
    } catch {
      setHistorial([])
    } finally {
      setCargandoHistorial(false)
    }
  }

  return (
    <div className={`mt-4 pt-4 border-t ${completada ? "border-[#16A34A]/20" : "border-[#E2E8F0]"}`}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {seguimiento.racha_actual > 0 && !completada && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
            <Flame className="w-4 h-4 text-orange-500" /> Racha: {seguimiento.racha_actual} días
          </span>
        )}
        {seguimiento.total_dias_registrados > 0 && (
          <span className="text-xs text-[#6B7280]">{seguimiento.total_dias_registrados} día(s) registrados</span>
        )}
        <button type="button" onClick={toggleHistorial} className="text-xs text-[#2563EB] font-semibold hover:underline">
          {cargandoHistorial ? "Cargando..." : historial !== null ? "Ocultar historial" : "Ver historial"}
        </button>
      </div>

      {historial !== null && (
        <ul className="mb-3 flex flex-col gap-1 text-xs text-[#6B7280]">
          {historial.length === 0 && <li>Todavía no hay días registrados.</li>}
          {historial.map((r) => (
            <li key={r.id} className="flex gap-2">
              <span className="font-semibold text-[#1F2937]">{r.fecha}</span>
              {r.notas && <span>· {r.notas}</span>}
            </li>
          ))}
        </ul>
      )}

      {completada ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
          <CheckCircle2 className="w-4 h-4" /> Completada
        </span>
      ) : yaRegistradoHoy ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ya registraste esta recomendación hoy
        </span>
      ) : (
        <PlantillaPorTipo tarjeta={tarjeta} enviando={enviando} onEnviar={registrarDia} />
      )}

      {mensaje && <p className="mt-2 text-xs font-semibold text-[#16A34A]">{mensaje}</p>}

      {!completada && (
        <button
          type="button"
          disabled={completando}
          onClick={completar}
          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#CBD5E1] text-[#374151] hover:bg-[#F8FAFC] disabled:opacity-60 transition-colors"
        >
          {completando ? "..." : "Marcar como completada"}
        </button>
      )}
    </div>
  )
}

function PlantillaPorTipo({
  tarjeta,
  enviando,
  onEnviar,
}: {
  tarjeta: TarjetaRecomendacion
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  switch (tarjeta.tipo_actividad) {
    case "diario":
      return <PlantillaDiario config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "registro_numerico":
      return <PlantillaRegistroNumerico config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "matriz":
      return <PlantillaMatriz config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "lista":
      return <PlantillaLista config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "habito_calendario":
      return <PlantillaHabitoCalendario enviando={enviando} onEnviar={onEnviar} />
    default:
      return <PlantillaChecklistSimple enviando={enviando} onEnviar={onEnviar} />
  }
}
