"use client"

// Reporte individual por persona para remisión. Se abre desde cada perfil
// profesional. Muestra un resumen y, al imprimir, abre una ventana con el
// reporte formateado listo para "Guardar como PDF" y adjuntar a un correo.
//
// El detalle pregunta por pregunta es el de la dimensión del perfil desde el
// que se abre (lo pasa la página, que ya lo tiene cargado); el panorama de las
// 6 dimensiones y los datos básicos vienen del endpoint /persona/{id}/reporte.

import { useEffect, useState } from "react"
import { X, Printer, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

export type PreguntaReporte = {
  numero: string
  texto: string
  valor: number
}

type Medicion = { nombre: string; fecha: string }
type DimReporte = {
  clave: string
  label: string
  indice_actual: number
  nivel_actual: string
  indice_base: number | null
  nivel_base: string | null
}
type Reporte = {
  datos: {
    nombre: string
    sexo: string | null
    facultad: string | null
    programa: string | null
    tipo_usuario: string | null
    universidad: string | null
  }
  medicion_actual: Medicion
  medicion_base: Medicion | null
  global_actual_indice: number
  global_actual_nivel: string
  global_base_indice: number | null
  global_base_nivel: string | null
  dimensiones: DimReporte[]
}

const RESPUESTA_LABEL: Record<number, string> = {
  1: "Pobre",
  2: "Moderado",
  3: "Bueno",
  4: "Excelente",
}

const TIPO_LABEL: Record<string, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  administrativo: "Administrativo",
}

function esc(v: string | null | undefined): string {
  return (v ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })
  } catch {
    return iso
  }
}

