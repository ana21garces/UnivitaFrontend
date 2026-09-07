// AI assisted development
"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { UniVitaLogo } from "@/components/univita-logo"
import { TRANSPARENCY } from "@/lib/content/transparency"
import { LOGIN_PATH } from "@/lib/auth"

const NAV_LINKS = [
  { href: "/#que-es", label: "Qué es" },
  { href: "/#quienes-aval", label: "Quiénes avalan" },
  { href: "/metodologia", label: "Metodología" },
] as const

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
          aria-label={`${TRANSPARENCY.appName} — inicio`}
        >
          <UniVitaLogo size="xs" />
          <span className="text-lg font-bold font-heading text-[#1F2937]">
            {TRANSPARENCY.appName}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#16A34A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={LOGIN_PATH}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#16A34A] transition-colors hover:bg-[#F0FDF4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#16A34A]/20 transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            Registrarse
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1F2937] hover:bg-[#F0FDF4] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-[#E2E8F0] bg-white px-6 py-4 md:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F0FDF4]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-[#E2E8F0] pt-3">
              <Link
                href={LOGIN_PATH}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#16A34A] hover:bg-[#F0FDF4]"
                onClick={() => setMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="block rounded-lg px-3 py-2 text-center text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                onClick={() => setMenuOpen(false)}
              >
                Registrarse
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
