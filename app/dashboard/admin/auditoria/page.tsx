"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import {
  Search,
  LogIn,
  LogOut,
  UserCheck,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react"

type Item = {
  usuario: string
  email: string
  tipo: string
  evento: string
  ip: string | null
  fecha: string
}

type Resumen = {
  logins_hoy: number
  logouts_hoy: number
  activos_hoy: number
  duracion_promedio_min: number
}

const PAGE_SIZE = 15

const inputCls =
  "h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuracion(min: number) {
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m ? `${h} h ${m} min` : `${h} h`
}

export default function AuditoriaPage() {
  const router = useRouter()

  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)

  const [q, setQ] = useState("")
  const [evento, setEvento] = useState("todos")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const desdeItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const hastaItem = Math.min(page * PAGE_SIZE, total)

  const params = () => {
    const p: Record<string, string> = { evento, page: String(page) }
    if (q.trim()) p.q = q.trim()
    if (desde) p.desde = desde
    if (hasta) p.hasta = hasta
    return p
  }

  // Al cambiar un filtro, vuelve a la página 1.
  useEffect(() => {
    setPage(1)
  }, [q, evento, desde, hasta])

  // Carga de la bitácora (con debounce para no consultar en cada tecla).
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    const t = setTimeout(() => {
      setLoading(true)
      api
        .get("/auditoria", { params: params() })
        .then((res) => {
          setItems(res.data.items)
          setTotal(res.data.total)
          setError(null)
        })
        .catch((err) => {
          if (!redirigirPorError(err, router)) setError("No pudimos cargar la bitácora. Inténtalo de nuevo.")
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, evento, desde, hasta, page, router])

  // Métricas del día (una vez).
  useEffect(() => {
    if (!getAccessToken()) return
    api
      .get("/auditoria/resumen")
      .then((res) => setResumen(res.data))
      .catch(() => {})
  }, [])

  async function exportar() {
    setExportando(true)
    try {
      const { page: _p, ...sinPagina } = params()
      const res = await api.get("/auditoria/export", { params: sinPagina, responseType: "blob" })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement("a")
      a.href = url
      a.download = "auditoria_accesos.xlsx"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      if (!redirigirPorError(err, router)) setError("No pudimos exportar. Inténtalo de nuevo.")
    } finally {
      setExportando(false)
    }
  }

  const Avatar = ({ name }: { name: string }) => (
    <div className="w-9 h-9 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A] shrink-0">
      {(name || "U").charAt(0).toUpperCase()}
    </div>
  )

  const EventoPill = ({ e }: { e: string }) =>
    e === "login" ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#15803D]">
        <LogIn className="w-3.5 h-3.5" /> Login
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626]">
        <LogOut className="w-3.5 h-3.5" /> Logout
      </span>
    )

  const TipoPill = ({ t }: { t: string }) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        t === "Usuario" ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F3E8FF] text-[#7C3AED]"
      }`}
    >
      {t}
    </span>
  )

  const kpis = [
    { icon: <LogIn className="w-5 h-5" />, box: "bg-[#EAF3DE] text-[#16A34A]", value: resumen?.logins_hoy, label: "Logins hoy" },
    { icon: <LogOut className="w-5 h-5" />, box: "bg-[#FEF2F2] text-[#DC2626]", value: resumen?.logouts_hoy, label: "Logouts hoy" },
    { icon: <UserCheck className="w-5 h-5" />, box: "bg-[#EFF6FF] text-[#2563EB]", value: resumen?.activos_hoy, label: "Usuarios activos hoy" },
    { icon: <Clock className="w-5 h-5" />, box: "bg-[#F3E8FF] text-[#7C3AED]", value: resumen ? formatDuracion(resumen.duracion_promedio_min) : undefined, label: "Sesión promedio" },
  ]

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Auditoría de accesos</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Historial de inicios y cierres de sesión, y frecuencia de uso de la plataforma.
          </p>
        </div>
        <button
          onClick={exportar}
          disabled={exportando}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-[#FFFFFF] cursor-pointer disabled:opacity-60 transition-all shrink-0"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          <FileSpreadsheet className="w-4 h-4" />
          {exportando ? "Exportando..." : "Exportar Excel"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-4">
            <div className={`flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${k.box}`}>{k.icon}</div>
            <p className="text-2xl font-bold text-[#1F2937]">{k.value ?? "—"}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${inputCls} w-full pl-10`}
            />
          </div>
          <select value={evento} onChange={(e) => setEvento(e.target.value)} className={`${inputCls} cursor-pointer`}>
            <option value="todos">Todos los eventos</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={`${inputCls} w-full`} title="Desde" />
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={`${inputCls} w-full`} title="Hasta" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-[#6B7280]">Cargando bitácora...</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Usuario</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Tipo</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Evento</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">IP</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Fecha y hora</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={it.usuario} />
                          <div className="min-w-0">
                            <p className="font-medium text-[#1F2937] truncate">{it.usuario}</p>
                            <p className="text-xs text-[#94A3B8] truncate">{it.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><TipoPill t={it.tipo} /></td>
                      <td className="px-4 py-3"><EventoPill e={it.evento} /></td>
                      <td className="px-4 py-3 text-[#6B7280]">{it.ip || "—"}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{formatFecha(it.fecha)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                        No hay accesos registrados para estos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Móvil */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {items.map((it, i) => (
                <div key={i} className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={it.usuario} />
                      <div className="min-w-0">
                        <p className="font-medium text-[#1F2937] text-sm truncate">{it.usuario}</p>
                        <p className="text-xs text-[#94A3B8] truncate">{it.email}</p>
                      </div>
                    </div>
                    <EventoPill e={it.evento} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span className="flex items-center gap-2"><TipoPill t={it.tipo} /> {it.ip || "—"}</span>
                    <span>{formatFecha(it.fecha)}</span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-[#6B7280]">
                  No hay accesos registrados para estos filtros.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#6B7280]">
            Mostrando {desdeItem}–{hastaItem} de {total} evento{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-[#6B7280] px-2">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
