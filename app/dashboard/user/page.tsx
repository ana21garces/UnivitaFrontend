"use client"

import Link from "next/link"
import {
  ClipboardList,
  Droplets,
  Sun,
  Dumbbell,
  Salad,
  Wind,
  Heart,
  Brain,
  Moon,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { LevelBadge } from "@/components/level-badge"

const remedies = [
  { name: "Water", icon: Droplets, completed: false },
  { name: "Sunlight", icon: Sun, completed: false },
  { name: "Exercise", icon: Dumbbell, completed: false },
  { name: "Nutrition", icon: Salad, completed: false },
  { name: "Fresh Air", icon: Wind, completed: false },
  { name: "Temperance", icon: Heart, completed: false },
  { name: "Rest", icon: Moon, completed: false },
  { name: "Trust", icon: Brain, completed: false },
]

const activities = [
  { title: "Drink 8 glasses of water", category: "Water", xp: 10 },
  { title: "Take a 30-min walk outside", category: "Exercise", xp: 20 },
  { title: "Sleep 7+ hours tonight", category: "Rest", xp: 15 },
]

export default function UserDashboard() {
  return (
    <>
      <DashboardNavbar role="user" userName="Student" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Welcome back!
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Track your healthy lifestyle progress with the 8 Remedies
            </p>
          </div>
          <LevelBadge level={1} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#22C55E]/10">
              <Zap className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">35</p>
              <p className="text-xs text-[#6B7280]">XP Earned</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2563EB]/10">
              <ClipboardList className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">0/8</p>
              <p className="text-xs text-[#6B7280]">Remedies Done</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7C3AED]/10">
              <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">0</p>
              <p className="text-xs text-[#6B7280]">Activities</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FACC15]/10">
              <TrendingUp className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">0</p>
              <p className="text-xs text-[#6B7280]">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Main CTA: Start Survey */}
        <Link
          href="/dashboard/user/survey"
          className="flex items-center justify-between p-5 mb-8 rounded-xl text-[#FFFFFF] shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)", boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.25)" }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFFFFF]/20">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-heading">Start 8 Remedies Survey</p>
              <p className="text-sm text-[#FFFFFF]/80">
                Evaluate your lifestyle across all 8 health dimensions
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-[#FFFFFF]/80" />
        </Link>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 8 Remedies Progress */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4">
              8 Remedies Progress
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {remedies.map((remedy) => {
                const Icon = remedy.icon
                return (
                  <div
                    key={remedy.name}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                      remedy.completed
                        ? "border-[#22C55E] bg-[#F0FDF4]"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        remedy.completed
                          ? "bg-[#22C55E] text-[#FFFFFF]"
                          : "bg-[#E2E8F0] text-[#6B7280]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-[#1F2937] text-center">
                      {remedy.name}
                    </span>
                    <div
                      className={`w-full h-1.5 rounded-full ${
                        remedy.completed ? "bg-[#22C55E]" : "bg-[#E2E8F0]"
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Recommended Activities */}
          <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4">
              Recommended Activities
            </h3>
            <div className="flex flex-col gap-3">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#16A34A]/40 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1F2937]">{activity.title}</p>
                    <p className="text-xs text-[#6B7280]">{activity.category}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                    <Zap className="w-3 h-3" />
                    +{activity.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
