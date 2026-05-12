"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react"
import { useState } from "react"
import { XpProgressBar } from "@/components/xp-progress-bar"
import { UniVitaLogo } from "@/components/univita-logo"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface DashboardNavbarProps {
  role: "user" | "admin" | "health-manager"
  userName?: string
  xp?: number
  maxXp?: number
  level?: number
}

const navItemsByRole: Record<string, NavItem[]> = {
  user: [
    { label: "Dashboard", href: "/dashboard/user", icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "User Management", href: "/dashboard/admin/user-management", icon: <Users className="w-4 h-4" /> },
  ],
  "health-manager": [
    { label: "Dashboard", href: "/dashboard/health-manager", icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
}

export function DashboardNavbar({ role, userName = "Estudiante", xp = 0, maxXp = 100, level = 1 }: DashboardNavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = navItemsByRole[role] || []

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <UniVitaLogo size="sm" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold font-heading text-[#1F2937] leading-tight">
              UnacHealt
            </h1>
            <p className="text-[10px] text-[#6B7280] leading-none">
              Plataforma para un estilo de vida saludable
            </p>
          </div>
          <h1 className="sm:hidden text-lg font-bold font-heading text-[#1F2937]">
            UnacHealt
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

        {/* Right: XP + User + Mobile menu */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-40">
            <XpProgressBar currentXp={xp} maxXp={maxXp} level={level} />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-[#1F2937]">
              {userName}
            </span>
          </div>

          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Cerrar Sesión</span>
          </Link>

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
          <div className="mb-3 sm:hidden">
            <XpProgressBar currentXp={xp} maxXp={maxXp} level={level} />
          </div>
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
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
