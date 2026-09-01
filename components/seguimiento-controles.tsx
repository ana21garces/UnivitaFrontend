"use client"

import { useState } from "react"
import { CheckCircle2, Flame, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import {
  hoyLocalISO,
  type RegistroDiario,
  type SeguimientoRecomendacion,
  type TarjetaRecomendacion,
} from "@/lib/seguimiento-recomendaciones"
import { PlantillaAutoexamenCorporal } from "@/components/actividades/PlantillaAutoexamenCorporal"
import { PlantillaChecklistSimple } from "@/components/actividades/PlantillaChecklistSimple"
import { PlantillaDiario } from "@/components/actividades/PlantillaDiario"
import { PlantillaHabitoCalendario } from "@/components/actividades/PlantillaHabitoCalendario"
import { PlantillaLista } from "@/components/actividades/PlantillaLista"
import { PlantillaMatriz } from "@/components/actividades/PlantillaMatriz"
import { PlantillaMatrizConHabito } from "@/components/actividades/PlantillaMatrizConHabito"
import { PlantillaPensamientoPositivo } from "@/components/actividades/PlantillaPensamientoPositivo"
import { PlantillaMetasSmart } from "@/components/actividades/PlantillaMetasSmart"
import { PlantillaServicioActivo } from "@/components/actividades/PlantillaServicioActivo"
import { PlantillaRutina } from "@/components/actividades/PlantillaRutina"
import { PlantillaRetoGradual } from "@/components/actividades/PlantillaRetoGradual"
import { PlantillaHabitosIdentidad } from "@/components/actividades/PlantillaHabitosIdentidad"
import { PlantillaOptimismoSemanal } from "@/components/actividades/PlantillaOptimismoSemanal"
import { PlantillaDiarioCampos } from "@/components/actividades/PlantillaDiarioCampos"
import { PlantillaMapaValores } from "@/components/actividades/PlantillaMapaValores"
import { PlantillaMicroReto } from "@/components/actividades/PlantillaMicroReto"
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
  const [confirmarCompletar, setConfirmarCompletar] = useState(false)
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
          ? `¡Racha de ${data.seguimiento.racha_actual} días! +15 puntos`
          : "Registrado hoy · +15 puntos"
      )
    } catch {
      setMensaje("No se pudo registrar. Intenta de nuevo.")
    } finally {
      setEnviando(false)
    }
  }

  const completar = async () => {
    setConfirmarCompletar(false)
    setCompletando(true)
    setMensaje(null)
    try {
      const { data } = await api.post(`/seguimiento-recomendaciones/${seguimiento.id}/completar`)
      onUpdate(data)
      setMensaje("¡Recomendación completada! +50 puntos")
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
        <div className="mb-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">Bitácora</p>
          {historial.length === 0 ? (
            <p className="text-xs text-[#6B7280]">Todavía no hay días registrados.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {historial.map((r) => (
                <li key={r.id} className="rounded-lg bg-white border border-[#E2E8F0] px-3 py-2">
                  <span className="text-xs font-semibold text-[#1F2937]">{r.fecha}</span>
                  {r.notas && (
                    <p className="mt-0.5 text-xs text-[#6B7280] whitespace-pre-line">{r.notas}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
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
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setConfirmarCompletar(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#CBD5E1] text-[#374151] hover:bg-[#F8FAFC] transition-colors"
          >
            Marcar como completada
          </button>
        </div>
      )}

      {confirmarCompletar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmarCompletar(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEF3C7] shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1F2937]">Completar recomendación</h3>
                <p className="text-sm text-[#6B7280] mt-1">
                  ¿Marcar esta recomendación como completada? No podrás registrar más días en ella.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmarCompletar(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={completando}
                onClick={completar}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 transition-colors"
              >
                {completando ? "..." : "Sí, completar"}
              </button>
            </div>
          </div>
        </div>
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
    case "matriz_habito":
      return <PlantillaMatrizConHabito config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "lista":
      return <PlantillaLista config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "habito_calendario":
      return <PlantillaHabitoCalendario enviando={enviando} onEnviar={onEnviar} />
    case "autoexamen_corporal":
      return <PlantillaAutoexamenCorporal enviando={enviando} onEnviar={onEnviar} />
    case "pensamiento_positivo_dia":
      return <PlantillaPensamientoPositivo enviando={enviando} onEnviar={onEnviar} />
    case "metas_smart":
      return <PlantillaMetasSmart config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "servicio_activo_valores":
      return <PlantillaServicioActivo enviando={enviando} onEnviar={onEnviar} />
    case "rutina_pasos":
      return <PlantillaRutina config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "reto_gradual":
      return <PlantillaRetoGradual enviando={enviando} onEnviar={onEnviar} />
    case "habitos_identidad_semana":
      return <PlantillaHabitosIdentidad enviando={enviando} onEnviar={onEnviar} />
    case "optimismo_semanal":
      return <PlantillaOptimismoSemanal enviando={enviando} onEnviar={onEnviar} />
    case "diario_campos":
      return <PlantillaDiarioCampos config={tarjeta.config_actividad} objetivo={tarjeta.objetivo} enviando={enviando} onEnviar={onEnviar} />
    case "mapa_valores":
      return <PlantillaMapaValores enviando={enviando} onEnviar={onEnviar} />
    case "micro_reto":
      return <PlantillaMicroReto enviando={enviando} onEnviar={onEnviar} />
    default:
      return <PlantillaChecklistSimple enviando={enviando} onEnviar={onEnviar} />
  }
}
