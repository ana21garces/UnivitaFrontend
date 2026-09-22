"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList } from "lucide-react"
import { api } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"

// Ventana obligatoria: mientras la campaña de usabilidad esté abierta y la
// persona no haya respondido, no puede usar el dashboard hasta responder. El
// backend deja fuera al admin para que nunca quede bloqueado.
export function UsabilidadGate() {
  const router = useRouter()
  const pathname = usePathname()
  const [requerida, setRequerida] = useState(false)

  useEffect(() => {
    if (!getAccessToken() || pathname?.startsWith("/dashboard/usabilidad")) {
      setRequerida(false)
      return
    }
    api
      .get("/usabilidad/estado")
      .then(({ data }) => setRequerida(!!data.requerida))
      .catch(() => setRequerida(false))
  }, [pathname])

  if (!requerida || pathname?.startsWith("/dashboard/usabilidad")) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-[#F0FDF4]">
          <ClipboardList className="w-7 h-7 text-[#16A34A]" />
        </div>
        <h2 className="mt-4 text-lg font-bold font-heading text-[#1F2937]">
          Ayúdanos a mejorar UnacHealth
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Para continuar, responde una encuesta corta sobre tu experiencia con la plataforma. Toma menos de 5 minutos y es anónima en los resultados.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/usabilidad")}
          className="mt-6 w-full h-11 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          Responder ahora
        </button>
      </div>
    </div>
  )
}
