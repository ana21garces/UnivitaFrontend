// Tipos del backend nuevo `/api/v1/seguimiento-recomendaciones/...` —
// seguimiento diario (racha, notas, plantilla por actividad) de las
// recomendaciones personalizadas por dimensión.

export type TipoActividad =
  | "diario"
  | "registro_numerico"
  | "matriz"
  | "lista"
  | "habito_calendario"
  | "checklist_simple"

export type ConfigActividad = {
  prompt?: string
  unidad?: string
  cuadrantes?: string[]
  placeholder?: string
}

export type TarjetaRecomendacion = {
  pregunta_num: number
  pregunta_texto: string
  nivel: string
  puntaje: number
  tecnica: string
  objetivo: string
  instrucciones: string[]
  tipo_actividad: TipoActividad
  config_actividad: ConfigActividad | null
}

export type EstadoSeguimiento = "en_progreso" | "completada"

export type SeguimientoRecomendacion = {
  id: string
  dimension: string
  pregunta_num: number
  nivel: string
  estado: EstadoSeguimiento
  racha_actual: number
  mejor_racha: number
  total_dias_registrados: number
  ultima_fecha_registro: string | null
  completada_at: string | null
}

export type TarjetaConSeguimiento = {
  tarjeta: TarjetaRecomendacion
  seguimiento: SeguimientoRecomendacion
}

export type TarjetasSeguimientoResponse = {
  dimension: string
  nivel_dimension: string
  indice_dimension: number
  total: number
  tarjetas: TarjetaConSeguimiento[]
}

export type RegistroDiario = {
  id: string
  fecha: string
  notas: string | null
  created_at: string
}

export type RegistrarDiaResponse = {
  seguimiento: SeguimientoRecomendacion
  registro: RegistroDiario
  racha_aumento: boolean
}

export type ProgresoDimension = {
  dimension: string
  dimension_label: string
  total: number
  activas: number
  completadas: number
  mensaje_cierre: string | null
}

export type ProgresoSeguimientoResponse = {
  dimensiones: ProgresoDimension[]
}

/** Fecha de hoy en formato YYYY-MM-DD, para comparar contra
 * `ultima_fecha_registro` y deshabilitar "Lo hice hoy" si ya se registró.
 * Nota: usa la fecha local del navegador, no la de Bogotá que usa el
 * backend — en el borde de medianoche puede haber un desfase de unas
 * horas; si el usuario alcanza a hacer clic ahí, el backend responde 400
 * y el error se muestra igual que cualquier otro fallo. */
export function hoyLocalISO(): string {
  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, "0")
  const dd = String(hoy.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
