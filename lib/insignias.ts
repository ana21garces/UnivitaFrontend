// Insignias del estudiante — complemento de la gamificación (XP/niveles/rangos).
// El backend calcula cuáles se ganaron; aquí solo tipos y estilo por rareza.

import {
  Award,
  Brain,
  CalendarCheck,
  Compass,
  Dumbbell,
  Flame,
  Footprints,
  HeartHandshake,
  Salad,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react"

export type Rareza = "comun" | "rara" | "epica"

export type InsigniaEstado = {
  id: string
  nombre: string
  descripcion: string
  criterio: string
  icono: string
  rareza: Rareza
  xp: number
  ganada: boolean
  otorgada_at: string | null
  nueva: boolean
}

export type InsigniasResponse = {
  total: number
  ganadas: number
  insignias: InsigniaEstado[]
}

// Íconos del catálogo del backend. `Award` es el respaldo si llega uno nuevo.
export const ICONOS_INSIGNIA: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Zap,
  Compass,
  CalendarCheck,
  TrendingUp,
  Dumbbell,
  Salad,
  Stethoscope,
  HeartHandshake,
  Brain,
  Sparkles,
}

export function iconoInsignia(nombre: string): LucideIcon {
  return ICONOS_INSIGNIA[nombre] ?? Award
}

// Estilo de la medalla ganada según rareza. Las bloqueadas van siempre en gris.
export const ESTILO_RAREZA: Record<Rareza, { anillo: string; fondo: string; icono: string; etiqueta: string }> = {
  comun: {
    anillo: "ring-2 ring-[#FBBF24]",
    fondo: "bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]",
    icono: "text-[#B45309]",
    etiqueta: "Común",
  },
  rara: {
    anillo: "ring-2 ring-[#60A5FA]",
    fondo: "bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]",
    icono: "text-[#2563EB]",
    etiqueta: "Rara",
  },
  epica: {
    anillo: "ring-2 ring-[#A855F7]",
    fondo: "bg-gradient-to-br from-[#16A34A]/15 via-[#6D28D9]/15 to-[#22D3EE]/15",
    icono: "text-[#7C3AED]",
    etiqueta: "Épica",
  },
}
