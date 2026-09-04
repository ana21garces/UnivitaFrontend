"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  LayoutGrid,
  BarChart3,
  ShieldCheck,
  Bell,
  FileText,
  Settings,
  HelpCircle,
  X,
} from "lucide-react"
import { UniVitaLogo } from "@/components/univita-logo"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  { label: "Gestión de usuarios", href: "/dashboard/admin/user-management", icon: <Users className="w-[18px] h-[18px]" /> },
  { label: "Perfiles de salud", href: "/dashboard/admin/perfiles-de-salud", icon: <HeartPulse className="w-[18px] h-[18px]" /> },
  { label: "Áreas de bienestar", href: "/dashboard/admin/areas-de-bienestar", icon: <LayoutGrid className="w-[18px] h-[18px]" /> },
  { label: "Seguimiento / Estadísticas", href: "/dashboard/admin/seguimiento", icon: <BarChart3 className="w-[18px] h-[18px]" /> },
  { label: "Auditoría", href: "/dashboard/admin/auditoria", icon: <ShieldCheck className="w-[18px] h-[18px]" /> },
  { label: "Notificaciones", href: "/dashboard/admin/notificaciones", icon: <Bell className="w-[18px] h-[18px]" /> },
  { label: "Reportes", href: "/dashboard/admin/reportes", icon: <FileText className="w-[18px] h-[18px]" /> },
  { label: "Configuración", href: "/dashboard/admin/configuracion", icon: <Settings className="w-[18px] h-[18px]" /> },
  { label: "Ayuda", href: "/dashboard/admin/ayuda", icon: <HelpCircle className="w-[18px] h-[18px]" /> },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegación de administración">
      {NAV.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
  )
}

function Header() {
  return (
    <div
      className="flex items-center gap-2 px-5 h-16 border-b border-[#DCFCE7] shrink-0"
      style={{ background: "linear-gradient(90deg, #EAF3DE 0%, #F0FDF4 22%, #FFFFFF 58%)", backgroundAttachment: "fixed" }}
    >
      <UniVitaLogo size="nav" />
      <p className="text-lg font-bold font-heading text-[#14532D]">UnacHealth</p>
    </div>
  )
}

function Footer() {
  return (
    <div className="p-3 shrink-0">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#EAF3DE] text-[#16A34A] shrink-0">
          <HeartPulse className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-[#1F2937]">UnacHealth</p>
          <p className="text-[10px] text-[#94A3B8]">© 2026 Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Sidebar fijo en escritorio */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-gradient-to-b from-[#EAF3DE] via-[#F0FDF4] to-[#FFFFFF] border-r border-[#E7E5E4] z-30">
        <Header />
        <NavList />
        <Footer />
      </aside>

      {/* Drawer en móvil */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#1F2937]/50" onClick={onClose} />
          <aside className="relative flex flex-col w-64 max-w-[80%] bg-gradient-to-b from-[#EAF3DE] via-[#F0FDF4] to-[#FFFFFF] border-r border-[#E7E5E4]">
            <button
              onClick={onClose}
              className="absolute top-4 right-3 p-1 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
            <Header />
            <NavList onNavigate={onClose} />
            <Footer />
          </aside>
        </div>
      )}
    </>
  )
}
