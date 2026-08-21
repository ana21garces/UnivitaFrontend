"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell } from "lucide-react"
import { api } from "@/lib/api"
import { PerfilMenu } from "@/components/perfil-menu"

// Título de sección según la ruta, para la miga de pan.
const SECTION_LABELS: Record<string, string> = {
  "/dashboard/admin": "Dashboard",
  "/dashboard/admin/user-management": "Gestión de usuarios",
  "/dashboard/admin/perfiles-de-salud": "Perfiles de salud",
  "/dashboard/admin/areas-de-bienestar": "Áreas de bienestar",
  "/dashboard/admin/seguimiento": "Seguimiento / Estadísticas",
  "/dashboard/admin/actividades": "Actividades",
  "/dashboard/admin/notificaciones": "Notificaciones",
  "/dashboard/admin/reportes": "Reportes",
  "/dashboard/admin/configuracion": "Configuración",
}

type Notificacion = {
  id: number
  remitente_nombre: string
  mensaje: string
  leida: boolean
  created_at: string
}

export function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname()
  const section = SECTION_LABELS[pathname] ?? "Panel"

  const [nombre, setNombre] = useState("")
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [panelAbierto, setPanelAbierto] = useState(false)

  useEffect(() => {
    api.get("/users/me").then((res) => setNombre(res.data.full_name)).catch(() => {})
    api.get("/notificaciones").then((res) => setNotificaciones(res.data)).catch(() => {})
  }, [])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const marcarLeida = async (id: number) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    try {
      await api.patch(`/notificaciones/${id}/leida`)
    } catch {
      /* se reintentará al recargar */
    }
  }


  return (
    <header className="sticky top-0 z-20 h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6">
      {/* Izquierda: menú móvil + miga de pan */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenu}
          className="lg:hidden p-2 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm min-w-0">
          {section !== "Dashboard" && (
            <>
              <Link
                href="/dashboard/admin"
                className="text-[#94A3B8] hover:text-[#16A34A] transition-colors hidden sm:inline"
              >
                Dashboard
              </Link>
              <span className="text-[#CBD5E1] hidden sm:inline">/</span>
            </>
          )}
          <span className="font-medium text-[#1F2937] truncate">{section}</span>
        </div>
      </div>

      {/* Derecha: notificaciones + perfil + salir */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {panelAbierto && (
            <div className="fixed inset-0 z-40" onClick={() => setPanelAbierto(false)} />
          )}
          <button
            onClick={() => setPanelAbierto((p) => !p)}
            className="relative p-2 rounded-lg text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {noLeidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {noLeidas}
              </span>
            )}
          </button>

          {panelAbierto && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm font-bold text-[#1F2937]">Notificaciones</p>
              </div>
              {notificaciones.length === 0 ? (
                <p className="px-4 py-6 text-xs text-[#6B7280] text-center">No tienes notificaciones.</p>
              ) : (
                <div className="flex flex-col divide-y divide-[#F1F5F9]">
                  {notificaciones.map((n) => (
                    <div key={n.id} className={`px-4 py-3 ${n.leida ? "" : "bg-[#F0FDF4]"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1F2937]">{n.remitente_nombre}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{n.mensaje}</p>
                        </div>
                        {!n.leida && (
                          <button
                            onClick={() => marcarLeida(n.id)}
                            className="text-[10px] font-semibold text-[#16A34A] hover:underline shrink-0 cursor-pointer"
                          >
                            Descartar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <PerfilMenu nombre={nombre} subtitulo="Administrador" />
      </div>
    </header>
  )
}
