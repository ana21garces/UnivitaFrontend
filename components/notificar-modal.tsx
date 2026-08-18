"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"
import { api } from "@/lib/api"

/**
 * Modal para invitar a un estudiante a agendar una cita. La usan las vistas
 * de rol (capellán, actividad física, y responsabilidad en salud cuando la
 * tenga); no depende del tipo `Usuario` de ninguna de ellas, solo del
 * nombre y el id que necesita para llamar a POST /notificaciones.
 */
export function NotificarModal({
  nombre,
  usuarioId,
  mensajeSugerido,
  onClose,
  onEnviado,
}: {
  nombre: string
  usuarioId: string
  mensajeSugerido: string
  onClose: () => void
  onEnviado: (usuarioId: string) => void
}) {
  const [mensaje, setMensaje] = useState(mensajeSugerido)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")

  const enviar = async () => {
    if (!mensaje.trim()) return
    setEnviando(true)
    setError("")
    try {
      await api.post("/notificaciones", { destinatario_id: usuarioId, mensaje: mensaje.trim() })
      onEnviado(usuarioId)
      onClose()
    } catch {
      setError("No se pudo enviar la notificación. Intenta de nuevo.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-[#1F2937]">Notificar a {nombre}</h3>
          <button type="button" onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-[#6B7280] mb-3">El estudiante verá este mensaje en su panel.</p>

        <textarea
          className="w-full text-sm border border-[#E2E8F0] rounded-lg p-3 focus:outline-none focus:border-[#16A34A] resize-none"
          rows={4}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !mensaje.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}
