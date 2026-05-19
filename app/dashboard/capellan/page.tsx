"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ChevronDown, ChevronUp, Users, BookHeart, AlertCircle } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ── Tipos ──────────────────────────────────────────────────────────────────

type PsicologiaPositiva = {
  pp_item_06: number
  pp_item_12: number
  pp_item_19: number
  pp_item_25: number
  pp_item_31: number
  pp_item_37: number
  pp_item_44: number
  pp_item_49: number
  pp_item_52: number
  pp_indice: number
  pp_nivel: string
}

type Estudiante = {
  encuesta_id: number
  usuario_id: string
  nombre: string
  programa: string
  universidad: string
  fecha: string
  psicologia_positiva: PsicologiaPositiva
}

type Grupo = {
  programa: string
  total: number
  estudiantes: Estudiante[]
}

type CapellanData = {
  total_estudiantes: number
  grupos: Grupo[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

const NIVEL_CONFIG: Record<string, { color: string; bg: string; rango: string }> = {
  Pobre:     { color: "text-red-700",    bg: "bg-red-100",    rango: "0 – 25" },
  Moderado:  { color: "text-orange-700", bg: "bg-orange-100", rango: "26 – 50" },
  Bueno:     { color: "text-yellow-700", bg: "bg-yellow-100", rango: "51 – 75" },
  Excelente: { color: "text-green-700",  bg: "bg-green-100",  rango: "76 – 100" },
}

const PP_ITEMS = [
  "pp_item_06", "pp_item_12", "pp_item_19", "pp_item_25",
  "pp_item_31", "pp_item_37", "pp_item_44", "pp_item_49", "pp_item_52",
] as const

const PP_ITEM_TEXTO: Record<string, string> = {
  pp_item_06: "Cambiar tus comportamientos habituales de una forma positiva",
  pp_item_12: "Aceptar que tu vida tiene un propósito",
  pp_item_19: "Mirar hacia el futuro de forma positiva",
  pp_item_25: "Sentir satisfacción hacia tu persona",
  pp_item_31: "Establecer metas a largo plazo para tu vida",
  pp_item_37: "Hacer que tu día sea interesante y retador",
  pp_item_44: "Enfocarte en lo que es importante para ti en la vida",
  pp_item_49: "Sentirte unido a Dios",
  pp_item_52: "Exponerte a nuevas experiencias y retos constructivos",
}

const PUNTAJE_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Pobre",     color: "text-red-700",       bg: "bg-red-100" },
  2: { label: "Moderado",  color: "text-orange-700",    bg: "bg-orange-100" },
  3: { label: "Bueno",     color: "text-green-700",     bg: "bg-green-100" },
  4: { label: "Excelente", color: "text-emerald-800",   bg: "bg-emerald-100" },
}

function NivelBadge({ nivel }: { nivel: string }) {
  const cfg = NIVEL_CONFIG[nivel] ?? { color: "text-gray-700", bg: "bg-gray-100", rango: "" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {nivel}
    </span>
  )
}

function IndiceBar({ indice }: { indice: number }) {
  const nivel = indice <= 25 ? "Pobre" : indice <= 50 ? "Moderado" : indice <= 75 ? "Bueno" : "Excelente"
  const barColor =
    indice <= 25 ? "bg-red-500" :
    indice <= 50 ? "bg-orange-400" :
    indice <= 75 ? "bg-yellow-400" : "bg-green-500"

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${indice}%` }} />
      </div>
      <span className="text-xs font-semibold text-[#1F2937] w-12 text-right">{indice.toFixed(1)}%</span>
      <NivelBadge nivel={nivel} />
    </div>
  )
}

function EstudianteRow({ estudiante }: { estudiante: Estudiante }) {
  const [open, setOpen] = useState(false)
  const pp = estudiante.psicologia_positiva
  const fecha = new Date(estudiante.fecha).toLocaleDateString("es-CO", {
    year: "numeric", month: "short", day: "numeric",
  })

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      {/* Cabecera del estudiante */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1F2937] truncate">{estudiante.nombre}</p>
          <p className="text-xs text-[#6B7280] truncate">{estudiante.universidad} · {fecha}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="hidden sm:flex items-center gap-2 w-52">
            <IndiceBar indice={pp.pp_indice} />
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />}
        </div>
      </button>

      {/* Detalle expandible */}
      {open && (
        <div className="px-4 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          {/* Índice en móvil */}
          <div className="sm:hidden mb-3">
            <p className="text-xs font-medium text-[#6B7280] mb-1">Índice general</p>
            <IndiceBar indice={pp.pp_indice} />
          </div>

          {/* Grilla de ítems */}
          <div className="flex flex-col gap-2 mb-3">
            {PP_ITEMS.map((item) => {
              const puntaje = pp[item]
              const cfg = PUNTAJE_CONFIG[puntaje] ?? { label: "—", color: "text-gray-600", bg: "bg-gray-100" }
              return (
                <div key={item} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-[#6B7280] w-14 shrink-0">
                    Ítem {item.replace("pp_item_", "")}
                  </span>
                  <span className="flex-1 text-xs text-[#1F2937] leading-tight">{PP_ITEM_TEXTO[item]}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-[#1F2937]">{puntaje}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Programa */}
          <p className="text-xs text-[#6B7280]">
            <span className="font-medium">Programa:</span> {estudiante.programa}
          </p>
        </div>
      )}
    </div>
  )
}

function GrupoCard({ grupo }: { grupo: Grupo }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#1F2937]">{grupo.programa}</p>
            <p className="text-xs text-[#6B7280]">{grupo.total} estudiante{grupo.total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-[#E2E8F0]">
          <div className="pt-3 flex flex-col gap-2">
            {grupo.estudiantes.map((est) => (
              <EstudianteRow key={est.encuesta_id} estudiante={est} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Referencia de niveles ──────────────────────────────────────────────────

function NivelesLeyenda() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(NIVEL_CONFIG).map(([nivel, cfg]) => (
        <div key={nivel} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cfg.bg}`}>
          <span className={`text-xs font-semibold ${cfg.color}`}>{nivel}</span>
          <span className="text-xs text-[#6B7280]">{cfg.rango}</span>
        </div>
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

export default function CapellanPage() {
  const router = useRouter()
  const [data, setData] = useState<CapellanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace("/")
      return
    }

    axios
      .get(`${API_URL}/encuesta/capellan/psicologia-positiva`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        const status = err.response?.status
        if (status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          router.replace("/")
        } else if (status === 403) {
          router.replace("/dashboard/user")
        } else {
          setError("No se pudo cargar la información. Intenta de nuevo más tarde.")
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="capellan" userName="Capellán" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex flex-col gap-6">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] flex items-center justify-center">
              <BookHeart className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#1F2937]">Psicología Positiva</h1>
              <p className="text-sm text-[#6B7280]">Resultados agrupados por programa</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm self-start sm:self-auto">
              <Users className="w-4 h-4 text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#1F2937]">{data.total_estudiantes} estudiantes</span>
            </div>
          )}
        </div>

        {/* Leyenda de niveles */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Referencia de niveles</p>
          <NivelesLeyenda />
        </div>

        {/* Estados de carga / error */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Grupos */}
        {!loading && !error && data && (
          <div className="flex flex-col gap-4">
            {data.grupos.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <BookHeart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay resultados disponibles aún.</p>
              </div>
            ) : (
              data.grupos.map((grupo) => (
                <GrupoCard key={grupo.programa} grupo={grupo} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
