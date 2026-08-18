"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import {
  Users,
  ClipboardList,
  TrendingUp,
  UserX,
} from "lucide-react"

type Resumen = {
  total_usuarios: number
  completaron_encuesta: number
  sin_completar: number
  tasa_participacion: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [resumen, setResumen] = useState<Resumen | null>(null)

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/"); return }
    api
      .get("/encuesta/admin/resumen")
      .then((res) => setResumen(res.data))
      .catch((err) => redirigirPorError(err, router))
  }, [router])

  const stats = [
    {
      icon: <Users className="w-5 h-5 text-[#22C55E]" />,
      bg: "bg-[#22C55E]/10",
      value: resumen ? resumen.total_usuarios : "—",
      label: "Total usuarios",
    },
    {
      icon: <ClipboardList className="w-5 h-5 text-[#2563EB]" />,
      bg: "bg-[#2563EB]/10",
      value: resumen ? resumen.completaron_encuesta : "—",
      label: "Completaron encuesta",
    },
    {
      icon: <UserX className="w-5 h-5 text-[#F59E0B]" />,
      bg: "bg-[#F59E0B]/10",
      value: resumen ? resumen.sin_completar : "—",
      label: "Sin completar",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#7C3AED]" />,
      bg: "bg-[#7C3AED]/10",
      value: resumen ? `${resumen.tasa_participacion}%` : "—",
      label: "Tasa de participación",
    },
  ]

  return (
    <>
      <DashboardNavbar role="admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Panel de administraci&oacute;n
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Resumen general de la plataforma UnacHealth
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1F2937]">{stat.value}</p>
                <p className="text-xs text-[#6B7280]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#6B7280]">
          La tasa de participaci&oacute;n se calcula solo sobre la poblaci&oacute;n encuestable:
          el resumen excluye las cuentas profesionales y de administraci&oacute;n.
        </p>
      </main>
    </>
  )
}
