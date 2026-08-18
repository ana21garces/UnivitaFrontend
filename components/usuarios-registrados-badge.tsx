"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function UsuariosRegistradosBadge() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let activo = true
    fetch(`${API_URL}/estadisticas/publicas`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (activo && data) setTotal(data.usuarios_registrados)
      })
      .catch(() => {})
    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EAF3DE] text-[#3B6D11] shrink-0">
        <Users className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1F2937] leading-none">
          {total === null ? "…" : total.toLocaleString("es-CO")}
        </p>
        <p className="text-sm text-[#6B7280] mt-1">
          {total === 1 ? "usuario registrado" : "usuarios registrados"}
        </p>
      </div>
    </div>
  )
}
