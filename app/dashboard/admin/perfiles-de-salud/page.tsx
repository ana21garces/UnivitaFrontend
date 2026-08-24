"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { Search, Eye, X } from "lucide-react"
import { avatarSrc } from "@/lib/gamificacion"

interface Dimension {
  indice: number
  nivel: string
}

interface Resultados {
  puntaje_crudo: number
  indice_global: number
  nivel_global: string
  relaciones_interpersonales: Dimension
  nutricion: Dimension
  responsabilidad_salud: Dimension
  actividad_fisica: Dimension
  manejo_estres: Dimension
  psicologia_positiva: Dimension
}

interface Perfil {
  usuario_id: string
  nombre: string
  email: string
  facultad: string | null
  programa: string | null
  tipo_usuario: string | null
  avatar_url: string | null
  fecha: string
  resultados: Resultados
}

const DIMS: { key: keyof Resultados; label: string }[] = [
  { key: "relaciones_interpersonales", label: "Relaciones interpersonales" },
  { key: "nutricion", label: "Nutrición" },
  { key: "responsabilidad_salud", label: "Responsabilidad en salud" },
  { key: "actividad_fisica", label: "Actividad física" },
  { key: "manejo_estres", label: "Manejo del estrés" },
  { key: "psicologia_positiva", label: "Psicología positiva" },
]

