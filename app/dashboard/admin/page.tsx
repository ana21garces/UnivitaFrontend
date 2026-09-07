"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken, LOGIN_PATH } from "@/lib/auth"
import {
  Users,
  ClipboardList,
  UserX,
  TrendingUp,
  UserPlus,
  FileText,
  ArrowRight,
} from "lucide-react"

type Resumen = {
  total_usuarios: number
  completaron_encuesta: number
  sin_completar: number
  tasa_participacion: number
}

type ApiUser = { role: string; tipo_usuario: string | null }

export default function AdminDashboard() {  const router = useRouter()
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [usuarios, setUsuarios] = useState<ApiUser[]>([])

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(LOGIN_PATH)
      return
    }
    api
      .get("/encuesta/admin/resumen")
      .then((res) => setResumen(res.data))
      .catch((err) => redirigirPorError(err, router))
    api
      .get("/users")
      .then((res) => setUsuarios(res.data))
      .catch(() => {})
  }, [router])

  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      box: "bg-[#EAF3DE] text-[#16A34A]",
      value: resumen ? resumen.total_usuarios : "—",
      label: "Total usuarios",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      box: "bg-[#EFF6FF] text-[#2563EB]",
      value: resumen ? resumen.completaron_encuesta : "—",
      label: "Completaron encuesta",
    },
    {
      icon: <UserX className="w-5 h-5" />,
      box: "bg-[#FEF3E2] text-[#D97706]",
      value: resumen ? resumen.sin_completar : "—",
      label: "Sin completar",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      box: "bg-[#F3E8FF] text-[#7C3AED]",
      value: resumen ? `${resumen.tasa_participacion}%` : "—",
      label: "Tasa de participación",
    },
  ]

  // Distribución por tipo de usuario (lo que marcaron en la encuesta).
  const estudiantes = usuarios.filter((u) => u.tipo_usuario === "estudiante").length
  const docentes = usuarios.filter((u) => u.tipo_usuario === "docente").length
  const administrativos = usuarios.filter((u) => u.tipo_usuario === "administrativo").length
  const totalTipos = estudiantes + docentes + administrativos
  const pct = (n: number) => (totalTipos ? Math.round((n / totalTipos) * 100) : 0)

  const distribucion = [
    { label: "Estudiantes", value: estudiantes, color: "#16A34A" },
    { label: "Docentes", value: docentes, color: "#7C3AED" },
    { label: "Administrativos", value: administrativos, color: "#2563EB" },
  ]

  const tasa = resumen?.tasa_participacion ?? 0
  const turn = tasa / 100

  const accesos = [
    {
      href: "/dashboard/admin/user-management",
      icon: <UserPlus className="w-[18px] h-[18px]" />,
      box: "bg-[#EAF3DE] text-[#16A34A]",
      title: "Nuevo usuario",
      desc: "Crear una cuenta",
    },
    {
      href: "/dashboard/admin/user-management",
      icon: <Users className="w-[18px] h-[18px]" />,
      box: "bg-[#EFF6FF] text-[#2563EB]",
      title: "Gestión de usuarios",
      desc: "Ver y asignar roles",
    },
    {
      href: "/dashboard/admin/reportes",
      icon: <FileText className="w-[18px] h-[18px]" />,
      box: "bg-[#F3E8FF] text-[#7C3AED]",
      title: "Reportes",
      desc: "Descargar datos",
    },
  ]

  return (
    <main className="px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
          Panel de administración
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Resumen general de la plataforma UnacHealth.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${stat.box}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-[#1F2937]">{stat.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Participación + Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Participación (dona) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1F2937] mb-4">Participación en la encuesta</p>
          <div className="flex items-center gap-6">
            <div
              className="relative w-28 h-28 rounded-full shrink-0"
              style={{ background: `conic-gradient(#16A34A 0turn ${turn}turn, #E2E8F0 ${turn}turn 1turn)` }}
            >
              <div className="absolute inset-[18px] rounded-full bg-[#FFFFFF] flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#1F2937]">{tasa}%</span>
                <span className="text-[10px] text-[#6B7280]">completó</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" />
                <span className="text-sm text-[#6B7280]">Completaron</span>
                <span className="ml-auto text-sm font-semibold text-[#1F2937]">
                  {resumen ? resumen.completaron_encuesta : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#CBD5E1]" />
                <span className="text-sm text-[#6B7280]">Sin completar</span>
                <span className="ml-auto text-sm font-semibold text-[#1F2937]">
                  {resumen ? resumen.sin_completar : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por rol */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1F2937] mb-4">Distribución por tipo de usuario</p>
          <div className="flex flex-col gap-3.5">
            {distribucion.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#6B7280]">{d.label}</span>
                  <span className="font-semibold text-[#1F2937]">{d.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct(d.value)}%`, background: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="text-sm font-semibold text-[#1F2937] mb-3">Accesos rápidos</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {accesos.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm hover:border-[#16A34A]/40 hover:shadow-md transition-all"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${a.box}`}>
                {a.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1F2937]">{a.title}</p>
                <p className="text-xs text-[#6B7280]">{a.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#CBD5E1] ml-auto group-hover:text-[#16A34A] transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-[#94A3B8]">
        La tasa de participación se calcula solo sobre la población encuestable: el
        resumen excluye las cuentas profesionales y de administración.
      </p>
    </main>
  )
}
