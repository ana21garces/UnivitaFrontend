"use client"
import { useTituloPagina } from "@/components/titulo-pagina"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { RANGO_POR_NIVEL } from "@/lib/niveles"
import { useResaltadoAlerta } from "@/lib/use-resaltado-alerta"
import { ChevronDown, ChevronUp, Users, Brain, AlertCircle, Building2, GraduationCap, Bell, Check, XCircle, FileDown } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ComparativoAnterior } from "@/components/comparativo-anterior"
import { VolverAlPanelAdmin } from "@/components/volver-al-panel-admin"
import { NotificarModal } from "@/components/notificar-modal"
import { ReporteIndividualModal, type PreguntaReporte } from "@/components/reporte-individual-modal"
import { useReporteEnlace } from "@/lib/use-reporte-enlace"
import {
  EstadisticasSection,
  type EstadisticasDimension,
} from "@/components/estadisticas-dimension"

// ── Tipos ──────────────────────────────────────────────────────────────────

type ManejoEstres = {
  me_item_05: number
  me_item_11: number
  me_item_18: number
  me_item_24: number
  me_item_30: number
  me_item_36: number
  me_item_43: number
  me_item_48: number
  me_indice: number
  me_nivel: string
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
  indice_anterior?: number | null
  manejo_estres: ManejoEstres
}

type Carrera = { carrera: string; total: number; usuarios: Usuario[] }
type Facultad = { facultad: string; total: number; carreras: Carrera[] }
type MEData = { total_usuarios: number; facultades: Facultad[] }

// ── Constantes ─────────────────────────────────────────────────────────────

const NIVEL_CONFIG: Record<string, { color: string; bg: string; bar: string; rango: string }> = {
  Pobre:     { color: "#E53E3E", bg: "#FFF5F5", bar: "#E53E3E", rango: RANGO_POR_NIVEL.Pobre },
  Moderado:  { color: "#DD6B20", bg: "#FFFAF0", bar: "#DD6B20", rango: RANGO_POR_NIVEL.Moderado },
  Bueno:     { color: "#3182CE", bg: "#EBF8FF", bar: "#3182CE", rango: RANGO_POR_NIVEL.Bueno },
  Excelente: { color: "#38A169", bg: "#F0FFF4", bar: "#38A169", rango: RANGO_POR_NIVEL.Excelente },
}

const ME_ITEMS = [
  "me_item_05", "me_item_11", "me_item_18", "me_item_24",
  "me_item_30", "me_item_36", "me_item_43", "me_item_48",
] as const

