"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { getAccessToken, getRoleFromToken } from "@/lib/auth"

// Botón "Volver al panel" que aparece SOLO si quien mira es administrador.
// Se usa en las vistas de los profesionales, a las que el admin entra como
// super-visor; el profesional real (otro rol) no lo ve.
export function VolverAlPanelAdmin() {
  const [esAdmin, setEsAdmin] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (token && getRoleFromToken(token) === "admin") setEsAdmin(true)
  }, [])

  if (!esAdmin) return null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
      <Link
        href="/dashboard/admin/areas-de-bienestar"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#16A34A] hover:text-[#15803D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Áreas de bienestar
      </Link>
    </div>
  )
}
