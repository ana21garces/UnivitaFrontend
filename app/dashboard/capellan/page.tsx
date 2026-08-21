"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { RANGO_POR_NIVEL } from "@/lib/niveles"
import { ChevronDown, ChevronUp, Users, BookHeart, AlertCircle, Building2, GraduationCap, Bell, Check } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { VolverAlPanelAdmin } from "@/components/volver-al-panel-admin"
import { NotificarModal } from "@/components/notificar-modal"
import {
  EstadisticasSection,
  type EstadisticasDimension,
} from "@/components/estadisticas-dimension"

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

type Usuario = {
  encuesta_id?: number
  usuario_id?: string
  nombre: string
  facultad: string
  programa: string
  tipo_usuario: string
  universidad?: string
  fecha?: string
  psicologia_positiva: PsicologiaPositiva
}

type Carrera = {
  carrera: string
  total: number
  usuarios: Usuario[]
}

type Facultad = {
  facultad: string
  total: number
  carreras: Carrera[]
}

type CapellanData = {
  total_usuarios: number
  facultades: Facultad[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

const NIVEL_CONFIG: Record<string, { color: string; bg: string; rango: string }> = {
  Pobre:     { color: "text-red-700",    bg: "bg-red-100",    rango: RANGO_POR_NIVEL.Pobre },
  Moderado:  { color: "text-orange-700", bg: "bg-orange-100", rango: RANGO_POR_NIVEL.Moderado },
  Bueno:     { color: "text-yellow-700", bg: "bg-yellow-100", rango: RANGO_POR_NIVEL.Bueno },
  Excelente: { color: "text-green-700",  bg: "bg-green-100",  rango: RANGO_POR_NIVEL.Excelente },
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
  1: { label: "Pobre",     color: "text-red-700",     bg: "bg-red-100" },
  2: { label: "Moderado",  color: "text-orange-700",  bg: "bg-orange-100" },
  3: { label: "Bueno",     color: "text-green-700",   bg: "bg-green-100" },
  4: { label: "Excelente", color: "text-emerald-800", bg: "bg-emerald-100" },
}

const TIPO_USUARIO_LABELS: Record<string, string> = {
  estudiante:     "Estudiante",
  docente:        "Docente",
  administrativo: "Administrativo",
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

// ── Fila de usuario ────────────────────────────────────────────────────────

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
  const pp = usuario.psicologia_positiva
  const requiereAtencion = pp.pp_nivel === "Pobre"
  const fecha = usuario.fecha
    ? new Date(usuario.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
    : null

  return (
    <div className={`border rounded-xl overflow-hidden ${requiereAtencion ? "border-red-200" : "border-[#E2E8F0]"}`}>
      {/* Antes era un <button>: con el botón de Notificar dentro, quedaba un
          botón anidado en otro botón, invalido en HTML. Por eso es un div
          con el mismo comportamiento de teclado. */}
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
                {TIPO_USUARIO_LABELS[usuario.tipo_usuario] ?? usuario.tipo_usuario}
              </span>
            )}
            {requiereAtencion && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                <AlertCircle className="w-3 h-3" />
                Atención inmediata
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] truncate">
            {usuario.universidad && `${usuario.universidad} · `}{fecha}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="hidden sm:flex items-center gap-2 w-52">
            <IndiceBar indice={pp.pp_indice} />
          </div>
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
          {/* Índice en móvil */}
          <div className="sm:hidden mb-3">
            <p className="text-xs font-medium text-[#6B7280] mb-1">Índice PP</p>
            <IndiceBar indice={pp.pp_indice} />
          </div>

          {/* Ítems con texto de pregunta */}
          <div className="flex flex-col gap-1.5 mb-3">
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

          <p className="text-xs text-[#6B7280]">
            <span className="font-medium">Programa:</span> {usuario.programa}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Tarjeta de carrera ─────────────────────────────────────────────────────

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
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F1F5F9] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm font-semibold text-[#1F2937]">{carrera.carrera || "Sin carrera asignada"}</span>
          <span className="text-xs text-[#6B7280]">({carrera.total})</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-[#E2E8F0]">
          <div className="pt-2 flex flex-col gap-2">
            {carrera.usuarios.map((u, i) => (
              <UsuarioRow
                key={u.encuesta_id ?? i}
                usuario={u}
                notificado={!!u.usuario_id && notificados.has(u.usuario_id)}
                onNotificar={onNotificar}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tarjeta de facultad ────────────────────────────────────────────────────

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
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#1F2937]">{facultad.facultad || "Sin facultad asignada"}</p>
            <p className="text-xs text-[#6B7280]">
              {facultad.total} usuario{facultad.total !== 1 ? "s" : ""} ·{" "}
              {facultad.carreras.length} carrera{facultad.carreras.length !== 1 ? "s" : ""}
            </p>
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

// ── Leyenda de niveles ─────────────────────────────────────────────────────

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

// ── Filtros ────────────────────────────────────────────────────────────────

type Filtros = {
  facultad: string
  carrera: string
  tipo_usuario: string
}

function FiltrosBar({
  filtros,
  onChange,
  opciones,
}: {
  filtros: Filtros
  onChange: (f: Filtros) => void
  opciones: { facultades: string[]; carreras: string[]; tipos_usuario: string[] }
}) {
  const selectClass =
    "text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white text-[#1F2937] focus:outline-none focus:border-[#16A34A] cursor-pointer disabled:opacity-50"

  const TIPO_LABELS: Record<string, string> = {
    estudiante: "Estudiante",
    docente: "Docente",
    administrativo: "Administrativo",
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3 shadow-sm">
      <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Filtrar por</span>

      {/* Facultad */}
      <select
        className={selectClass}
        value={filtros.facultad}
        onChange={(e) => onChange({ ...filtros, facultad: e.target.value, carrera: "" })}
      >
        <option value="">Todas las facultades</option>
        {opciones.facultades.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* Carrera */}
      <select
        className={selectClass}
        value={filtros.carrera}
        onChange={(e) => onChange({ ...filtros, carrera: e.target.value })}
        disabled={opciones.carreras.length === 0}
      >
        <option value="">Todas las carreras</option>
        {opciones.carreras.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Tipo de usuario — dinámico desde API */}
      <select
        className={selectClass}
        value={filtros.tipo_usuario}
        onChange={(e) => onChange({ ...filtros, tipo_usuario: e.target.value })}
      >
        <option value="">Todos los tipos</option>
        {opciones.tipos_usuario.map((t) => (
          <option key={t} value={t}>{TIPO_LABELS[t] ?? t}</option>
        ))}
      </select>

      {/* Limpiar */}
      {(filtros.facultad || filtros.carrera || filtros.tipo_usuario) && (
        <button
          className="text-xs text-[#6B7280] hover:text-[#1F2937] underline"
          onClick={() => onChange({ facultad: "", carrera: "", tipo_usuario: "" })}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

// ── Notificar a un estudiante ──────────────────────────────────────────────

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

export default function CapellanPage() {
  const router = useRouter()
  const [data, setData] = useState<CapellanData | null>(null)
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

  // Helper: fusionar opciones sin duplicar
  const mergeOpciones = useCallback((facs: string[], cars: string[], tipos: string[]) => {
    if (facs.length) setOpcionesFacultades((p) => uniq([...p, ...facs]))
    if (cars.length) setOpcionesCarreras((p) => uniq([...p, ...cars]))
    if (tipos.length) setOpcionesTipos((p) => uniq([...p, ...tipos]))
  }, [])

  // 1. Intentar cargar opciones desde el endpoint dedicado
  useEffect(() => {
    const token = getToken()
    if (!token) return
    api
      .get("/encuesta/filtros/opciones")
      .then((res) => {
        const { facultades = [], carreras = [], tipos_usuario = [] } = res.data
        mergeOpciones(facultades, carreras, tipos_usuario)
      })
      .catch(() => { /* fallback: se extraen de los datos principales */ })
  }, [getToken, mergeOpciones])

  // 2. Estadísticas para los gráficos — sin filtros, es la foto completa.
  // Si falla, el listado por persona sigue funcionando igual: los gráficos
  // son un complemento, no un requisito.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    api
      .get("/encuesta/capellan/psicologia-positiva/estadisticas")
      .then((res) => setStats(res.data))
      .catch(() => {})
  }, [getToken])

  // 3. Carga inicial de datos (sin filtros) — también extrae opciones como fallback
  useEffect(() => {
    const token = getToken()
    if (!token) return
    api
      .get("/encuesta/capellan/psicologia-positiva")
      .then((res) => {
        const d: CapellanData = res.data
        setData(d)
        const { facultades, carreras, tipos } = extraerOpciones(d.facultades)
        mergeOpciones(facultades, carreras, tipos)
      })
      .catch((err) => {
        if (redirigirPorError(err, router)) return
        setError("No se pudo cargar la información. Intenta de nuevo más tarde.")
      })
      .finally(() => setLoading(false))
  }, [getToken, router])

  // Re-fetch con filtros activos
  const fetchFiltrado = useCallback(
    (f: Filtros) => {
      const token = getToken()
      if (!token) return
      setLoading(true)
      setError("")
      const params = new URLSearchParams()
      if (f.facultad)     params.set("facultad", f.facultad)
      if (f.carrera)      params.set("carrera", f.carrera)
      if (f.tipo_usuario) params.set("tipo_usuario", f.tipo_usuario)
      const url = `/encuesta/capellan/psicologia-positiva${params.toString() ? `?${params}` : ""}`
      api
        .get(url)
        .then((res) => {
          const d: CapellanData = res.data
          setData(d)
          const { facultades, carreras, tipos } = extraerOpciones(d.facultades)
          mergeOpciones(facultades, carreras, tipos)
        })
        .catch((err) => {
          if (redirigirPorError(err, router)) return
          setError("No se pudo cargar la información. Intenta de nuevo más tarde.")
        })
        .finally(() => setLoading(false))
    },
    [getToken, mergeOpciones, router]
  )

  const handleFiltrosChange = (f: Filtros) => {
    setFiltros(f)
    fetchFiltrado(f)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="capellan" />
      <VolverAlPanelAdmin />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex flex-col gap-6">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] flex items-center justify-center">
              <BookHeart className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#1F2937]">Psicología Positiva</h1>
              <p className="text-sm text-[#6B7280]">Resultados agrupados por facultad y carrera</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm self-start sm:self-auto">
              <Users className="w-4 h-4 text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#1F2937]">{data.total_usuarios} usuarios</span>
            </div>
          )}
        </div>

        {/* Panorama general: gráficos */}
        {stats && <EstadisticasSection stats={stats} tituloDimension="Psicología positiva" />}

        {/* Leyenda */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Referencia de niveles</p>
          <NivelesLeyenda />
        </div>

        {/* Filtros */}
        <FiltrosBar
          filtros={filtros}
          onChange={handleFiltrosChange}
          opciones={{ facultades: opcionesFacultades, carreras: opcionesCarreras, tipos_usuario: opcionesTipos }}
        />

        {/* Carga / error */}
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

        {/* Facultades */}
        {!loading && !error && data && (
          <div className="flex flex-col gap-4">
            {data.facultades.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <BookHeart className="w-10 h-10 mx-auto mb-3 opacity-30" />
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
          mensajeSugerido="Te invitamos a agendar una cita con capellanía para hablar de tus resultados."
          onClose={() => setNotifObjetivo(null)}
          onEnviado={(id) => setNotificados((prev) => new Set(prev).add(id))}
        />
      )}
    </div>
  )
}
