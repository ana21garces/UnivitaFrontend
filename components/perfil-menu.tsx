"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, UserCog, LogOut } from "lucide-react"
import { api } from "@/lib/api"
import { clearSession, getAccessToken, getRoleFromToken } from "@/lib/auth"
import { ProfileAvatar } from "@/components/profile-avatar"
import type { RankTier } from "@/lib/gamificacion"

type PerfilMenuProps = {
  nombre: string
  subtitulo?: string
  rankTier?: RankTier
  avatarUrl?: string | null
  currentLevel?: number
}

// Chip de perfil con menú: "Mi perfil" (editar credenciales) y "Cerrar sesión".
export function PerfilMenu({
  nombre,
  subtitulo,
  rankTier = "bronce",
  avatarUrl,
  currentLevel,
}: PerfilMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [esUsuario, setEsUsuario] = useState(false)

  useEffect(() => {
    const t = getAccessToken()
    setEsUsuario(!!t && getRoleFromToken(t) === "student")
  }, [])

  const subtituloCompleto = [
    subtitulo,
    esUsuario && currentLevel ? `Nv. ${currentLevel}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  // Latido para la auditoría: marca que el usuario sigue activo.
  useEffect(() => {
    if (!getAccessToken()) return
    const latir = () => {
      if (getAccessToken()) api.post("/auth/heartbeat").catch(() => {})
    }
    latir()
    const id = setInterval(latir, 60000)
    return () => clearInterval(id)
  }, [])

  const cerrarSesion = async () => {
    try {
      await api.post("/auth/logout")
    } catch {}
    clearSession()
    router.replace("/")
  }

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
      >
        <ProfileAvatar
          name={nombre || "Usuario"}
          rankTier={rankTier}
          avatarUrl={avatarUrl}
          size="sm"
          plain={!esUsuario}
        />
        <div className="hidden sm:flex flex-col leading-tight text-left">
          <span className="text-sm font-medium text-[#1F2937]">{nombre || "Usuario"}</span>
          {subtituloCompleto && (
            <span className="text-[10px] text-[#6B7280]">{subtituloCompleto}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E2E8F0] bg-white shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <p className="text-sm font-semibold text-[#1F2937] truncate">{nombre || "Usuario"}</p>
            {subtituloCompleto && (
              <p className="text-xs text-[#6B7280] truncate">{subtituloCompleto}</p>
            )}
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#1F2937] hover:bg-[#F0FDF4] transition-colors"
            >
              <UserCog className="w-4 h-4 text-[#16A34A]" /> Mi perfil
            </Link>
            <button
              onClick={cerrarSesion}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
