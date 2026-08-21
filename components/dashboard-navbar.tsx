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
} from "lucide-react"
import { useEffect, useState } from "react"
import { UniVitaLogo } from "@/components/univita-logo"
import { clearSession } from "@/lib/auth"
import { api } from "@/lib/api"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface DashboardNavbarProps {
  role: "user" | "admin" | "capellan" | "actividad-fisica" | "responsabilidad-salud" | "relaciones-interpersonales" | "manejo-estres" | "nutricion"
  userName?: string
}

type Notificacion = {
  id: number
  remitente_nombre: string
  mensaje: string
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

const navItemsByRole: Record<string, NavItem[]> = {
  user: [
    { label: "Dashboard", href: "/dashboard/user", icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "User Management", href: "/dashboard/admin/user-management", icon: <Users className="w-4 h-4" /> },
  ],
  capellan: [
    { label: "Psicología Positiva", href: "/dashboard/capellan", icon: <BookHeart className="w-4 h-4" /> },
  ],
  "actividad-fisica": [
    { label: "Actividad Física", href: "/dashboard/actividad-fisica", icon: <Dumbbell className="w-4 h-4" /> },
  ],
  "responsabilidad-salud": [
    { label: "Responsabilidad en Salud", href: "/dashboard/responsabilidad-salud", icon: <Stethoscope className="w-4 h-4" /> },
  ],
  "relaciones-interpersonales": [
    { label: "Relaciones Interpersonales", href: "/dashboard/relaciones-interpersonales", icon: <HeartHandshake className="w-4 h-4" /> },
  ],
  "manejo-estres": [
    { label: "Manejo del Estrés", href: "/dashboard/manejo-estres", icon: <Brain className="w-4 h-4" /> },
  ],
  nutricion: [
    { label: "Nutrición", href: "/dashboard/nutricion", icon: <Salad className="w-4 h-4" /> },
  ],
}

export function DashboardNavbar({ role, userName }: DashboardNavbarProps) {
  // El nombre se pide una vez aqui, en vez de en cada pantalla: el JWT solo
  // lleva el id, el correo y el rol. Antes cada vista ponia una cadena fija
  // --"Estudiante", "Prof. Actividad Fisica"-- y todos los estudiantes veian
  // la misma "E" en el avatar.
  const [nombre, setNombre] = useState(userName ?? "")
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null)

  useEffect(() => {
    if (userName) return
    api
      .get("/users/me")
      .then((res) => {
        setNombre(res.data.full_name)
        setTipoUsuario(res.data.tipo_usuario ?? null)
      })
      .catch(() => { /* el nombre es adorno: si falla, no se estorba a la pantalla */ })
  }, [userName])

  // Notificaciones que le hayan enviado (hoy solo el capellan las manda, a
  // estudiantes). Se piden aqui, no en cada pantalla, igual que el nombre.
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [panelAbierto, setPanelAbierto] = useState(false)

  useEffect(() => {
    api.get("/notificaciones").then((res) => setNotificaciones(res.data)).catch(() => {})
  }, [])

  const marcarLeida = async (id: number) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    try {
      await api.patch(`/notificaciones/${id}/leida`)
    } catch {
      // Se reintentara en la siguiente carga de la pagina.
    }
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

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
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold font-heading text-[#1F2937] leading-tight">
              UnacHealth
            </h1>
            <p className="text-[10px] text-[#6B7280] leading-none">
              Plataforma para un estilo de vida saludable
            </p>
          </div>
          <h1 className="sm:hidden text-lg font-bold font-heading text-[#1F2937]">
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
                              type="button"
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

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A]">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-medium text-[#1F2937]">{nombre}</span>
              {tipoUsuario && (
                <span className="text-[10px] text-[#6B7280]">
                  {TIPO_USUARIO_LABEL[tipoUsuario] ?? tipoUsuario}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Cerrar Sesión</span>
          </button>

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
