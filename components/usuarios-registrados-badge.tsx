"use client"

import { useEffect, useState } from "react"

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
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF] shadow-sm border border-[#E2E8F0]">
      <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
      <span className="text-sm font-medium text-[#1F2937]">
        {total === null
          ? "…"
          : `${total.toLocaleString("es-CO")} ${
              total === 1 ? "usuario registrado" : "usuarios registrados"
            }`}
      </span>
    </div>
  )
}
