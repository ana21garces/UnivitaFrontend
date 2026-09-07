"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, Bell, LayoutDashboard } from "lucide-react"
import { api } from "@/lib/api"
import { PerfilMenu } from "@/components/perfil-menu"
import { NotificacionItem } from "@/components/notificacion-item"

// Título de sección según la ruta, para la miga de pan.
const SECTION_LABELS: Record<string, string> = {
  "/dashboard/admin": "Dashboard",
  "/dashboard/admin/user-management": "Gestión de usuarios",
  "/dashboard/admin/perfiles-de-salud": "Perfiles de salud",
  "/dashboard/admin/areas-de-bienestar": "Áreas de bienestar",
  "/dashboard/admin/seguimiento": "Seguimiento / Estadísticas",
  "/dashboard/admin/auditoria": "Auditoría",
  "/dashboard/admin/notificaciones": "Notificaciones",
  "/dashboard/admin/reportes": "Reportes",
  "/dashboard/admin/configuracion": "Configuración",
}

type Notificacion = {
  id: number
  remitente_nombre: string
  mensaje: string
  enlace?: string | null
  leida: boolean
  created_at: string
}

export function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname()
  const section = SECTION_LABELS[pathname] ?? "Panel"

  const [nombre, setNombre] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [panelAbierto, setPanelAbierto] = useState(false)

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        setNombre(res.data.full_name)
        setAvatarUrl(res.data.avatar_url ?? null)
      })
      .catch(() => {})
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
    <header
      className="sticky top-0 z-20 h-16 border-b border-[#DCFCE7] flex items-center justify-between px-4 sm:px-6"
      style={{ background: "linear-gradient(90deg, #EAF3DE 0%, #F0FDF4 22%, #FFFFFF 58%)", backgroundAttachment: "fixed" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenu}
          className="lg:hidden p-2 rounded-lg text-[#3B6D11] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#16A34A] text-white shrink-0">
          <LayoutDashboard className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#14532D] leading-tight truncate">{section}</p>
          <p className="text-[11px] text-[#3B6D11] leading-none">Panel de administración</p>
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
            className="relative p-2 rounded-lg text-[#16A34A] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
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
                    <NotificacionItem
                      key={n.id}
                      n={n}
                      onDescartar={marcarLeida}
                      onNavegar={() => setPanelAbierto(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <PerfilMenu nombre={nombre} subtitulo="Administrador" avatarUrl={avatarUrl} />
      </div>
    </header>
  )
}
