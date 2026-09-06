"use client"
import { useTituloPagina } from "@/components/titulo-pagina"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { DashboardNavbar, type RolNavbar } from "@/components/dashboard-navbar"
import { ManualEstudiante } from "@/components/ayuda/manual-estudiante"
import { ManualProfesional } from "@/components/ayuda/manual-profesional"
import { getAccessToken, getRoleFromToken } from "@/lib/auth"

// El rol del token usa guion bajo; `DashboardNavbar` espera la clave con
// guion, y el capellán se muestra como "Psicología Positiva".
const PROFESIONALES: Record<string, { dimension: string; navKey: RolNavbar; panel: string }> = {
  capellan: {
    dimension: "Psicología Positiva",
    navKey: "capellan",
    panel: "/dashboard/capellan",
  },
  actividad_fisica: {
    dimension: "Actividad Física",
    navKey: "actividad-fisica",
    panel: "/dashboard/actividad-fisica",
  },
  responsabilidad_salud: {
    dimension: "Responsabilidad en Salud",
    navKey: "responsabilidad-salud",
    panel: "/dashboard/responsabilidad-salud",
  },
  relaciones_interpersonales: {
    dimension: "Relaciones Interpersonales",
    navKey: "relaciones-interpersonales",
    panel: "/dashboard/relaciones-interpersonales",
  },
  manejo_estres: {
    dimension: "Manejo del Estrés",
    navKey: "manejo-estres",
    panel: "/dashboard/manejo-estres",
  },
  nutricion: {
    dimension: "Nutrición",
    navKey: "nutricion",
    panel: "/dashboard/nutricion",
  },
}

export default function AyudaPage() {
  useTituloPagina("Ayuda")
  const [rol, setRol] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    setRol(token ? getRoleFromToken(token) : null)
    setListo(true)
  }, [])

  const profesional = rol ? PROFESIONALES[rol] : undefined
  const esEstudiante = rol === "student"
  const navKey: RolNavbar = esEstudiante ? "user" : (profesional?.navKey ?? "admin")

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role={navKey} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">
        {!listo ? (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />
            Cargando la guía...
          </div>
        ) : esEstudiante ? (
          <ManualEstudiante />
        ) : (
          <ManualProfesional
            dimension={profesional?.dimension ?? null}
            panel={profesional?.panel ?? "/dashboard/admin"}
            esAdmin={!profesional}
          />
        )}
      </main>
    </div>
  )
}
