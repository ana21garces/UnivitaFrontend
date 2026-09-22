"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ClipboardCheck, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"
import { getAccessToken, getRoleFromToken } from "@/lib/auth"

// Cada área de bienestar y el rol con el que el admin la responde. El capellán
// se muestra como "Psicología positiva".
const AREAS: Record<string, { rol: string; label: string }> = {
  "/dashboard/capellan": { rol: "capellan", label: "Psicología positiva" },
  "/dashboard/actividad-fisica": { rol: "actividad_fisica", label: "Actividad física" },
  "/dashboard/responsabilidad-salud": { rol: "responsabilidad_salud", label: "Responsabilidad en salud" },
  "/dashboard/relaciones-interpersonales": { rol: "relaciones_interpersonales", label: "Relaciones interpersonales" },
  "/dashboard/manejo-estres": { rol: "manejo_estres", label: "Manejo del estrés" },
  "/dashboard/nutricion": { rol: "nutricion", label: "Nutrición" },
}

export function UsabilidadAreaPrompt() {
  const pathname = usePathname()
  const [mostrar, setMostrar] = useState(false)
  const area = pathname ? AREAS[pathname] : undefined

  useEffect(() => {
    setMostrar(false)
    const token = getAccessToken()
    if (!token || !area || getRoleFromToken(token) !== "admin") return
    api
      .get(`/usabilidad/estado?rol=${area.rol}`)
      .then(({ data }) => {
        if (data.abierta && !data.respondida) setMostrar(true)
      })
      .catch(() => {})
  }, [pathname, area])

  if (!mostrar || !area) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm">
      <div className="rounded-2xl bg-white border border-[#16A34A]/30 shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#16A34A] shrink-0">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#1F2937]">Encuesta de usabilidad · {area.label}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Respóndela como {area.label}. Se guardará con ese perfil, no como administrador.
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/usabilidad?rol=${area.rol}`}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          Responder <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
