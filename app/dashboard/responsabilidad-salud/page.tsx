"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { RANGO_POR_NIVEL } from "@/lib/niveles"
import { ChevronDown, ChevronUp, Users, Stethoscope, AlertCircle, Building2, GraduationCap, Bell, Check } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { VolverAlPanelAdmin } from "@/components/volver-al-panel-admin"
import { NotificarModal } from "@/components/notificar-modal"
import {
  EstadisticasSection,
  type EstadisticasDimension,
} from "@/components/estadisticas-dimension"

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

type Usuario = {
  encuesta_id?: number
  usuario_id?: string
  nombre: string
  facultad: string
  programa: string
  tipo_usuario?: string
  universidad?: string
  fecha?: string
  responsabilidad_salud: ResponsabilidadSalud
}

type Carrera = { carrera: string; total: number; usuarios: Usuario[] }
type Facultad = { facultad: string; total: number; carreras: Carrera[] }
type RespSaludData = { total_usuarios: number; facultades: Facultad[] }

// ── Constantes ─────────────────────────────────────────────────────────────

const NIVEL_CONFIG: Record<string, { color: string; bg: string; bar: string; rango: string }> = {
  Pobre:     { color: "#E53E3E", bg: "#FFF5F5", bar: "#E53E3E", rango: RANGO_POR_NIVEL.Pobre },
  Moderado:  { color: "#DD6B20", bg: "#FFFAF0", bar: "#DD6B20", rango: RANGO_POR_NIVEL.Moderado },
  Bueno:     { color: "#3182CE", bg: "#EBF8FF", bar: "#3182CE", rango: RANGO_POR_NIVEL.Bueno },
  Excelente: { color: "#38A169", bg: "#F0FFF4", bar: "#38A169", rango: RANGO_POR_NIVEL.Excelente },
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

const TIPO_LABELS: Record<string, string> = {
  estudiante: "Estudiante", docente: "Docente", administrativo: "Administrativo",
}

// ── Helpers ────────────────────────────────────────────────────────────────

function NivelBadge({ nivel }: { nivel: string }) {
  const cfg = NIVEL_CONFIG[nivel] ?? { color: "#718096", bg: "#EDF2F7" }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>{nivel}</span>
  )
}

