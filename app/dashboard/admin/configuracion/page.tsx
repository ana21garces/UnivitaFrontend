"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import {
  CalendarPlus,
  CalendarClock,
  Ban,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
  Users,
  Pencil,
  Trash2,
  Info,
} from "lucide-react"

type Ciclo = {
  id: number
  numero: number
  nombre: string
  tipo: "linea_base" | "seguimiento"
  estado: "programado" | "abierto" | "cerrado"
  fecha_apertura: string
  fecha_cierre: string | null
  elegibles: number
  respondieron: number
  participacion: number
  editable: boolean
}

const ESTADO_STYLE: Record<string, string> = {
  abierto: "bg-[#F0FDF4] text-[#15803D]",
  programado: "bg-[#EFF6FF] text-[#2563EB]",
  cerrado: "bg-[#F1F5F9] text-[#6B7280]",
}

/** ISO con zona a partir de un <input type="datetime-local">, que da hora local. */
const aIso = (valor: string) => new Date(valor).toISOString()

/** Valor para un <input type="datetime-local"> (hora local, sin segundos). */
function aInput(fecha: Date) {
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

/** Fecha de cierre a partir de la apertura y una duración; null = sin cierre. */
function cierreDesdeApertura(apertura: Date, duracion: string): Date | null {
  if (duracion === "sin") return null
  const d = new Date(apertura)
  if (duracion === "1s") d.setDate(d.getDate() + 7)
  else if (duracion === "2s") d.setDate(d.getDate() + 14)
  else if (duracion === "3s") d.setDate(d.getDate() + 21)
  else if (duracion === "1m") d.setMonth(d.getMonth() + 1)
  return d
}

const DURACIONES: [string, string][] = [
  ["1s", "1 semana"],
  ["2s", "2 semanas"],
  ["3s", "3 semanas"],
  ["1m", "1 mes"],
  ["sin", "Sin cierre"],
]

const formatFecha = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

export default function ConfiguracionPage() {
  const router = useRouter()
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saving, setSaving] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const [showProgramar, setShowProgramar] = useState(false)
  const [formError, setFormError] = useState("")
  const [nuevo, setNuevo] = useState({ nombre: "", apertura: "", aperturaAhora: true, duracion: "2s" })
  const [elegibles, setElegibles] = useState<number | null>(null)

  const [mover, setMover] = useState<{ ciclo: Ciclo; modo: "extender" | "reabrir" } | null>(null)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [cerrar, setCerrar] = useState<Ciclo | null>(null)

  const [renombrar, setRenombrar] = useState<Ciclo | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [eliminar, setEliminar] = useState<Ciclo | null>(null)

  async function cargar() {
    try {
      const { data } = await api.get("/ciclos")
      setCiclos(data.ciclos)
      try {
        // Cuántos ya respondieron: es la audiencia de un seguimiento. Informativo,
        // si falla no bloquea la vista.
        const r = await api.get("/encuesta/admin/resumen")
        setElegibles(r.data.completaron_encuesta)
      } catch {}
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setLoadError("No pudimos cargar las mediciones. Inténtalo de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  function mostrarAviso(texto: string) {
    setAviso(texto)
    setTimeout(() => setAviso(null), 2600)
  }

  function detalleDeError(err: unknown, porDefecto: string) {
    const detail = (err as any).response?.data?.detail
    if (Array.isArray(detail)) return detail[0]?.msg ?? porDefecto
    if (typeof detail === "string") return detail
    return porDefecto
  }

  // La más reciente es la única sobre la que se puede actuar.
  const actual = ciclos[0]
  const siguienteNumero = (ciclos[0]?.numero ?? 0) + 1

  // Vista previa de la ventana para el resumen del modal.
  const aperturaPreview = nuevo.aperturaAhora
    ? new Date()
    : nuevo.apertura
      ? new Date(nuevo.apertura)
      : null
  const cierrePreview = aperturaPreview
    ? cierreDesdeApertura(aperturaPreview, nuevo.duracion)
    : null

  function abrirProgramar() {
    setNuevo({
      nombre: `Seguimiento ${Math.max(1, siguienteNumero - 1)}`,
      apertura: aInput(new Date()),
      aperturaAhora: true,
      duracion: "2s",
    })
    setFormError("")
    setShowProgramar(true)
  }

  async function programar(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    if (nuevo.nombre.trim().length < 3) return setFormError("Ponle un nombre a la medición.")
    const apertura = nuevo.aperturaAhora
      ? new Date()
      : nuevo.apertura
        ? new Date(nuevo.apertura)
        : null
    if (!apertura) return setFormError("Indica cuándo se abre.")
    const cierre = cierreDesdeApertura(apertura, nuevo.duracion)
    setSaving(true)
    try {
      await api.post("/ciclos", {
        nombre: nuevo.nombre.trim(),
        fecha_apertura: apertura.toISOString(),
        fecha_cierre: cierre ? cierre.toISOString() : null,
      })
      setShowProgramar(false)
      await cargar()
      mostrarAviso("Medición programada.")
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setFormError(detalleDeError(err, "No pudimos programar la medición."))
      }
    } finally {
      setSaving(false)
    }
  }

  function abrirMover(ciclo: Ciclo, modo: "extender" | "reabrir") {
    const base = new Date()
    base.setDate(base.getDate() + 15)
    setNuevaFecha(ciclo.fecha_cierre && modo === "extender" ? aInput(new Date(ciclo.fecha_cierre)) : aInput(base))
    setFormError("")
    setMover({ ciclo, modo })
  }

  async function guardarFecha() {
    if (!mover) return
    if (!nuevaFecha) return setFormError("Indica la nueva fecha de cierre.")
    setSaving(true)
    setFormError("")
    try {
      await api.patch(`/ciclos/${mover.ciclo.id}`, { fecha_cierre: aIso(nuevaFecha) })
      setMover(null)
      await cargar()
      mostrarAviso(mover.modo === "reabrir" ? "Medición reabierta." : "Fecha de cierre actualizada.")
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setFormError(detalleDeError(err, "No pudimos cambiar la fecha."))
      }
    } finally {
      setSaving(false)
    }
  }

  async function cerrarAhora() {
    if (!cerrar) return
    setSaving(true)
    try {
      await api.post(`/ciclos/${cerrar.id}/cerrar`)
      setCerrar(null)
      await cargar()
      mostrarAviso("Medición cerrada.")
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setLoadError(detalleDeError(err, "No pudimos cerrar la medición."))
        setCerrar(null)
      }
    } finally {
      setSaving(false)
    }
  }

  function abrirRenombrar(ciclo: Ciclo) {
    setNuevoNombre(ciclo.nombre)
    setFormError("")
    setRenombrar(ciclo)
  }

  async function guardarNombre() {
    if (!renombrar) return
    if (nuevoNombre.trim().length < 3) return setFormError("Ponle un nombre de al menos 3 caracteres.")
    setSaving(true)
    setFormError("")
    try {
      await api.patch(`/ciclos/${renombrar.id}/nombre`, { nombre: nuevoNombre.trim() })
      setRenombrar(null)
      await cargar()
      mostrarAviso("Nombre actualizado.")
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setFormError(detalleDeError(err, "No pudimos cambiar el nombre."))
      }
    } finally {
      setSaving(false)
    }
  }

  async function confirmarEliminar() {
    if (!eliminar) return
    setSaving(true)
    try {
      await api.delete(`/ciclos/${eliminar.id}`)
      setEliminar(null)
      await cargar()
      mostrarAviso("Medición eliminada.")
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setLoadError(detalleDeError(err, "No pudimos eliminar la medición."))
        setEliminar(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    "w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
  const btnSec =
    "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
  const chipCls = (active: boolean) =>
    `text-xs font-medium px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
      active
        ? "text-[#15803D] bg-[#EAF3DE] border-[#BBF7D0]"
        : "text-[#475569] bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]"
    }`

  const EstadoPill = ({ estado }: { estado: string }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${ESTADO_STYLE[estado]}`}>
      {estado}
    </span>
  )

  const Participacion = ({ ciclo }: { ciclo: Ciclo }) => (
    <div>
      <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1.5">
        <span className="inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {ciclo.respondieron} de {ciclo.elegibles} {ciclo.tipo === "linea_base" ? "usuarios" : "elegibles"}
        </span>
        <span className="font-semibold text-[#1F2937]">{ciclo.participacion}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, ciclo.participacion)}%`, background: "linear-gradient(90deg, #16A34A, #22C55E)" }}
        />
      </div>
    </div>
  )

  return (
    <>
      <main className="px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Configuración</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Programa las mediciones de la encuesta y consulta su participación.
            </p>
          </div>
          <button
            onClick={abrirProgramar}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-[#FFFFFF] shadow-md shadow-[#16A34A]/20 hover:shadow-lg transition-all cursor-pointer shrink-0"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            <CalendarPlus className="w-4 h-4" />
            Programar medición
          </button>
        </div>

        {loadError && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm px-4 py-12 text-center text-sm text-[#6B7280]">
            Cargando mediciones...
          </div>
        ) : (
          <>
            {/* Medición más reciente: la única sobre la que se puede actuar */}
            {actual && (
              <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-5 mb-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold font-heading text-[#1F2937]">{actual.nombre}</h3>
                      <EstadoPill estado={actual.estado} />
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      Abre el {formatFecha(actual.fecha_apertura)}
                      {actual.fecha_cierre
                        ? ` y cierra el ${formatFecha(actual.fecha_cierre)}`
                        : actual.tipo === "linea_base"
                          ? ". Siempre abierta: es la primera encuesta de cada usuario nuevo."
                          : ". Sin fecha de cierre: queda abierta hasta que la cierres."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {actual.editable && actual.estado !== "cerrado" && (
                      <>
                        <button onClick={() => abrirMover(actual, "extender")} className={btnSec}>
                          <CalendarClock className="w-4 h-4" />
                          Extender
                        </button>
                        <button onClick={() => setCerrar(actual)} className={btnSec}>
                          <Ban className="w-4 h-4" />
                          Cerrar ahora
                        </button>
                      </>
                    )}
                    {actual.editable && actual.estado === "cerrado" && (
                      <button onClick={() => abrirMover(actual, "reabrir")} className={btnSec}>
                        <RotateCcw className="w-4 h-4" />
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>
                <Participacion ciclo={actual} />
              </div>
            )}

            {/* Historial */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Medición</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Estado</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Ventana</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Respondieron</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Participación</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ciclos.map((c) => (
                      <tr key={c.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1F2937]">{c.nombre}</p>
                          <p className="text-xs text-[#94A3B8]">
                            {c.tipo === "linea_base" ? "Encuesta inicial" : `Medición ${c.numero}`}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <EstadoPill estado={c.estado} />
                        </td>
                        <td className="px-4 py-3 text-[#6B7280]">
                          {formatFecha(c.fecha_apertura)}
                          {c.fecha_cierre ? ` → ${formatFecha(c.fecha_cierre)}` : " → sin cierre"}
                        </td>
                        <td className="px-4 py-3 text-center text-[#1F2937]">
                          {c.respondieron} / {c.elegibles}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-[#1F2937]">{c.participacion}%</td>
                        <td className="px-4 py-3">
                          {c.tipo === "linea_base" ? (
                            <span className="block text-right text-xs text-[#CBD5E1]">—</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => abrirRenombrar(c)}
                                title="Editar nombre"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#16A34A] cursor-pointer transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {c.respondieron === 0 && (
                                <button
                                  onClick={() => setEliminar(c)}
                                  title="Eliminar medición"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Móvil */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {ciclos.map((c) => (
                  <div key={c.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[#1F2937]">{c.nombre}</p>
                      <EstadoPill estado={c.estado} />
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {formatFecha(c.fecha_apertura)}
                      {c.fecha_cierre ? ` → ${formatFecha(c.fecha_cierre)}` : " → sin cierre"}
                    </p>
                    <Participacion ciclo={c} />
                    {c.tipo !== "linea_base" && (
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => abrirRenombrar(c)} className={btnSec}>
                          <Pencil className="w-4 h-4" />
                          Nombre
                        </button>
                        {c.respondieron === 0 && (
                          <button
                            onClick={() => setEliminar(c)}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#FECACA] bg-[#FFFFFF] text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-[#94A3B8] max-w-2xl">
              Solo la medición más reciente se puede extender, cerrar o reabrir: así cada respuesta queda
              en la ronda que le corresponde. El nombre sí se puede editar en cualquier momento, y una
              medición que aún no tiene respuestas se puede eliminar.
            </p>
          </>
        )}
      </main>

      {/* Aviso de éxito */}
      {aviso && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1F2937] text-[#FFFFFF] shadow-2xl">
          <Check className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-sm">{aviso}</span>
        </div>
      )}

      {/* Modal: programar medición */}
      {showProgramar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setShowProgramar(false)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setShowProgramar(false)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Programar medición</h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              Se les abre a quienes ya respondieron la encuesta al menos una vez. Es opcional: verán un
              aviso en su panel, no se les bloquea nada.
            </p>
            <form className="flex flex-col gap-4" onSubmit={programar}>
              {formError && (
                <div className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Nombre</label>
                <input
                  type="text"
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  placeholder="Seguimiento 1"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Se abre</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setNuevo({ ...nuevo, aperturaAhora: true })} className={chipCls(nuevo.aperturaAhora)}>
                    Ahora
                  </button>
                  <button type="button" onClick={() => setNuevo({ ...nuevo, aperturaAhora: false })} className={chipCls(!nuevo.aperturaAhora)}>
                    Programar fecha
                  </button>
                </div>
                {!nuevo.aperturaAhora && (
                  <input
                    type="datetime-local"
                    value={nuevo.apertura}
                    onChange={(e) => setNuevo({ ...nuevo, apertura: e.target.value })}
                    className={`${inputCls} mt-1`}
                  />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Duración</label>
                <div className="flex flex-wrap gap-2">
                  {DURACIONES.map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setNuevo({ ...nuevo, duracion: val })} className={chipCls(nuevo.duracion === val)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-2.5 text-xs text-[#166534] leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Abre{" "}
                  <span className="font-semibold">
                    {nuevo.aperturaAhora ? "hoy" : nuevo.apertura ? formatFecha(aIso(nuevo.apertura)) : "—"}
                  </span>{" "}
                  {cierrePreview ? (
                    <>
                      y cierra el <span className="font-semibold">{formatFecha(cierrePreview.toISOString())}</span>.
                    </>
                  ) : (
                    <>y queda abierta hasta que la cierres a mano.</>
                  )}
                  {elegibles !== null && (
                    <>
                      {" "}Le llegará a <span className="font-semibold">{elegibles} {elegibles === 1 ? "persona" : "personas"}</span> que ya respondieron.
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button type="button" onClick={() => setShowProgramar(false)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                  {saving ? "Programando..." : "Programar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: extender o reabrir */}
      {mover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setMover(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setMover(null)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              {mover.modo === "reabrir" ? <RotateCcw className="w-6 h-6" /> : <CalendarClock className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">
              {mover.modo === "reabrir" ? "Reabrir medición" : "Extender medición"}
            </h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              {mover.modo === "reabrir"
                ? `«${mover.ciclo.nombre}» volverá a recibir respuestas hasta la fecha que elijas.`
                : `«${mover.ciclo.nombre}» seguirá abierta hasta la fecha nueva.`}
            </p>
            {formError && (
              <div className="flex items-center gap-1.5 mb-4 text-sm text-[#DC2626]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-sm font-medium text-[#1F2937]">Nueva fecha de cierre</label>
              <input
                type="datetime-local"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setMover(null)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={guardarFecha} disabled={saving} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                <Check className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: cerrar ahora */}
      {cerrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setCerrar(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setCerrar(null)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#D97706] mb-4">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Cerrar medición</h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              «{cerrar.nombre}» dejará de recibir respuestas ahora mismo. Respondieron{" "}
              <span className="font-semibold text-[#1F2937]">
                {cerrar.respondieron} de {cerrar.elegibles}
              </span>
              . Podrás reabrirla si te falta gente.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setCerrar(null)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={cerrarAhora} disabled={saving} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] bg-[#D97706] hover:bg-[#B45309] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-colors">
                <Ban className="w-4 h-4" />
                {saving ? "Cerrando..." : "Cerrar ahora"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: renombrar */}
      {renombrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setRenombrar(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setRenombrar(null)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              <Pencil className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Editar nombre</h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              Cambia solo cómo se llama la medición. No afecta las fechas ni las respuestas ya recibidas.
            </p>
            {formError && (
              <div className="flex items-center gap-1.5 mb-4 text-sm text-[#DC2626]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-sm font-medium text-[#1F2937]">Nombre</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && guardarNombre()}
                className={inputCls}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setRenombrar(null)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={guardarNombre} disabled={saving} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                <Check className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: eliminar medición sin respuestas */}
      {eliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setEliminar(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setEliminar(null)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#DC2626] mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Eliminar medición</h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              «{eliminar.nombre}» se eliminará por completo. Nadie ha respondido todavía, así que no se
              pierde ningún dato. Si era la más reciente, la anterior volverá a poder editarse.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setEliminar(null)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmarEliminar} disabled={saving} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-colors">
                <Trash2 className="w-4 h-4" />
                {saving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
