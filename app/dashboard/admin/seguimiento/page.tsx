"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Download,
} from "lucide-react"

type Ciclo = {
  id: number
  numero: number
  nombre: string
  tipo: "linea_base" | "seguimiento"
  estado: string
  respondieron: number
}

type DimensionComparada = {
  clave: string
  etiqueta: string
  promedio_base: number
  promedio_seguimiento: number
  delta: number
  mejoraron: number
  se_mantuvieron: number
  empeoraron: number
}

type FacultadComparada = {
  facultad: string
  total: number
  promedio_base: number
  promedio_seguimiento: number
  delta: number
}

type Comparacion = {
  base: { id: number; numero: number; nombre: string }
  seguimiento: { id: number; numero: number; nombre: string }
  usuarios_comparados: number
  respondieron_base: number
  respondieron_seguimiento: number
  dimensiones: DimensionComparada[]
  facultades: FacultadComparada[]
}

/** Color y flecha según si el cambio fue a mejor, a peor o nulo. */
function estiloDelta(delta: number) {
  if (delta > 0) return { color: "text-[#15803D]", bg: "bg-[#F0FDF4]", Icono: TrendingUp }
  if (delta < 0) return { color: "text-[#DC2626]", bg: "bg-[#FEF2F2]", Icono: TrendingDown }
  return { color: "text-[#6B7280]", bg: "bg-[#F1F5F9]", Icono: Minus }
}