const ME_ITEM_TEXTO: Record<string, string> = {
  me_item_05: "Dormir diariamente de 7 a 9 horas por las noches",
  me_item_11: "Apartar diariamente algún tiempo para relajarse",
  me_item_18: "Aceptar aquellas cosas en su vida que no puede cambiar",
  me_item_24: "Concentrarse en pensamientos agradables a la hora de acostarse",
  me_item_30: "Usar métodos o técnicas específicas para controlar el estrés",
  me_item_36: "Mantener un equilibrio de tiempo entre trabajo/estudio y entretenimiento",
  me_item_43: "Practicar diariamente relajación o meditación por 15 a 20 minutos",
  me_item_48: "Mantener equilibradas las tareas laborales/estudios para prevenir el cansancio",
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

// El nivel llega de me_nivel, calculado por el backend con los cortes reales
// del PEPS II (≤25/≤50/≤75). No se recalcula aquí: es el mismo error que
// tenían actividad-fisica y responsabilidad-salud antes de corregirlo.
function IndiceBar({ indice, nivel }: { indice: number; nivel: string }) {
  const cfg = NIVEL_CONFIG[nivel] ?? { color: "#718096", bg: "#EDF2F7", bar: "#718096" }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${indice}%`, backgroundColor: cfg.bar }} />
      </div>
      <span className="text-xs font-semibold text-[#1F2937] w-10 text-right">{Math.round(indice)}%</span>
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
  onReporte,
}: {
  usuario: Usuario
  notificado: string | null
  onNotificar: (objetivo: { nombre: string; usuarioId: string }) => void
  onReporte: (objetivo: { usuarioId: string; preguntas: PreguntaReporte[] }) => void
}) {
  const [open, setOpen] = useState(false)
  const me = usuario.manejo_estres
  const requiereAtencion = me.me_nivel === "Pobre"
  const retrocedio = usuario.indice_anterior != null && me.me_indice < usuario.indice_anterior
  const necesitaCita = requiereAtencion || me.me_nivel === "Moderado" || retrocedio
  const { ref: filaRef, resaltado } = useResaltadoAlerta(usuario.usuario_id, () => setOpen(true))
  useEffect(() => { if (notificado) setOpen(false) }, [notificado])
  const fecha = usuario.fecha
    ? new Date(usuario.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
    : null

  return (
    <div
      ref={filaRef}
      className={`border rounded-xl overflow-hidden transition-shadow ${
        resaltado
          ? "border-red-400 ring-2 ring-red-400 ring-offset-2"
          : requiereAtencion ? "border-red-200" : "border-[#E2E8F0]"
      }`}
    >
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
          <div className="flex items-center gap-2">
            <p className="text-xs text-[#6B7280] truncate">{fecha}</p>
            <ComparativoAnterior actual={me.me_indice} anterior={usuario.indice_anterior} />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="hidden sm:flex items-center gap-2 w-52"><IndiceBar indice={me.me_indice} nivel={me.me_nivel} /></div>
          {necesitaCita && usuario.usuario_id && (
            <div className="flex items-center gap-2 shrink-0">
              {notificado === "rechazada" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309]">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rechazó la cita</span>
                </span>
              ) : notificado === "aceptada" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Aceptó la cita</span>
                </span>
              ) : notificado === "pendiente" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Notificado</span>
                </span>
              ) : null}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNotificar({ nombre: usuario.nombre, usuarioId: usuario.usuario_id! }) }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{notificado === "rechazada" ? "Volver a invitar" : "Notificar"}</span>
              </button>
            </div>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div className="sm:hidden mb-3">
            <p className="text-xs font-medium text-[#6B7280] mb-1">Nivel</p>
            <IndiceBar indice={me.me_indice} nivel={me.me_nivel} />
          </div>
          <div className="flex flex-col gap-1.5 mb-3">
            {ME_ITEMS.map((item) => {
              const puntaje = me[item]
              const cfg = PUNTAJE_CONFIG[puntaje] ?? { label: "—", color: "#718096", bg: "#EDF2F7" }
              return (
                <div key={item} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-[#6B7280] w-14 shrink-0">Ítem {item.replace("me_item_", "")}</span>
                  <span className="flex-1 text-xs text-[#1F2937] leading-tight">{ME_ITEM_TEXTO[item]}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-[#1F2937]">{puntaje}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-[#6B7280]"><span className="font-medium">Programa:</span> {usuario.programa}</p>
            {usuario.usuario_id && (
              <button
                type="button"
                onClick={() =>
                  onReporte({
                    usuarioId: usuario.usuario_id!,
                    preguntas: ME_ITEMS.map((item) => ({
                      numero: item.replace("me_item_", ""),
                      texto: ME_ITEM_TEXTO[item],
                      valor: me[item],
                    })),
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4] transition-colors shrink-0"
              >
                <FileDown className="w-3.5 h-3.5" />
                Reporte para remisión
              </button>
            )}
          </div>
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
  onReporte,
}: {
  carrera: Carrera
  notificados: Record<string, string>
  onNotificar: (objetivo: { nombre: string; usuarioId: string }) => void
  onReporte: (objetivo: { usuarioId: string; preguntas: PreguntaReporte[] }) => void
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
              notificado={u.usuario_id ? notificados[u.usuario_id] ?? null : null}
              onNotificar={onNotificar}
              onReporte={onReporte}
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
  onReporte,
}: {
  facultad: Facultad
  notificados: Record<string, string>
  onNotificar: (objetivo: { nombre: string; usuarioId: string }) => void
  onReporte: (objetivo: { usuarioId: string; preguntas: PreguntaReporte[] }) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#7C3AED]" />
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
            <CarreraCard key={c.carrera} carrera={c} notificados={notificados} onNotificar={onNotificar} onReporte={onReporte} />
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
  const sc = "text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white text-[#1F2937] focus:outline-none focus:border-[#7C3AED] cursor-pointer disabled:opacity-50"
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

export default function ManejoEstresPage() {
  useTituloPagina("Manejo del estrés")
  const router = useRouter()
  const [data, setData] = useState<MEData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filtros, setFiltros] = useState<Filtros>({ facultad: "", carrera: "", tipo_usuario: "" })
  const [opcionesFacultades, setOpcionesFacultades] = useState<string[]>([])
  const [opcionesCarreras, setOpcionesCarreras] = useState<string[]>([])
  const [opcionesTipos, setOpcionesTipos] = useState<string[]>([])

  const [stats, setStats] = useState<EstadisticasDimension | null>(null)
  const [notifObjetivo, setNotifObjetivo] = useState<{ nombre: string; usuarioId: string } | null>(null)
  const [reporteObjetivo, setReporteObjetivo] = useState<{ usuarioId: string; preguntas: PreguntaReporte[] } | null>(null)

  useReporteEnlace(!!data, (id) => {
    const u = (data?.facultades ?? []).flatMap((f) => f.carreras.flatMap((c) => c.usuarios)).find((x) => x.usuario_id === id)
    if (!u) return
    setReporteObjetivo({
      usuarioId: id,
      preguntas: ME_ITEMS.map((item) => ({ numero: item.replace("me_item_", ""), texto: ME_ITEM_TEXTO[item], valor: u.manejo_estres[item] })),
    })
  })
  const [notificados, setNotificados] = useState<Record<string, string>>({})

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
      .get("/encuesta/manejo-estres/resultados/estadisticas")
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
    const url = `/encuesta/manejo-estres/resultados${params.toString() ? `?${params}` : ""}`
    api.get(url)
      .then((res) => {
        const d: MEData = res.data
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

  useEffect(() => {
    const token = getToken()
    if (!token) return
    api.get("/notificaciones/notificados?rol=manejo_estres")
      .then((res) => setNotificados((prev) => ({ ...prev, ...res.data })))
      .catch(() => {})
  }, [getToken])

  const handleFiltrosChange = (f: Filtros) => { setFiltros(f); fetchData(f) }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="manejo-estres" />
      <VolverAlPanelAdmin />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#1F2937]">Manejo del Estrés</h1>
              <p className="text-sm text-[#6B7280]">Resultados agrupados por facultad y carrera</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm self-start sm:self-auto">
              <Users className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-sm font-semibold text-[#1F2937]">{data.total_usuarios} usuarios</span>
            </div>
          )}
        </div>

        {/* Panorama general: gráficos */}
        {stats && <EstadisticasSection stats={stats} tituloDimension="Manejo del estrés" />}

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
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay resultados para los filtros seleccionados.</p>
              </div>
            ) : (
              data.facultades.map((fac) => (
                <FacultadCard
                  key={fac.facultad}
                  facultad={fac}
                  notificados={notificados}
                  onNotificar={setNotifObjetivo}
                  onReporte={setReporteObjetivo}
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
          mensajeSugerido="Te invitamos a agendar una cita con manejo del estrés para hablar de tus resultados."
          rol="manejo_estres"
          onClose={() => setNotifObjetivo(null)}
          onEnviado={(id) => setNotificados((prev) => ({ ...prev, [id]: "pendiente" }))}
        />
      )}

      {reporteObjetivo && (
        <ReporteIndividualModal
          usuarioId={reporteObjetivo.usuarioId}
          dimensionClave="manejo_estres"
          dimensionLabel="Manejo del Estrés"
          preguntas={reporteObjetivo.preguntas}
          onClose={() => setReporteObjetivo(null)}
        />
      )}
    </div>
  )
}
