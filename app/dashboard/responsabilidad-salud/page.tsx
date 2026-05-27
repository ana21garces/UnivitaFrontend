"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ChevronDown, ChevronUp, Users, Stethoscope, AlertCircle } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ── Tipos ──────────────────────────────────────────────────────────────────

type ResponsabilidadSalud = {
  rs_item_03: number
  rs_item_09: number
  rs_item_15: number
  rs_item_22: number
  rs_item_28: number
  rs_item_34: number
  rs_item_41: number
  rs_indice: number
  rs_nivel: string
}

type Estudiante = {
  encuesta_id: number
  usuario_id: string
  nombre: string
  programa: string
  universidad: string
  fecha: string
  responsabilidad_salud: ResponsabilidadSalud
}

type Grupo = {
  programa: string
  total: number
  estudiantes: Estudiante[]
}

type RespSaludData = {
  total_estudiantes: number
  grupos: Grupo[]
}

// ── Constantes ─────────────────────────────────────────────────────────────

const NIVEL_CONFIG: Record<string, { color: string; bg: string; bar: string; rango: string }> = {
  Pobre:     { color: "#E53E3E", bg: "#FFF5F5", bar: "#E53E3E", rango: "0 – 33" },
  Moderado:  { color: "#DD6B20", bg: "#FFFAF0", bar: "#DD6B20", rango: "34 – 55" },
  Bueno:     { color: "#3182CE", bg: "#EBF8FF", bar: "#3182CE", rango: "56 – 77" },
  Excelente: { color: "#38A169", bg: "#F0FFF4", bar: "#38A169", rango: "78 – 100" },
}

const RS_ITEMS = [
  "rs_item_03", "rs_item_09", "rs_item_15", "rs_item_22",
  "rs_item_28", "rs_item_34", "rs_item_41",
] as const

const RS_ITEM_TEXTO: Record<string, string> = {
  rs_item_03: "Informar señales o síntomas inusuales al profesional de salud",
  rs_item_09: "Mantenerse informado sobre el mejoramiento de la salud",
  rs_item_15: "Hacer preguntas para entender instrucciones médicas",
  rs_item_22: "Buscar una segunda opinión ante dudas sobre tratamientos",
  rs_item_28: "Dialogar puntos de vista con profesionales de salud",
  rs_item_34: "Examinar mensualmente el cuerpo para detectar cambios",
  rs_item_41: "Pedir orientación para mantenerse en buen estado de salud",
}

const PUNTAJE_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Pobre",     color: "#E53E3E", bg: "#FFF5F5" },
  2: { label: "Moderado",  color: "#DD6B20", bg: "#FFFAF0" },
  3: { label: "Bueno",     color: "#3182CE", bg: "#EBF8FF" },
  4: { label: "Excelente", color: "#38A169", bg: "#F0FFF4" },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getNivelFromIndice(indice: number): string {
  if (indice <= 33) return "Pobre"
  if (indice <= 55) return "Moderado"
  if (indice <= 77) return "Bueno"
  return "Excelente"
}

function NivelBadge({ nivel }: { nivel: string }) {
  const cfg = NIVEL_CONFIG[nivel] ?? { color: "#718096", bg: "#EDF2F7", bar: "#718096", rango: "" }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {nivel}
    </span>
  )
}

function IndiceBar({ indice }: { indice: number }) {
  const nivel = getNivelFromIndice(indice)
  const cfg = NIVEL_CONFIG[nivel]
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${indice}%`, backgroundColor: cfg.bar }} />
      </div>
      <span className="text-xs font-semibold text-[#1F2937] w-12 text-right">{indice.toFixed(1)}%</span>
      <NivelBadge nivel={nivel} />
    </div>
  )
}

function NivelesLeyenda() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(NIVEL_CONFIG).map(([nivel, cfg]) => (
        <div key={nivel} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: cfg.bg }}>
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{nivel}</span>
          <span className="text-xs text-[#6B7280]">{cfg.rango}</span>
        </div>
      ))}
    </div>
  )
}

// ── Componentes ─────────────────────────────────────────────────────────────

function EstudianteRow({ estudiante }: { estudiante: Estudiante }) {
  const [open, setOpen] = useState(false)
  const rs = estudiante.responsabilidad_salud
  const fecha = new Date(estudiante.fecha).toLocaleDateString("es-CO", {
    year: "numeric", month: "short", day: "numeric",
  })

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1F2937] truncate">{estudiante.nombre}</p>
          <p className="text-xs text-[#6B7280] truncate">{estudiante.universidad ?? estudiante.programa} · {fecha}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="hidden sm:flex items-center gap-2 w-52">
            <IndiceBar indice={rs.rs_indice} />
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div className="sm:hidden mb-3">
            <p className="text-xs font-medium text-[#6B7280] mb-1">Índice general</p>
            <IndiceBar indice={rs.rs_indice} />
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {RS_ITEMS.map((item) => {
              const puntaje = rs[item]
              const cfg = PUNTAJE_CONFIG[puntaje] ?? { label: "—", color: "#718096", bg: "#EDF2F7" }
              return (
                <div key={item} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-[#6B7280] w-14 shrink-0">
                    Ítem {item.replace("rs_item_", "")}
                  </span>
                  <span className="flex-1 text-xs text-[#1F2937] leading-tight">{RS_ITEM_TEXTO[item]}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-[#1F2937]">{puntaje}</span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

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
          <div className="w-9 h-9 rounded-xl bg-[#ECFEFF] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#0891B2]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#1F2937]">{grupo.programa}</p>
            <p className="text-xs text-[#6B7280]">{grupo.total} estudiante{grupo.total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-[#E2E8F0]">
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

// ── Página principal ──────────────────────────────────────────────────────

export default function RespSaludPage() {
  const router = useRouter()
  const [data, setData] = useState<RespSaludData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) { router.replace("/"); return }

    axios
      .get(`${API_URL}/encuesta/responsabilidad-salud/resultados`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
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
      <DashboardNavbar role="responsabilidad-salud" userName="Prof. Responsabilidad en Salud" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex flex-col gap-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFEFF] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#0891B2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#1F2937]">Responsabilidad en Salud</h1>
              <p className="text-sm text-[#6B7280]">Resultados agrupados por programa</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm self-start sm:self-auto">
              <Users className="w-4 h-4 text-[#0891B2]" />
              <span className="text-sm font-semibold text-[#1F2937]">{data.total_estudiantes} estudiantes</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Referencia de niveles</p>
          <NivelesLeyenda />
        </div>

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

        {!loading && !error && data && (
          <div className="flex flex-col gap-4">
            {data.grupos.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
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
