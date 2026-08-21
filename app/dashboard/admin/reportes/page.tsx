"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Table2,
  Check,
  AlertTriangle,
} from "lucide-react"

const DIMENSIONES = [
  { value: "global", label: "Índice global" },
  { value: "todas", label: "Todas las dimensiones" },
  { value: "relaciones_interpersonales", label: "Relaciones interpersonales" },
  { value: "nutricion", label: "Nutrición" },
  { value: "responsabilidad_salud", label: "Responsabilidad en salud" },
  { value: "actividad_fisica", label: "Actividad física" },
  { value: "manejo_estres", label: "Manejo del estrés" },
  { value: "psicologia_positiva", label: "Psicología positiva" },
]

const NIVELES = ["Pobre", "Moderado", "Bueno", "Excelente"]

const selectCls =
  "w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors cursor-pointer"

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      {children}
    </label>
  )
}

export default function ReportesPage() {
  const router = useRouter()

  const [usuariosRol, setUsuariosRol] = useState("todos")
  const [segmento, setSegmento] = useState("todas")
  const [progresionDim, setProgresionDim] = useState("global")
  const [progresionNivel, setProgresionNivel] = useState("")
  const [distribucionDim, setDistribucionDim] = useState("todas")

  const [descargando, setDescargando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function nombreDesdeCabecera(cabecera: string | undefined, porDefecto: string) {
    if (!cabecera) return porDefecto
    const m = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(cabecera)
    return m ? decodeURIComponent(m[1]) : porDefecto
  }

  async function descargar(
    tipo: string,
    formato: "excel" | "pdf" | "csv",
    params: Record<string, string>,
  ) {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    const clave = `${tipo}-${formato}`
    setDescargando(clave)
    setError(null)
    try {
      const res = await api.get(`/reportes/${tipo}`, {
        params: { formato, ...params },
        responseType: "blob",
      })
      const ext = formato === "excel" ? "xlsx" : formato
      const nombre = nombreDesdeCabecera(
        res.headers["content-disposition"],
        `reporte_${tipo}.${ext}`,
      )
      const url = URL.createObjectURL(res.data)
      const a = document.createElement("a")
      a.href = url
      a.download = nombre
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setAviso("Reporte generado.")
      setTimeout(() => setAviso(null), 2600)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setError("No pudimos generar el reporte. Inténtalo de nuevo.")
        setTimeout(() => setError(null), 4000)
      }
    } finally {
      setDescargando(null)
    }
  }

  return (
    <>
      <main className="px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Reportes</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Genera reportes en Excel, PDF o CSV con los datos de la plataforma y de las encuestas. El CSV trae los datos crudos, para analizarlos en SPSS o R.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1 · Usuarios */}
          <ReporteCard
            icono={<Users className="w-5 h-5" />}
            titulo="Usuarios de la plataforma"
            descripcion="Listado de usuarios con su perfil y si completaron la encuesta. El Excel incluye el detalle por dimensión."
          >
            <Campo label="Roles a incluir">
              <select value={usuariosRol} onChange={(e) => setUsuariosRol(e.target.value)} className={selectCls}>
                <option value="todos">Todos los roles</option>
                <option value="usuarios">Solo usuarios</option>
                <option value="profesionales">Solo profesionales</option>
              </select>
            </Campo>
            <Botones
              onExcel={() => descargar("usuarios", "excel", { rol: usuariosRol })}
              onPdf={() => descargar("usuarios", "pdf", { rol: usuariosRol })}
              onCsv={() => descargar("usuarios", "csv", { rol: usuariosRol })}
              descargando={descargando}
              tipo="usuarios"
            />
          </ReporteCard>

          {/* 2 · Participación */}
          <ReporteCard
            icono={<ClipboardCheck className="w-5 h-5" />}
            titulo="Participación en las encuestas"
            descripcion="Quién respondió la encuesta inicial, los seguimientos, ambas o ninguna."
          >
            <Campo label="Segmento">
              <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className={selectCls}>
                <option value="todas">Todos los usuarios</option>
                <option value="hizo_base">Completaron la inicial</option>
                <option value="con_seguimiento">Completaron algún seguimiento</option>
                <option value="ambas">Completaron inicial y seguimiento</option>
                <option value="solo_una">Completaron solo una</option>
                <option value="ninguna">No han respondido</option>
              </select>
            </Campo>
            <Botones
              onExcel={() => descargar("participacion", "excel", { segmento })}
              onPdf={() => descargar("participacion", "pdf", { segmento })}
              onCsv={() => descargar("participacion", "csv", { segmento })}
              descargando={descargando}
              tipo="participacion"
            />
          </ReporteCard>

          {/* 3 · Progresión de niveles */}
          <ReporteCard
            icono={<TrendingUp className="w-5 h-5" />}
            titulo="Progresión de niveles"
            descripcion="Compara el nivel inicial con el más reciente e indica si subió, bajó o se mantuvo."
          >
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Dimensión">
                <select value={progresionDim} onChange={(e) => setProgresionDim(e.target.value)} className={selectCls}>
                  {DIMENSIONES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Nivel actual">
                <select value={progresionNivel} onChange={(e) => setProgresionNivel(e.target.value)} className={selectCls}>
                  <option value="">Todos</option>
                  {NIVELES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </Campo>
            </div>
            <Botones
              onExcel={() => descargar("progresion", "excel", { dimension: progresionDim, ...(progresionNivel ? { nivel: progresionNivel } : {}) })}
              onPdf={() => descargar("progresion", "pdf", { dimension: progresionDim, ...(progresionNivel ? { nivel: progresionNivel } : {}) })}
              onCsv={() => descargar("progresion", "csv", { dimension: progresionDim, ...(progresionNivel ? { nivel: progresionNivel } : {}) })}
              descargando={descargando}
              tipo="progresion"
            />
          </ReporteCard>

          {/* 4 · Distribución por niveles */}
          <ReporteCard
            icono={<BarChart3 className="w-5 h-5" />}
            titulo="Distribución por niveles"
            descripcion="Cuántos usuarios hay en cada nivel (Pobre, Moderado, Bueno, Excelente), según su encuesta más reciente."
          >
            <Campo label="Dimensión">
              <select value={distribucionDim} onChange={(e) => setDistribucionDim(e.target.value)} className={selectCls}>
                {DIMENSIONES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </Campo>
            <Botones
              onExcel={() => descargar("distribucion", "excel", { dimension: distribucionDim })}
              onPdf={() => descargar("distribucion", "pdf", { dimension: distribucionDim })}
              onCsv={() => descargar("distribucion", "csv", { dimension: distribucionDim })}
              descargando={descargando}
              tipo="distribucion"
            />
          </ReporteCard>
        </div>
      </main>

      {aviso && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1F2937] text-[#FFFFFF] shadow-2xl">
          <Check className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-sm">{aviso}</span>
        </div>
      )}
    </>
  )
}

function ReporteCard({
  icono,
  titulo,
  descripcion,
  children,
}: {
  icono: React.ReactNode
  titulo: string
  descripcion: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#EAF3DE] text-[#16A34A] shrink-0">
          {icono}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold font-heading text-[#1F2937]">{titulo}</h3>
          <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">{descripcion}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-auto">{children}</div>
    </div>
  )
}

function Botones({
  onExcel,
  onPdf,
  onCsv,
  descargando,
  tipo,
}: {
  onExcel: () => void
  onPdf: () => void
  onCsv: () => void
  descargando: string | null
  tipo: string
}) {
  const cargandoExcel = descargando === `${tipo}-excel`
  const cargandoPdf = descargando === `${tipo}-pdf`
  const cargandoCsv = descargando === `${tipo}-csv`
  const ocupado = descargando !== null
  const btnSec =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer disabled:opacity-60 transition-colors flex-1"
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExcel}
        disabled={ocupado}
        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-[#FFFFFF] cursor-pointer disabled:opacity-60 transition-all flex-1"
        style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
      >
        <FileSpreadsheet className="w-4 h-4" />
        {cargandoExcel ? "Generando..." : "Excel"}
      </button>
      <button onClick={onPdf} disabled={ocupado} className={btnSec}>
        <FileText className="w-4 h-4" />
        {cargandoPdf ? "Generando..." : "PDF"}
      </button>
      {/* CSV: datos crudos, sin formato, para llevarlos a SPSS o R. */}
      <button onClick={onCsv} disabled={ocupado} className={btnSec} title="Datos crudos para análisis estadístico">
        <Table2 className="w-4 h-4" />
        {cargandoCsv ? "Generando..." : "CSV"}
      </button>
    </div>
  )
}