const conSigno = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}`

export default function SeguimientoPage() {
  const router = useRouter()
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [baseId, setBaseId] = useState<number | null>(null)
  const [seguimientoId, setSeguimientoId] = useState<number | null>(null)
  const [datos, setDatos] = useState<Comparacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [cargandoComparacion, setCargandoComparacion] = useState(false)
  const [error, setError] = useState("")
  const [descargando, setDescargando] = useState("")

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    api
      .get("/ciclos")
      .then(({ data }) => {
        const lista: Ciclo[] = data.ciclos
        setCiclos(lista)
        // Por defecto, la línea base contra la medición más reciente que tenga
        // respuestas: es la comparación que casi siempre se quiere ver.
        const base = lista.find((c) => c.tipo === "linea_base")
        const seg = lista.find((c) => c.tipo === "seguimiento" && c.respondieron > 0)
          ?? lista.find((c) => c.tipo === "seguimiento")
        if (base) setBaseId(base.id)
        if (seg) setSeguimientoId(seg.id)
      })
      .catch((err) => {
        if (!redirigirPorError(err, router)) {
          setError("No pudimos cargar las mediciones. Inténtalo de nuevo.")
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const comparar = useCallback(async () => {
    if (baseId === null || seguimientoId === null || baseId === seguimientoId) {
      setDatos(null)
      return
    }
    setCargandoComparacion(true)
    setError("")
    try {
      const { data } = await api.get("/ciclos/comparar", {
        params: { base: baseId, seguimiento: seguimientoId },
      })
      setDatos(data)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as any).response?.data?.detail
        setError(typeof detail === "string" ? detail : "No pudimos comparar las mediciones.")
        setDatos(null)
      }
    } finally {
      setCargandoComparacion(false)
    }
  }, [baseId, seguimientoId, router])

  useEffect(() => {
    comparar()
  }, [comparar])

  async function descargar(formato: "csv" | "excel") {
    setDescargando(formato)
    try {
      const res = await api.get("/reportes/progresion", {
        params: { formato, dimension: "todas" },
        responseType: "blob",
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement("a")
      a.href = url
      a.download = formato === "csv" ? "progresion.csv" : "progresion.xlsx"
      // Firefox y Safari ignoran el clic si el enlace no está en el documento.
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      if (!redirigirPorError(err, router)) setError("No pudimos generar la descarga.")
    } finally {
      setDescargando("")
    }
  }

  const selectCls =
    "h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] cursor-pointer"
  const btnSec =
    "inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] cursor-pointer transition-colors disabled:opacity-50"

  const haySeguimientos = ciclos.some((c) => c.tipo === "seguimiento")
  const global = datos?.dimensiones.find((d) => d.clave === "indice_global")
  const porDimension = datos?.dimensiones.filter((d) => d.clave !== "indice_global") ?? []

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Seguimiento / Estadísticas</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Compara dos mediciones para ver cómo cambió el bienestar entre una y otra.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm px-4 py-12 text-center text-sm text-[#6B7280]">
          Cargando mediciones...
        </div>
      ) : !haySeguimientos ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#FFFFFF] p-12 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] mb-4">
            <TrendingUp className="w-7 h-7" />
          </div>
          <p className="text-lg font-semibold text-[#1F2937]">Todavía no hay nada que comparar</p>
          <p className="mt-1 text-sm text-[#6B7280] max-w-sm">
            Necesitas al menos una medición de seguimiento además de la línea base. Puedes
            programarla en Configuración.
          </p>
        </div>
      ) : (
        <>
          {/* Selectores */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Medición inicial
                </label>
                <select
                  value={baseId ?? ""}
                  onChange={(e) => setBaseId(Number(e.target.value))}
                  className={selectCls}
                >
                  {ciclos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <ArrowRight className="hidden sm:block w-5 h-5 text-[#94A3B8] mb-2.5 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Comparar con
                </label>
                <select
                  value={seguimientoId ?? ""}
                  onChange={(e) => setSeguimientoId(Number(e.target.value))}
                  className={selectCls}
                >
                  {ciclos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:ml-auto flex items-center gap-2">
                <button onClick={() => descargar("csv")} disabled={descargando !== ""} className={btnSec}>
                  {descargando === "csv" ? <Download className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  CSV
                </button>
                <button onClick={() => descargar("excel")} disabled={descargando !== ""} className={btnSec}>
                  {descargando === "excel" ? <Download className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Excel
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#94A3B8]">
              Las descargas traen los datos persona por persona (primera y última encuesta, con
              sexo, facultad y programa) para analizarlos en tu programa de estadística.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {cargandoComparacion ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm px-4 py-12 text-center text-sm text-[#6B7280]">
              Comparando...
            </div>
          ) : !datos ? null : datos.usuarios_comparados === 0 ? (
            <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#B45309]">Nadie respondió las dos mediciones</p>
                <p className="mt-1 text-sm text-[#B45309]">
                  «{datos.base.nombre}» tiene {datos.respondieron_base} respuestas y «
                  {datos.seguimiento.nombre}» tiene {datos.respondieron_seguimiento}, pero ninguna
                  persona está en las dos. Sin eso no hay cambio que medir.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-5">
                  <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-2">
                    <Users className="w-4 h-4" />
                    Personas comparadas
                  </div>
                  <p className="text-3xl font-bold text-[#1F2937]">{datos.usuarios_comparados}</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">
                    Respondieron las dos mediciones. Solo ellas entran en los promedios.
                  </p>
                </div>
                {global && (
                  <>
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-5">
                      <p className="text-sm text-[#6B7280] mb-2">Índice global</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[#1F2937]">
                          {global.promedio_seguimiento.toFixed(1)}
                        </span>
                        <span className="text-sm text-[#94A3B8]">
                          antes {global.promedio_base.toFixed(1)}
                        </span>
                      </div>
                      {(() => {
                        const { color, bg, Icono } = estiloDelta(global.delta)
                        return (
                          <span
                            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${bg} ${color}`}
                          >
                            <Icono className="w-3.5 h-3.5" />
                            {conSigno(global.delta)} puntos
                          </span>
                        )
                      })()}
                    </div>
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-5">
                      <p className="text-sm text-[#6B7280] mb-2">Cambio de nivel global</p>
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-[#15803D] font-semibold">
                          {global.mejoraron} subieron de nivel
                        </span>
                        <span className="text-[#6B7280]">{global.se_mantuvieron} se mantuvieron</span>
                        <span className="text-[#DC2626]">{global.empeoraron} bajaron</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Por dimensión */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <h3 className="text-sm font-bold text-[#1F2937]">Cambio por dimensión</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0]">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Dimensión</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{datos.base.nombre}</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{datos.seguimiento.nombre}</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Cambio</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Subieron</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Igual</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Bajaron</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porDimension.map((d) => {
                        const { color, Icono } = estiloDelta(d.delta)
                        return (
                          <tr key={d.clave} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#1F2937]">{d.etiqueta}</td>
                            <td className="px-4 py-3 text-center text-[#6B7280]">{d.promedio_base.toFixed(1)}</td>
                            <td className="px-4 py-3 text-center font-semibold text-[#1F2937]">{d.promedio_seguimiento.toFixed(1)}</td>
                            <td className={`px-4 py-3 text-center font-bold ${color}`}>
                              <span className="inline-flex items-center gap-1">
                                <Icono className="w-4 h-4" />
                                {conSigno(d.delta)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-[#15803D]">{d.mejoraron}</td>
                            <td className="px-4 py-3 text-center text-[#6B7280]">{d.se_mantuvieron}</td>
                            <td className="px-4 py-3 text-center text-[#DC2626]">{d.empeoraron}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Por facultad */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <h3 className="text-sm font-bold text-[#1F2937]">Índice global por facultad</h3>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    De peor a mejor cambio: arriba está la que necesita más atención.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0]">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Facultad</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Personas</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Antes</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Después</th>
                        <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Cambio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.facultades.map((f) => {
                        const { color, Icono } = estiloDelta(f.delta)
                        return (
                          <tr key={f.facultad} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#1F2937]">{f.facultad}</td>
                            <td className="px-4 py-3 text-center text-[#6B7280]">{f.total}</td>
                            <td className="px-4 py-3 text-center text-[#6B7280]">{f.promedio_base.toFixed(1)}</td>
                            <td className="px-4 py-3 text-center font-semibold text-[#1F2937]">{f.promedio_seguimiento.toFixed(1)}</td>
                            <td className={`px-4 py-3 text-center font-bold ${color}`}>
                              <span className="inline-flex items-center gap-1">
                                <Icono className="w-4 h-4" />
                                {conSigno(f.delta)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </main>
  )
}
