"use client"

import { useRouter } from "next/navigation"

export type NotificacionCampana = {
  id: number
  remitente_nombre: string
  mensaje: string
  enlace?: string | null
  tipo?: string | null
  puede_responder?: boolean
  respuesta?: string | null
  leida: boolean
  created_at: string
}

export function NotificacionItem({
  n,
  onDescartar,
  onNavegar,
  onResponder,
}: {
  n: NotificacionCampana
  onDescartar: (id: number) => void
  onNavegar?: () => void
  onResponder?: (id: number, acepta: boolean) => void
}) {
  const router = useRouter()
  const clicable = !!n.enlace

  if (clicable) {
    const estilo =
      n.tipo === "cita_aceptada"
        ? {
            borde: "border-[#16A34A]",
            fondo: "hover:bg-[#F0FDF4]",
            sinLeer: "bg-[#F0FDF4]",
            titulo: n.remitente_nombre,
            colorTitulo: "text-[#1F2937]",
            accion: "Ver historial →",
            colorAccion: "text-[#16A34A]",
          }
        : n.tipo === "cita_rechazada"
          ? {
              borde: "border-[#D97706]",
              fondo: "hover:bg-[#FFFBEB]",
              sinLeer: "bg-[#FFFBEB]",
              titulo: n.remitente_nombre,
              colorTitulo: "text-[#B45309]",
              accion: "Volver a invitar →",
              colorAccion: "text-[#B45309]",
            }
          : {
              borde: "border-red-500",
              fondo: "hover:bg-[#FEF2F2]",
              sinLeer: "bg-[#FEF2F2]",
              titulo: "Estudiante en alerta",
              colorTitulo: "text-[#B91C1C]",
              accion: "Atender →",
              colorAccion: "text-[#DC2626]",
            }
    const abrir = () => {
      onDescartar(n.id)
      onNavegar?.()
      const params = new URLSearchParams(n.enlace!.split("?")[1] ?? "")
      router.push(n.enlace!)
      window.dispatchEvent(new CustomEvent("alerta-nav", { detail: params.get("alerta") }))
      const reporte = params.get("reporte")
      if (reporte) window.dispatchEvent(new CustomEvent("reporte-nav", { detail: reporte }))
    }
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={abrir}
        onKeyDown={(e) => { if (e.key === "Enter") abrir() }}
        className={`px-4 py-3 border-l-2 cursor-pointer ${estilo.borde} ${estilo.fondo} ${
          n.leida ? "" : estilo.sinLeer
        }`}
      >
        <p className={`text-xs font-semibold ${estilo.colorTitulo}`}>{estilo.titulo}</p>
        <p className="text-xs text-[#6B7280] mt-0.5">{n.mensaje}</p>
        <span className={`inline-block mt-1 text-[11px] font-semibold ${estilo.colorAccion}`}>
          {estilo.accion}
        </span>
      </div>
    )
  }

  // Notificación normal (incluye invitación a cita con Aceptar/Rechazar)
  return (
    <div className={`px-4 py-3 ${n.leida ? "" : "bg-[#F0FDF4]"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#1F2937]">{n.remitente_nombre}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">{n.mensaje}</p>

          {n.respuesta && (
            <p className={`mt-1 text-[11px] font-semibold ${n.respuesta === "aceptada" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
              {n.respuesta === "aceptada" ? "Aceptaste la cita ✓" : "Rechazaste la cita"}
            </p>
          )}

          {n.puede_responder && onResponder && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => onResponder(n.id, true)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors"
              >
                Aceptar
              </button>
              <button
                type="button"
                onClick={() => onResponder(n.id, false)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[#6B7280] hover:bg-[#F1F5F9] transition-colors"
              >
                Rechazar
              </button>
            </div>
          )}
        </div>

        {!n.leida && !n.puede_responder && (
          <button
            type="button"
            onClick={() => onDescartar(n.id)}
            className="text-[10px] font-semibold text-[#16A34A] hover:underline shrink-0 cursor-pointer"
          >
            Descartar
          </button>
        )}
      </div>
    </div>
  )
}