function nivelStyle(nivel: string) {
  const n = (nivel || "").toLowerCase()
  if (n === "excelente") return { bg: "bg-[#F0FDF4]", text: "text-[#15803D]", dot: "bg-[#16A34A]", bar: "#16A34A" }
  if (n === "bueno") return { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]", bar: "#2563EB" }
  if (n === "moderado") return { bg: "bg-[#FFFBEB]", text: "text-[#B45309]", dot: "bg-[#F59E0B]", bar: "#F59E0B" }
  if (n === "pobre") return { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#EF4444]", bar: "#EF4444" }
  return { bg: "bg-[#F1F5F9]", text: "text-[#6B7280]", dot: "bg-[#94A3B8]", bar: "#94A3B8" }
}

export default function PerfilesDeSaludPage() {
  const router = useRouter()
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [filterFacultad, setFilterFacultad] = useState("all")
  const [filterNivel, setFilterNivel] = useState("all")
  const [detalle, setDetalle] = useState<Perfil | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    api
      .get("/encuesta/perfiles")
      .then((res) => setPerfiles(res.data.perfiles))
      .catch((err) => {
        if (!redirigirPorError(err, router)) setLoadError("No pudimos cargar los perfiles. Inténtalo de nuevo.")
      })
      .finally(() => setLoading(false))
  }, [router])

  // Facultades presentes en los datos, para poblar el filtro.
  const facultades = Array.from(
    new Set(perfiles.map((p) => p.facultad).filter(Boolean))
  ).sort() as string[]

  const filtered = perfiles.filter((p) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = p.nombre.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    const matchesTipo = filterTipo === "all" || (p.tipo_usuario || "").toLowerCase() === filterTipo
    const matchesFacultad = filterFacultad === "all" || p.facultad === filterFacultad
    const matchesNivel =
      filterNivel === "all" || (p.resultados.nivel_global || "").toLowerCase() === filterNivel.toLowerCase()
    return matchesSearch && matchesTipo && matchesFacultad && matchesNivel
  })

  // Al filtrar o buscar, vuelve a la primera página para no quedar en una vacía.
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterTipo, filterFacultad, filterNivel])

  const pageSize = 10
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paginaActual = Math.min(page, totalPages)
  const inicio = (paginaActual - 1) * pageSize
  const paginados = filtered.slice(inicio, inicio + pageSize)
  const desde = total === 0 ? 0 : inicio + 1
  const hasta = Math.min(inicio + pageSize, total)

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })

  const Avatar = ({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) => {
    const src = avatarSrc(avatarUrl)
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A] shrink-0">
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
    )
  }

  const NivelBadge = ({ nivel, indice }: { nivel: string; indice: number }) => {
    const s = nivelStyle(nivel)
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {nivel} · {Math.round(indice)}
      </span>
    )
  }

  const AnilloNivel = ({ nivel, indice }: { nivel: string; indice: number }) => {
    const s = nivelStyle(nivel)
    const pct = Math.round(indice)
    return (
      <div className="flex items-center justify-center gap-2.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(${s.bar} ${pct}%, #E9ECEA ${pct}%)` }}
        >
          <div
            className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center text-[13px] font-bold"
            style={{ color: s.bar }}
          >
            {pct}
          </div>
        </div>
        <div className="text-left">
          <div className={`text-sm font-semibold ${s.text}`}>{nivel}</div>
          <div className="text-[11px] text-[#94A3B8]">de 100</div>
        </div>
      </div>
    )
  }

  const MiniBarras = ({ r }: { r: Resultados }) => (
    <div className="flex items-end justify-center gap-1 h-7">
      {DIMS.map((d) => {
        const dim = r[d.key] as Dimension
        return (
          <div
            key={d.key}
            className="w-[7px] rounded-sm"
            style={{ height: `${Math.max(12, Math.round(dim.indice))}%`, background: nivelStyle(dim.nivel).bar }}
            title={`${d.label}: ${dim.nivel} · ${Math.round(dim.indice)}`}
          />
        )
      })}
    </div>
  )

  const btnVer =
    "flex items-center justify-center w-8 h-8 rounded-lg border bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7] transition-colors cursor-pointer"

  return (
    <>
      <main className="px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Perfiles de salud</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Resultados de bienestar de los usuarios según la encuesta de estilo de vida.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-4 mb-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="administrativo">Administrativo</option>
            </select>
            <select
              value={filterFacultad}
              onChange={(e) => setFilterFacultad(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] cursor-pointer"
            >
              <option value="all">Todas las facultades</option>
              {facultades.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] cursor-pointer"
            >
              <option value="all">Todos los niveles</option>
              <option value="Pobre">Pobre</option>
              <option value="Moderado">Moderado</option>
              <option value="Bueno">Bueno</option>
              <option value="Excelente">Excelente</option>
            </select>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
            <span>{loadError}</span>
          </div>
        )}

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-[#6B7280]">Cargando perfiles...</div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Usuario</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Nivel global</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Dimensiones</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Fecha</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map((p) => (
                      <tr key={p.usuario_id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.nombre} avatarUrl={p.avatar_url} />
                            <div className="min-w-0">
                              <p className="font-medium text-[#1F2937] truncate">{p.nombre}</p>
                              <p className="text-xs text-[#94A3B8] truncate">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <AnilloNivel nivel={p.resultados.nivel_global} indice={p.resultados.indice_global} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <MiniBarras r={p.resultados} />
                        </td>
                        <td className="px-4 py-3 text-center text-[#6B7280]">{formatFecha(p.fecha)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button onClick={() => setDetalle(p)} className={btnVer} title="Ver perfil">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                          Aún no hay usuarios con la encuesta respondida.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {paginados.map((p) => (
                  <div key={p.usuario_id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={p.nombre} avatarUrl={p.avatar_url} />
                        <div className="min-w-0">
                          <p className="font-medium text-[#1F2937] text-sm truncate">{p.nombre}</p>
                          <p className="text-xs text-[#94A3B8] truncate">{p.email}</p>
                        </div>
                      </div>
                      <button onClick={() => setDetalle(p)} className={btnVer} title="Ver perfil">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <AnilloNivel nivel={p.resultados.nivel_global} indice={p.resultados.indice_global} />
                      <MiniBarras r={p.resultados} />
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    Aún no hay usuarios con la encuesta respondida.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-[#6B7280]">
              Mostrando {desde}–{hasta} de {total} perfil{total === 1 ? "" : "es"}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-[#6B7280] px-2">
                Página {paginaActual} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={paginaActual === totalPages}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal: detalle del perfil */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => setDetalle(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setDetalle(null)} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#16A34A]/10 flex items-center justify-center text-lg font-bold text-[#16A34A]">
                {avatarSrc(detalle.avatar_url) ? (
                  <img src={avatarSrc(detalle.avatar_url)!} alt={detalle.nombre} className="w-full h-full object-cover" />
                ) : (
                  detalle.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1F2937] truncate">{detalle.nombre}</p>
                <p className="text-sm text-[#6B7280] truncate">{detalle.email}</p>
              </div>
            </div>

            {/* Global */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] mb-5">
              <div>
                <p className="text-xs text-[#6B7280]">Bienestar global</p>
                <p className="text-lg font-bold text-[#1F2937]">
                  {Math.round(detalle.resultados.indice_global)}
                  <span className="text-sm font-medium text-[#94A3B8]"> / 100</span>
                </p>
              </div>
              <NivelBadge nivel={detalle.resultados.nivel_global} indice={detalle.resultados.indice_global} />
            </div>

            {/* Dimensiones */}
            <p className="text-sm font-semibold text-[#1F2937] mb-3">Dimensiones del bienestar</p>
            <div className="flex flex-col gap-3.5">
              {DIMS.map((d) => {
                const dim = detalle.resultados[d.key] as Dimension
                const s = nivelStyle(dim.nivel)
                return (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#475569]">{d.label}</span>
                      <span className={`text-xs font-bold ${s.text}`}>
                        {dim.nivel} · {Math.round(dim.indice)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(dim.indice)}%`, background: s.bar }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Datos */}
            <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex flex-col divide-y divide-[#F1F5F9]">
              {[
                { k: "Tipo de usuario", v: detalle.tipo_usuario || "No especificado" },
                { k: "Facultad", v: detalle.facultad || "No especificada" },
                { k: "Programa", v: detalle.programa || "No especificado" },
                { k: "Respondida", v: formatFecha(detalle.fecha) },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#6B7280]">{row.k}</span>
                  <span className="font-medium text-[#1F2937] text-right capitalize">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
