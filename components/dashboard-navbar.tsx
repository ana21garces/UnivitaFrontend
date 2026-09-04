"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Users,
  BookHeart,
  Dumbbell,
  Stethoscope,
  HeartHandshake,
  Brain,
  Salad,
  Bell,
  UserCog,
  HelpCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { UniVitaLogo } from "@/components/univita-logo"
import { PerfilMenu } from "@/components/perfil-menu"
import { NotificacionItem } from "@/components/notificacion-item"
import { clearSession } from "@/lib/auth"
import { api } from "@/lib/api"
import type { ProgresoGamificacion, RankTier } from "@/lib/gamificacion"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export type RolNavbar =
  | "user"
  | "admin"
  | "capellan"
  | "actividad-fisica"
  | "responsabilidad-salud"
  | "relaciones-interpersonales"
  | "manejo-estres"
  | "nutricion"

interface DashboardNavbarProps {
  role: RolNavbar
  userName?: string
}

type Notificacion = {
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

// Etiqueta visible del tipo de usuario que se marcó en la encuesta. El
// backend guarda el valor en minúscula ("estudiante", "docente",
// "administrativo"); las cuentas profesionales no lo tienen y no muestran
// esta segunda línea.
const TIPO_USUARIO_LABEL: Record<string, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  administrativo: "Administrativo",
}

const AYUDA: NavItem = {
  label: "Ayuda",
  href: "/dashboard/ayuda",
  icon: <HelpCircle className="w-4 h-4" />,
}

const navItemsByRole: Record<string, NavItem[]> = {
  user: [
    { label: "Dashboard", href: "/dashboard/user", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Mi perfil", href: "/dashboard/perfil", icon: <UserCog className="w-4 h-4" /> },
    AYUDA,
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "User Management", href: "/dashboard/admin/user-management", icon: <Users className="w-4 h-4" /> },
  ],
  capellan: [
    { label: "Psicología Positiva", href: "/dashboard/capellan", icon: <BookHeart className="w-4 h-4" /> },
    AYUDA,
  ],
  "actividad-fisica": [
    { label: "Actividad Física", href: "/dashboard/actividad-fisica", icon: <Dumbbell className="w-4 h-4" /> },
    AYUDA,
  ],
  "responsabilidad-salud": [
    { label: "Responsabilidad en Salud", href: "/dashboard/responsabilidad-salud", icon: <Stethoscope className="w-4 h-4" /> },
    AYUDA,
  ],
  "relaciones-interpersonales": [
    { label: "Relaciones Interpersonales", href: "/dashboard/relaciones-interpersonales", icon: <HeartHandshake className="w-4 h-4" /> },
    AYUDA,
  ],
  "manejo-estres": [
    { label: "Manejo del Estrés", href: "/dashboard/manejo-estres", icon: <Brain className="w-4 h-4" /> },
    AYUDA,
  ],
  nutricion: [
    { label: "Nutrición", href: "/dashboard/nutricion", icon: <Salad className="w-4 h-4" /> },
    AYUDA,
  ],
}

