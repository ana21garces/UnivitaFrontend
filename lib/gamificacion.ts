export type RankTier = "bronce" | "plata" | "oro" | "platino"

export type ProgresoGamificacion = {
  total_xp: number
  current_level: number
  rank_tier: RankTier
  streak_days: number
  xp_en_nivel: number
  xp_para_siguiente: number
  avatar_url?: string | null
}

export type Mision = {
  id: string
  tarea_id: string
  dimension: string
  dimension_label: string
  titulo: string
  descripcion: string
  xp: number
  duracion_min: number | null
  completada: boolean
  completada_at?: string | null
}

export type MisionesHoy = {
  fecha: string
  misiones: Mision[]
  completadas_hoy: number
  total_hoy: number
  bonus_disponible: number
  progreso: ProgresoGamificacion
}

export const RANK_LABELS: Record<RankTier, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
  platino: "Platino",
}

export function avatarSrc(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null
  const base =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:8000"
  return `${base}${avatarUrl}`
}

export function motivoXpLabel(motivo: string): string {
  const labels: Record<string, string> = {
    tarea_completada: "Misión completada",
    bonus_dia: "Bonus del día",
    racha_3: "Racha de 3 días",
    racha_7: "Racha de 7 días",
    encuesta: "Encuesta completada",
    recomendacion_dia: "Actividad registrada",
    recomendacion_completada: "Recomendación completada",
    insignia: "Insignia ganada",
  }
  return labels[motivo] ?? motivo
}
