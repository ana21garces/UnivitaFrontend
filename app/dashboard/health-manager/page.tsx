"use client"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { LevelBadge } from "@/components/level-badge"
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Brain,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react"

const riskLevels = [
  { label: "Low Risk", count: 52, color: "#22C55E", icon: ShieldCheck },
  { label: "Medium Risk", count: 28, color: "#FACC15", icon: AlertTriangle },
  { label: "High Risk", count: 7, color: "#EF4444", icon: ShieldAlert },
]

const surveyPreviews = [
  { user: "Maria G.", score: 38, max: 40, risk: "Low" },
  { user: "Carlos R.", score: 24, max: 40, risk: "Medium" },
  { user: "Ana L.", score: 15, max: 40, risk: "High" },
  { user: "Pedro M.", score: 33, max: 40, risk: "Low" },
]

const aiRecommendations = [
  {
    title: "Increase hydration reminders",
    description: "28% of users scored low on Water intake. Consider campus-wide hydration campaigns.",
    priority: "High",
  },
  {
    title: "Sleep hygiene workshops",
    description: "Rest scores are below average for 35% of surveyed students.",
    priority: "Medium",
  },
  {
    title: "Outdoor activity programs",
    description: "Fresh Air and Sunlight remedies show the lowest average scores.",
    priority: "High",
  },
]

export default function HealthManagerDashboard() {
  return (
    <>
      <DashboardNavbar role="health-manager" userName="Health Mgr" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Health Manager Dashboard
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Monitor student wellness and AI-powered recommendations
            </p>
          </div>
          <LevelBadge level={1} size="sm" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#22C55E]/10">
              <Users className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">87</p>
              <p className="text-xs text-[#6B7280]">Students Surveyed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#22C55E]/10">
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">60%</p>
              <p className="text-xs text-[#6B7280]">Low Risk</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FACC15]/10">
              <AlertTriangle className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">32%</p>
              <p className="text-xs text-[#6B7280]">Medium Risk</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EF4444]/10">
              <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">8%</p>
              <p className="text-xs text-[#6B7280]">High Risk</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Risk Level Overview */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#16A34A]" />
              Risk Level Overview
            </h3>
            <div className="flex flex-col gap-4">
              {riskLevels.map((item) => {
                const Icon = item.icon
                const total = riskLevels.reduce((sum, r) => sum + r.count, 0)
                const pct = Math.round((item.count / total) * 100)
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#1F2937]">{item.label}</span>
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

          {/* Survey Results Preview */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#2563EB]" />
              Survey Results Preview
            </h3>
            <div className="flex flex-col gap-3">
              {surveyPreviews.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-xs font-bold text-[#2563EB]">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{item.user}</p>
                      <p className="text-xs text-[#6B7280]">
                        Score: {item.score}/{item.max}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.risk === "Low"
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : item.risk === "Medium"
                        ? "bg-[#FACC15]/10 text-[#B45309]"
                        : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Recommendation Panel */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#16A34A]" />
              AI Recommendations
            </h3>
            <div className="flex flex-col gap-3">
              {aiRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#16A34A]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[#1F2937]">{rec.title}</p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.priority === "High"
                          ? "bg-[#EF4444]/10 text-[#EF4444]"
                          : "bg-[#FACC15]/10 text-[#B45309]"
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#16A34A]/5 border border-[#16A34A]/20">
              <p className="text-xs text-[#6B7280] text-center">
                AI-powered insights will be generated based on survey data.
                <br />
                <span className="font-medium text-[#16A34A]">Placeholder for future integration</span>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
