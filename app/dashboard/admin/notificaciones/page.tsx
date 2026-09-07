"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken, LOGIN_PATH } from "@/lib/auth"
import {
  Megaphone,
  Send,
  Users,
  Clock,
  Check,
  AlertTriangle,
  X,
  Bell,
} from "lucide-react"

type Segmentos = {
  total_estudiantes: number
  facultades: string[]
  programas: string[]
  tipos: string[]
  niveles: string[]
  medicion_abierta: { nombre: string; faltantes: number } | null
}

type Envio = {
  remitente_nombre: string
  mensaje: string
  total: number
  leidas: number
  created_at: string
}

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const selectCls =
  "w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors cursor-pointer"

export default function NotificacionesPage() {  const router = useRouter()

  const [segmentos, setSegmentos] = useState<Segmentos | null>(null)
  const [historial, setHistorial] = useState<Envio[]>([])
  const [loading, setLoading] = useState(true)

  const [mensaje, setMensaje] = useState("")
  const [segmento, setSegmento] = useState("todos")
  const [valor, setValor] = useState("")
  const [preview, setPreview] = useState<number | null>(null)

  const [confirmar, setConfirmar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    try {
      const [seg, env] = await Promise.all([
        api.get("/notificaciones/segmentos"),
        api.get("/notificaciones/enviadas"),
      ])
      setSegmentos(seg.data)
      setHistorial(env.data)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setError("No pudimos cargar la información. Inténtalo de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(LOGIN_PATH)
      return
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Opciones de valor según el segmento elegido.
  const opcionesValor =
    segmento === "facultad"
      ? segmentos?.facultades
      : segmento === "programa"
        ? segmentos?.programas
        : segmento === "tipo"
          ? segmentos?.tipos
          : segmento === "nivel"
            ? segmentos?.niveles
            : null

  const necesitaValor = opcionesValor !== null

  // Al cambiar el segmento, se elige el primer valor disponible (o ninguno).
  function cambiarSegmento(nuevo: string) {
    setSegmento(nuevo)
    const opciones =
      nuevo === "facultad"
        ? segmentos?.facultades
        : nuevo === "programa"
          ? segmentos?.programas
          : nuevo === "tipo"
            ? segmentos?.tipos
            : nuevo === "nivel"
              ? segmentos?.niveles
              : null
    setValor(opciones && opciones.length ? opciones[0] : "")
  }

  // Vista previa de cuántas personas recibirán el anuncio.
  useEffect(() => {
    if (!getAccessToken() || !segmentos) return
    if (necesitaValor && !valor) {
      setPreview(null)
      return
    }
    let cancelado = false
    api
      .get("/notificaciones/difusion/preview", { params: { segmento, ...(valor ? { valor } : {}) } })
      .then((r) => !cancelado && setPreview(r.data.destinatarios))
      .catch(() => !cancelado && setPreview(null))
    return () => {
      cancelado = true
    }
  }, [segmento, valor, segmentos, necesitaValor])

  async function enviar() {
    setEnviando(true)
    setError(null)
    try {
      const { data } = await api.post("/notificaciones/difusion", {
        mensaje: mensaje.trim(),
        segmento,
        ...(valor ? { valor } : {}),
      })
      setConfirmar(false)
      setMensaje("")
      await cargar()
      setAviso(`Anuncio enviado a ${data.enviados} ${data.enviados === 1 ? "persona" : "personas"}.`)
      setTimeout(() => setAviso(null), 3000)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as any).response?.data?.detail
        setError(typeof detail === "string" ? detail : "No pudimos enviar el anuncio.")
        setConfirmar(false)
      }
    } finally {
      setEnviando(false)
    }
  }

  const puedeEnviar =
    mensaje.trim().length >= 5 && (!necesitaValor || !!valor) && (preview ?? 0) > 0

  return (
    <>
      <main className="px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Notificaciones</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Envía anuncios a los usuarios y consulta lo que se ha enviado en la plataforma.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm px-4 py-12 text-center text-sm text-[#6B7280]">
            Cargando...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Redactor */}
            <div className="lg:col-span-2 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-5 h-fit">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#EAF3DE] text-[#16A34A] shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-heading text-[#1F2937]">Nuevo anuncio</h3>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[#64748B]">Mensaje</span>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Escribe el anuncio que verán en su campana..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors resize-none"
                  />
                  <span className="text-[11px] text-[#94A3B8] self-end">{mensaje.length}/500</span>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[#64748B]">Enviar a</span>
                  <select value={segmento} onChange={(e) => cambiarSegmento(e.target.value)} className={selectCls}>
                    <option value="todos">Todos los usuarios</option>
                    <option value="facultad">Por facultad</option>
                    <option value="programa">Por programa</option>
                    <option value="tipo">Por tipo de usuario</option>
                    <option value="nivel">Por nivel</option>
                    {segmentos?.medicion_abierta && (
                      <option value="sin_responder">No respondieron la medición abierta</option>
                    )}
                  </select>
                </label>

                {necesitaValor && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-[#64748B]">
                      {segmento === "facultad"
                        ? "Facultad"
                        : segmento === "programa"
                          ? "Programa"
                          : segmento === "tipo"
                            ? "Tipo de usuario"
                            : "Nivel"}
                    </span>
                    <select value={valor} onChange={(e) => setValor(e.target.value)} className={selectCls}>
                      {(opcionesValor ?? []).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    {opcionesValor && opcionesValor.length === 0 && (
                      <span className="text-[11px] text-[#94A3B8]">No hay opciones disponibles.</span>
                    )}
                  </label>
                )}

                {segmento === "sin_responder" && segmentos?.medicion_abierta && (
                  <p className="text-xs text-[#6B7280] -mt-1">
                    Medición abierta: <span className="font-medium">{segmentos.medicion_abierta.nombre}</span>.
                  </p>
                )}

                <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2.5 text-sm">
                  <Users className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-[#475569]">
                    {preview === null ? (
                      "Selecciona un destino…"
                    ) : (
                      <>Llegará a <span className="font-bold text-[#1F2937]">{preview}</span> {preview === 1 ? "persona" : "personas"}</>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => setConfirmar(true)}
                  disabled={!puedeEnviar}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-[#FFFFFF] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                >
                  <Send className="w-4 h-4" />
                  Enviar anuncio
                </button>
              </div>
            </div>

            {/* Historial */}
            <div className="lg:col-span-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E2E8F0]">
                <Clock className="w-4 h-4 text-[#64748B]" />
                <h3 className="text-base font-bold font-heading text-[#1F2937]">Enviados</h3>
                <span className="ml-auto text-xs text-[#94A3B8]">{historial.length} envíos</span>
              </div>

              {historial.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Bell className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">Todavía no se ha enviado ninguna notificación.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0] max-h-[560px] overflow-y-auto">
                  {historial.map((e, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-[#1F2937] leading-relaxed">{e.mensaje}</p>
                        <span className="text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0">
                          {formatFecha(e.created_at)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-[#6B7280]">
                        <span>Por {e.remitente_nombre}</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {e.total} {e.total === 1 ? "destinatario" : "destinatarios"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#15803D]">
                          <Check className="w-3.5 h-3.5" />
                          {e.leidas} {e.leidas === 1 ? "leída" : "leídas"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {aviso && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1F2937] text-[#FFFFFF] shadow-2xl">
          <Check className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-sm">{aviso}</span>
        </div>
      )}

      {/* Confirmar envío */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !enviando && setConfirmar(false)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setConfirmar(false)} disabled={enviando} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Enviar anuncio</h3>
            <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
              Le llegará a <span className="font-semibold text-[#1F2937]">{preview}</span> {preview === 1 ? "persona" : "personas"} en su campana. Esta acción no se puede deshacer.
            </p>
            <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2.5 mb-5 text-sm text-[#475569] italic">
              “{mensaje.trim()}”
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setConfirmar(false)} disabled={enviando} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={enviar} disabled={enviando} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                <Send className="w-4 h-4" />
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