export function DashboardNavbar({ role, userName }: DashboardNavbarProps) {
  // El nombre se pide una vez aqui, en vez de en cada pantalla: el JWT solo
  // lleva el id, el correo y el rol. Antes cada vista ponia una cadena fija
  // --"Estudiante", "Prof. Actividad Fisica"-- y todos los estudiantes veian
  // la misma "E" en el avatar.
  const [nombre, setNombre] = useState(userName ?? "")
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null)
  const [progreso, setProgreso] = useState<ProgresoGamificacion | null>(null)

  useEffect(() => {
    if (userName) return
    api
      .get("/users/me")
      .then((res) => {
        setNombre(res.data.full_name)
        setTipoUsuario(res.data.tipo_usuario ?? null)
        setProgreso({
          total_xp: res.data.total_xp,
          current_level: res.data.current_level,
          rank_tier: (res.data.rank_tier ?? "bronce") as RankTier,
          streak_days: res.data.streak_days,
          xp_en_nivel: 0,
          xp_para_siguiente: 100,
          avatar_url: res.data.avatar_url,
        })
        return api.get("/gamificacion/progreso")
      })
      .then((res) => {
        if (res?.data) setProgreso(res.data)
      })
      .catch(() => { /* el nombre es adorno: si falla, no se estorba a la pantalla */ })
  }, [userName])

  // Notificaciones que le hayan enviado (hoy solo el capellan las manda, a
  // estudiantes). Se piden aqui, no en cada pantalla, igual que el nombre.
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [panelAbierto, setPanelAbierto] = useState(false)

  useEffect(() => {
    const rol = role === "user" || role === "admin" ? null : role.replace(/-/g, "_")
    const url = rol ? `/notificaciones?rol=${rol}` : "/notificaciones"
    api.get(url).then((res) => setNotificaciones(res.data)).catch(() => {})
  }, [role])

  // Aviso de medición de seguimiento abierta: cuenta como una notificación por
  // leer en la campana. Solo aplica a los usuarios que responden la encuesta.
  const [seguimiento, setSeguimiento] = useState<{ nombre: string; fecha_cierre: string | null } | null>(null)

  useEffect(() => {
    if (role !== "user") return
    api
      .get("/encuesta/estado")
      .then((res) => setSeguimiento(res.data.seguimiento_pendiente ?? null))
      .catch(() => {})
  }, [role])

  const marcarLeida = async (id: number) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    try {
      await api.patch(`/notificaciones/${id}/leida`)
    } catch {
      // Se reintentara en la siguiente carga de la pagina.
    }
  }

  const responder = async (id: number, acepta: boolean) => {
    setNotificaciones((prev) => prev.map((n) => (
      n.id === id ? { ...n, respuesta: acepta ? "aceptada" : "rechazada", puede_responder: false, leida: true } : n
    )))
    try {
      await api.post(`/notificaciones/${id}/responder`, { acepta })
    } catch {
      // Se reintentara en la siguiente carga de la pagina.
    }
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length + (seguimiento ? 1 : 0)

  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = navItemsByRole[role] || []

  const handleLogout = () => {
    clearSession()
    router.replace("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <UniVitaLogo size="sm" />
          <h1 className="text-xl font-bold font-heading text-[#1F2937]">
            UnacHealth
          </h1>
        </div>

        {/* Center: Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#F0FDF4] text-[#16A34A]"
                    : "text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Notificaciones + User + Mobile menu */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {panelAbierto && (
              <div className="fixed inset-0 z-40" onClick={() => setPanelAbierto(false)} />
            )}
            <button
              type="button"
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
                {notificaciones.length === 0 && !seguimiento ? (
                  <p className="px-4 py-6 text-xs text-[#6B7280] text-center">No tienes notificaciones.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-[#F1F5F9]">
                    {seguimiento && (
                      <div className="px-4 py-3 bg-[#F0FDF4]">
                        <p className="text-xs font-semibold text-[#166534]">Nueva medición disponible</p>
                        <p className="text-xs text-[#15803D] mt-0.5">
                          Responde la encuesta para ver cómo cambió tu bienestar.
                        </p>
                        <Link
                          href="/onboarding/survey?seguimiento=1"
                          onClick={() => setPanelAbierto(false)}
                          className="inline-block mt-1.5 text-[11px] font-semibold text-[#16A34A] hover:underline"
                        >
                          Responder ahora →
                        </Link>
                      </div>
                    )}
                    {notificaciones.map((n) => (
                      <NotificacionItem
                        key={n.id}
                        n={n}
                        onDescartar={marcarLeida}
                        onNavegar={() => setPanelAbierto(false)}
                        onResponder={responder}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <PerfilMenu
            nombre={nombre}
            subtitulo={tipoUsuario ? (TIPO_USUARIO_LABEL[tipoUsuario] ?? tipoUsuario) : undefined}
            rankTier={progreso?.rank_tier ?? "bronce"}
            avatarUrl={progreso?.avatar_url}
            currentLevel={progreso?.current_level}
          />

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-3">
          {tipoUsuario && (
            <p className="mb-3 text-xs text-[#6B7280]">
              {nombre} · {TIPO_USUARIO_LABEL[tipoUsuario] ?? tipoUsuario}
            </p>
          )}
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#F0FDF4] text-[#16A34A]"
                      : "text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); handleLogout() }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