// El nivel llega de rs_nivel, calculado por el backend con los cortes reales
// del PEPS II (≤25/≤50/≤75). Antes se recalculaba aquí con ≤33/≤55/≤77 -otra
// escala inventada, la misma que tenía actividad-fisica antes de corregirla.
function IndiceBar({ indice, nivel }: { indice: number; nivel: string }) {
  const cfg = NIVEL_CONFIG[nivel] ?? { color: "#718096", bg: "#EDF2F7", bar: "#718096" }
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

// ── UsuarioRow ─────────────────────────────────────────────────────────────

function UsuarioRow({
  usuario,
  notificado,
  onNotificar,
}: {
  usuario: Usuario
  notificado: boolean
  onNotificar: (objetivo: { nombre: string; usuarioId: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const rs = usuario.responsabilidad_salud
  const requiereAtencion = rs.rs_nivel === "Pobre"
  const fecha = usuario.fecha
    ? new Date(usuario.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
    : null

  return (
    <div className={`border rounded-xl overflow-hidden ${requiereAtencion ? "border-red-200" : "border-[#E2E8F0]"}`}>
      {/* div en vez de button: el boton de Notificar de adentro quedaria
          anidado en otro boton, invalido en HTML. */}
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F8FAFC] transition-colors text-left cursor-pointer"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(!open) }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#1F2937] truncate">{usuario.nombre}</p>
            {usuario.tipo_usuario && (
              <span className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280]">
                {TIPO_LABELS[usuario.tipo_usuario] ?? usuario.tipo_usuario}
              </span>
            )}
            {requiereAtencion && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                <AlertCircle className="w-3 h-3" />
                Atención inmediata
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] truncate">{fecha}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="hidden sm:flex items-center gap-2 w-52"><IndiceBar indice={rs.rs_indice} nivel={rs.rs_nivel} /></div>
          {requiereAtencion && usuario.usuario_id && (
            notificado ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] shrink-0">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notificado</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNotificar({ nombre: usuario.nombre, usuarioId: usuario.usuario_id! }) }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notificar</span>
              </button>
            )
          )}
          {open ? <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div className="sm:hidden mb-3">
            <p className="text-xs font-medium text-[#6B7280] mb-1">Índice RS</p>
            <IndiceBar indice={rs.rs_indice} nivel={rs.rs_nivel} />
          </div>
          <div className="flex flex-col gap-1.5 mb-3">
            {RS_ITEMS.map((item) => {
              const puntaje = rs[item]
              const cfg = PUNTAJE_CONFIG[puntaje] ?? { label: "—", color: "#718096", bg: "#EDF2F7" }
              return (
                <div key={item} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-[#6B7280] w-14 shrink-0">Ítem {item.replace("rs_item_", "")}</span>
                  <span className="flex-1 text-xs text-[#1F2937] leading-tight">{RS_ITEM_TEXTO[item]}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-[#1F2937]">{puntaje}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-[#6B7280]"><span className="font-medium">Programa:</span> {usuario.programa}</p>
        </div>
      )}
    </div>
  )
}

// ── CarreraCard / FacultadCard ─────────────────────────────────────────────

function CarreraCard({
  carrera,
  notificados,
  onNotificar,
}: {
  carrera: Carrera
  notificados: Set<string>
  onNotificar: (objetivo: { nombre: string; usuarioId: string }) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F1F5F9] transition-colors"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm font-semibold text-[#1F2937]">{carrera.carrera || "Sin carrera asignada"}</span>
          <span className="text-xs text-[#6B7280]">({carrera.total})</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-[#E2E8F0] pt-2">
          {carrera.usuarios.map((u, i) => (
            <UsuarioRow
              key={u.encuesta_id ?? i}
              usuario={u}
              notificado={!!u.usuario_id && notificados.has(u.usuario_id)}
              onNotificar={onNotificar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FacultadCard({
  facultad,
  notificados,
  onNotificar,
}: {
  facultad: Facultad
  notificados: Set<string>
  onNotificar: (objetivo: { nombre: string; usuarioId: string }) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ECFEFF] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#0891B2]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#1F2937]">{facultad.facultad || "Sin facultad asignada"}</p>
            <p className="text-xs text-[#6B7280]">{facultad.total} usuario{facultad.total !== 1 ? "s" : ""} · {facultad.carreras.length} carrera{facultad.carreras.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[#E2E8F0] pt-3">
          {facultad.carreras.map((c) => (
            <CarreraCard key={c.carrera} carrera={c} notificados={notificados} onNotificar={onNotificar} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── FiltrosBar ─────────────────────────────────────────────────────────────

type Filtros = { facultad: string; carrera: string; tipo_usuario: string }

function FiltrosBar({ filtros, onChange, opciones }: {
  filtros: Filtros
  onChange: (f: Filtros) => void
  opciones: { facultades: string[]; carreras: string[]; tipos_usuario: string[] }
}) {
  const sc = "text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white text-[#1F2937] focus:outline-none focus:border-[#0891B2] cursor-pointer disabled:opacity-50"
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3 shadow-sm">
      <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Filtrar por</span>
      <select className={sc} value={filtros.facultad}
        onChange={(e) => onChange({ ...filtros, facultad: e.target.value, carrera: "" })}>
        <option value="">Todas las facultades</option>
        {opciones.facultades.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <select className={sc} value={filtros.carrera}
        onChange={(e) => onChange({ ...filtros, carrera: e.target.value })}
        disabled={opciones.carreras.length === 0}>
        <option value="">Todas las carreras</option>
        {opciones.carreras.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className={sc} value={filtros.tipo_usuario}
        onChange={(e) => onChange({ ...filtros, tipo_usuario: e.target.value })}>
        <option value="">Todos los tipos</option>
        {opciones.tipos_usuario.map((t) => (
          <option key={t} value={t}>{TIPO_LABELS[t] ?? t}</option>
        ))}
      </select>
      {(filtros.facultad || filtros.carrera || filtros.tipo_usuario) && (
        <button className="text-xs text-[#6B7280] hover:text-[#1F2937] underline"
          onClick={() => onChange({ facultad: "", carrera: "", tipo_usuario: "" })}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

// ── Helpers de opciones ────────────────────────────────────────────────────

function uniq(arr: (string | undefined | null)[]): string[] {
  return [...new Set(arr.filter(Boolean) as string[])]
}

function extraerOpciones(facultades: Facultad[]) {
  return {
    facultades: uniq(facultades.map((f) => f.facultad)),
    carreras: uniq(facultades.flatMap((f) => f.carreras.map((c) => c.carrera))),
    tipos: uniq(facultades.flatMap((f) => f.carreras.flatMap((c) => c.usuarios.map((u) => u.tipo_usuario)))),
  }
}

// ── Página principal ───────────────────────────────────────────────────────

export default function RespSaludPage() {
  const router = useRouter()
  const [data, setData] = useState<RespSaludData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filtros, setFiltros] = useState<Filtros>({ facultad: "", carrera: "", tipo_usuario: "" })
  const [opcionesFacultades, setOpcionesFacultades] = useState<string[]>([])
  const [opcionesCarreras, setOpcionesCarreras] = useState<string[]>([])
  const [opcionesTipos, setOpcionesTipos] = useState<string[]>([])

  const [stats, setStats] = useState<EstadisticasDimension | null>(null)
  const [notifObjetivo, setNotifObjetivo] = useState<{ nombre: string; usuarioId: string } | null>(null)
  const [notificados, setNotificados] = useState<Set<string>>(new Set())

  const getToken = useCallback(() => {
    const t = getAccessToken()
    if (!t) { router.replace("/"); return null }
    return t
  }, [router])

  const mergeOpciones = useCallback((facs: string[], cars: string[], tipos: string[]) => {
    if (facs.length) setOpcionesFacultades((p) => uniq([...p, ...facs]))
    if (cars.length) setOpcionesCarreras((p) => uniq([...p, ...cars]))
    if (tipos.length) setOpcionesTipos((p) => uniq([...p, ...tipos]))
  }, [])

  // 1. Endpoint dedicado de opciones
  useEffect(() => {
    const token = getToken()
    if (!token) return
    api.get("/encuesta/filtros/opciones").then((res) => {
      const { facultades = [], carreras = [], tipos_usuario = [] } = res.data
      mergeOpciones(facultades, carreras, tipos_usuario)
    }).catch(() => {})
  }, [getToken, mergeOpciones])

  // 2. Estadísticas para los gráficos — sin filtros, es la foto completa.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    api
      .get("/encuesta/responsabilidad-salud/resultados/estadisticas")
      .then((res) => setStats(res.data))
      .catch(() => {})
  }, [getToken])

  // 3. Fetch de datos — extrae opciones como fallback
  const fetchData = useCallback((f: Filtros) => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    setError("")
    const params = new URLSearchParams()
    if (f.facultad)     params.set("facultad", f.facultad)
    if (f.carrera)      params.set("carrera", f.carrera)
    if (f.tipo_usuario) params.set("tipo_usuario", f.tipo_usuario)
    const url = `/encuesta/responsabilidad-salud/resultados${params.toString() ? `?${params}` : ""}`
    api.get(url)
      .then((res) => {
        const d: RespSaludData = res.data
        setData(d)
        const { facultades, carreras, tipos } = extraerOpciones(d.facultades)
        mergeOpciones(facultades, carreras, tipos)
      })
      .catch((err) => {
        if (redirigirPorError(err, router)) return
        setError("No se pudo cargar la información. Intenta de nuevo más tarde.")
      })
      .finally(() => setLoading(false))
  }, [getToken, mergeOpciones, router])

  useEffect(() => { fetchData(filtros) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltrosChange = (f: Filtros) => { setFiltros(f); fetchData(f) }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="responsabilidad-salud" />
      <VolverAlPanelAdmin />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFEFF] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#0891B2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#1F2937]">Responsabilidad en Salud</h1>
              <p className="text-sm text-[#6B7280]">Resultados agrupados por facultad y carrera</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm self-start sm:self-auto">
              <Users className="w-4 h-4 text-[#0891B2]" />
              <span className="text-sm font-semibold text-[#1F2937]">{data.total_usuarios} usuarios</span>
            </div>
          )}
        </div>

        {/* Panorama general: gráficos */}
        {stats && <EstadisticasSection stats={stats} tituloDimension="Responsabilidad en salud" />}

        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Referencia de niveles</p>
          <NivelesLeyenda />
        </div>

        <FiltrosBar filtros={filtros} onChange={handleFiltrosChange}
          opciones={{ facultades: opcionesFacultades, carreras: opcionesCarreras, tipos_usuario: opcionesTipos }} />

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="flex flex-col gap-4">
            {data.facultades.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay resultados para los filtros seleccionados.</p>
              </div>
            ) : (
              data.facultades.map((fac) => (
                <FacultadCard
                  key={fac.facultad}
                  facultad={fac}
                  notificados={notificados}
                  onNotificar={setNotifObjetivo}
                />
              ))
            )}
          </div>
        )}
      </main>

      {notifObjetivo && (
        <NotificarModal
          nombre={notifObjetivo.nombre}
          usuarioId={notifObjetivo.usuarioId}
          mensajeSugerido="Te invitamos a agendar una cita con responsabilidad en salud para hablar de tus resultados."
          onClose={() => setNotifObjetivo(null)}
          onEnviado={(id) => setNotificados((prev) => new Set(prev).add(id))}
        />
      )}
    </div>
  )
}
