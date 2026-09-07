"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Medal } from "lucide-react"
import { api } from "@/lib/api"
import type { InsigniasResponse } from "@/lib/insignias"

/** Pastilla compacta "N / 12 insignias" para el dashboard. Enlaza a Mi perfil. */
export function InsigniasContador() {
  const [data, setData] = useState<InsigniasResponse | null>(null)

  useEffect(() => {
    let vivo = true
    api
      .get<InsigniasResponse>("/gamificacion/insignias")
      .then((res) => vivo && setData(res.data))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  if (!data) return null

  return (
    <Link
      href="/dashboard/perfil"
      className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-[#7C3AED] bg-[#F5F3FF] border border-[#DDD6FE] hover:bg-[#EDE9FE] transition-colors shrink-0"
    >
      <Medal className="w-4 h-4" />
      {data.ganadas} / {data.total} insignias
    </Link>
  )
}
