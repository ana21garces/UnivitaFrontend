"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { LevelBadge } from "@/components/level-badge"
import {
  Users,
  Shield,
  HeartPulse,
  ClipboardList,
  TrendingUp,
  BarChart3,
  UserX,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Resumen = {
  total_usuarios: number
  completaron_encuesta: number
  sin_completar: number
  tasa_participacion: number
}

const roleDistribution = [
  { role: "Users (Clients)", count: 184, icon: Users, color: "#22C55E" },
  { role: "Administrators", count: 8, icon: Shield, color: "#2563EB" },
  { role: "Health Managers", count: 12, icon: HeartPulse, color: "#7C3AED" },
]

const recentActivity = [
  { user: "Maria G.", action: "Completed survey", time: "2 min ago" },
  { user: "Carlos R.", action: "Registered as User", time: "15 min ago" },
  { user: "Ana L.", action: "Completed survey", time: "1 hr ago" },
  { user: "Pedro M.", action: "Reached Level 2", time: "2 hrs ago" },
  { user: "Sofia T.", action: "Registered as User", time: "3 hrs ago" },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [resumen, setResumen] = useState<Resumen | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) { router.replace("/"); return }
    axios
      .get(`${API_URL}/encuesta/admin/resumen`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      })
      .then((res) => setResumen(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          router.replace("/")
        }
      })
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
      <DashboardNavbar role="admin" userName="Admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Admin Dashboard
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Resumen general de la plataforma UnacHealth
            </p>
          </div>
          <LevelBadge level={1} size="sm" />
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role Distribution */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2563EB]" />
              Role Distribution
            </h3>
            <div className="flex flex-col gap-4">
              {roleDistribution.map((item) => {
                const Icon = item.icon
                const total = roleDistribution.reduce((sum, r) => sum + r.count, 0)
                const pct = Math.round((item.count / total) * 100)
                return (
                  <div key={item.role} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#1F2937]">{item.role}</span>
                        <span className="text-sm font-bold text-[#1F2937]">{item.count}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Survey Completion Stats */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#22C55E]" />
              Recent Activity
            </h3>
            <div className="flex flex-col gap-3">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#16A34A]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-xs font-bold text-[#16A34A]">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{item.user}</p>
                      <p className="text-xs text-[#6B7280]">{item.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#6B7280]">{item.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