function construirHtml(
  r: Reporte,
  dimensionClave: string,
  dimensionLabel: string,
  preguntas: PreguntaReporte[],
): string {
  const d = r.datos
  const hayBase = r.medicion_base !== null

  const filaDim = (dim: DimReporte) => {
    const actual = `${Math.round(dim.indice_actual)}% (${esc(dim.nivel_actual)})`
    const cambio =
      hayBase && dim.indice_base !== null
        ? `${Math.round(dim.indice_base)}% (${esc(dim.nivel_base)}) &rarr; ${Math.round(dim.indice_actual)}%`
        : "&mdash;"
    const destacada = dim.clave === dimensionClave ? ' class="destacada"' : ""
    return `<tr${destacada}><td>${esc(dim.label)}</td><td>${actual}</td>${hayBase ? `<td>${cambio}</td>` : ""}</tr>`
  }

  const globalCambio =
    hayBase && r.global_base_indice !== null
      ? `<p class="cambio">Antes: ${Math.round(r.global_base_indice)}% (${esc(r.global_base_nivel)}) &rarr; Ahora: ${Math.round(
          r.global_actual_indice,
        )}% (${esc(r.global_actual_nivel)})</p>`
      : ""

  const preguntasHtml = preguntas
    .map(
      (p) =>
        `<li><span class="num">Ítem ${esc(p.numero)}.</span> ${esc(p.texto)} <span class="resp">— ${p.valor}/4 (${
          RESPUESTA_LABEL[p.valor] ?? "—"
        })</span></li>`,
    )
    .join("")

  const medicionLinea = hayBase
    ? `${esc(r.medicion_actual.nombre)} · ${fmtFecha(r.medicion_actual.fecha)} — comparado con ${esc(
        r.medicion_base!.nombre,
      )} · ${fmtFecha(r.medicion_base!.fecha)}`
    : `${esc(r.medicion_actual.nombre)} · ${fmtFecha(r.medicion_actual.fecha)}`

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Reporte individual — ${esc(d.nombre)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1F2937; margin: 32px; font-size: 13px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 2px solid #16A34A; padding-bottom: 3px; color: #16A34A; }
  .sub { color: #6B7280; font-size: 12px; margin: 0 0 16px; }
  .datos { width: 100%; border-collapse: collapse; }
  .datos td { padding: 3px 8px 3px 0; vertical-align: top; }
  .datos td.k { color: #6B7280; width: 130px; }
  table.dims { width: 100%; border-collapse: collapse; margin-top: 4px; }
  table.dims th, table.dims td { border: 1px solid #D1D5DB; padding: 6px 8px; text-align: left; }
  table.dims th { background: #F3F4F6; font-size: 12px; }
  table.dims tr.destacada td { background: #F0FDF4; font-weight: bold; }
  .resultado { font-size: 15px; font-weight: bold; }
  .cambio { color: #6B7280; font-size: 12px; margin: 4px 0 0; }
  ul.preguntas { padding-left: 18px; margin: 4px 0; }
  ul.preguntas li { margin-bottom: 5px; }
  ul.preguntas .num { font-weight: bold; color: #6B7280; }
  ul.preguntas .resp { color: #1F2937; font-weight: bold; }
  .pie { margin-top: 28px; padding-top: 8px; border-top: 1px solid #D1D5DB; color: #9CA3AF; font-size: 11px; }
  @media print { body { margin: 0; } @page { margin: 18mm; } }
</style></head><body>
  <h1>Reporte individual</h1>
  <p class="sub">Documento de apoyo para remisión · Generado el ${fmtFecha(new Date().toISOString())}</p>

  <h2>Datos de la persona</h2>
  <table class="datos">
    <tr><td class="k">Nombre</td><td>${esc(d.nombre)}</td></tr>
    <tr><td class="k">Sexo</td><td>${esc(d.sexo ? d.sexo[0].toUpperCase() + d.sexo.slice(1) : null)}</td></tr>
    <tr><td class="k">Tipo</td><td>${esc(d.tipo_usuario ? TIPO_LABEL[d.tipo_usuario] ?? d.tipo_usuario : null)}</td></tr>
    <tr><td class="k">Facultad</td><td>${esc(d.facultad)}</td></tr>
    <tr><td class="k">Programa</td><td>${esc(d.programa)}</td></tr>
    <tr><td class="k">Universidad</td><td>${esc(d.universidad)}</td></tr>
    <tr><td class="k">Medición</td><td>${medicionLinea}</td></tr>
  </table>

  <h2>Resultado global</h2>
  <p class="resultado">${Math.round(r.global_actual_indice)}% — ${esc(r.global_actual_nivel)}</p>
  ${globalCambio}

  <h2>Las seis dimensiones</h2>
  <table class="dims">
    <thead><tr><th>Dimensión</th><th>Nivel actual</th>${hayBase ? "<th>Antes → ahora</th>" : ""}</tr></thead>
    <tbody>${r.dimensiones.map(filaDim).join("")}</tbody>
  </table>

  <h2>Detalle de ${esc(dimensionLabel)}</h2>
  <ul class="preguntas">${preguntasHtml || "<li>Sin detalle disponible.</li>"}</ul>

  <p class="pie">Los niveles y porcentajes salen del cuestionario PEPS II. Este reporte es un resumen para acompañar una remisión; no reemplaza la valoración del profesional que atienda el caso.</p>
</body></html>`
}

export function ReporteIndividualModal({
  usuarioId,
  dimensionClave,
  dimensionLabel,
  preguntas,
  onClose,
}: {
  usuarioId: string
  dimensionClave: string
  dimensionLabel: string
  preguntas: PreguntaReporte[]
  onClose: () => void
}) {
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vivo = true
    api
      .get<Reporte>(`/encuesta/persona/${usuarioId}/reporte`)
      .then((res) => {
        if (vivo) setReporte(res.data)
      })
      .catch(() => {
        if (vivo) setError("No se pudo cargar el reporte de esta persona.")
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })
    return () => {
      vivo = false
    }
  }, [usuarioId])

  // Cerrar con Escape, además de la X y el clic fuera del recuadro.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const imprimir = () => {
    if (!reporte) return
    const html = construirHtml(reporte, dimensionClave, dimensionLabel, preguntas)
    const win = window.open("", "_blank", "width=820,height=1000")
    if (!win) {
      setError("El navegador bloqueó la ventana. Permite las ventanas emergentes e inténtalo de nuevo.")
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    // Pequeña espera para que renderice antes del diálogo de impresión.
    setTimeout(() => win.print(), 250)
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reporte-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="reporte-titulo" className="text-lg font-bold font-heading text-[#1F2937]">
            Reporte individual
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-m-2 p-2 rounded-lg text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cargando && <p className="mt-4 text-sm text-[#6B7280]">Cargando…</p>}

        {error && (
          <p className="mt-4 text-sm text-[#EF4444] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        {reporte && !error && (
          <>
            <p className="mt-2 text-sm text-[#1F2937] font-semibold">{reporte.datos.nombre}</p>
            <p className="mt-3 text-sm text-[#6B7280]">El reporte incluye:</p>
            <ul className="mt-1 text-sm text-[#6B7280] list-disc pl-5 space-y-0.5">
              <li>Datos básicos de la persona</li>
              <li>Resultado global y nivel de las 6 dimensiones</li>
              {reporte.medicion_base && <li>Comparación entre la línea base y la última medición</li>}
              <li>Detalle de {dimensionLabel} pregunta por pregunta</li>
            </ul>
            <p className="mt-3 text-xs text-[#9CA3AF]">
              Se abre en una ventana nueva; usa “Guardar como PDF” en el diálogo de impresión y adjúntalo al correo.
            </p>
            <button
              type="button"
              onClick={imprimir}
              className="mt-5 w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              <Printer className="w-4 h-4" /> Abrir e imprimir / Guardar PDF
            </button>
          </>
        )}
      </div>
    </div>
  )
}
