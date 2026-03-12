"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Brain,
  Droplets,
  Sun,
  Dumbbell,
  Salad,
  Wind,
  Heart,
  Moon,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Activity,
} from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

const remedyKeys = [
  { key: "water", name: "Water", icon: Droplets },
  { key: "sunlight", name: "Sunlight", icon: Sun },
  { key: "exercise", name: "Exercise", icon: Dumbbell },
  { key: "nutrition", name: "Nutrition", icon: Salad },
  { key: "fresh-air", name: "Fresh Air", icon: Wind },
  { key: "temperance", name: "Temperance", icon: Heart },
  { key: "rest", name: "Rest", icon: Moon },
  { key: "trust", name: "Trust", icon: Brain },
]

function classifyScore(score: number): { label: string; color: string; bg: string } {
  if (score >= 4) return { label: "High", color: "#22C55E", bg: "bg-[#22C55E]/10" }
  if (score >= 3) return { label: "Medium", color: "#FACC15", bg: "bg-[#FACC15]/10" }
  return { label: "Low", color: "#EF4444", bg: "bg-[#EF4444]/10" }
}

function getOverallClassification(avg: number): { label: string; description: string; color: string } {
  if (avg >= 4) return { label: "Excellent Wellness", description: "You have strong healthy habits across most dimensions. Keep it up!", color: "#22C55E" }
  if (avg >= 3) return { label: "Good Progress", description: "You are on the right track. Focus on improving your weaker areas for a balanced lifestyle.", color: "#2563EB" }
  return { label: "Needs Attention", description: "Several wellness areas need improvement. Start with small daily changes in your lowest-scoring remedies.", color: "#EF4444" }
}

function getRecommendation(lowestRemedy: string): string {
  const recommendations: Record<string, string> = {
    water: "Try carrying a reusable water bottle and setting hourly hydration reminders. Aim for at least 8 glasses per day.",
    sunlight: "Spend 15-20 minutes outside in natural sunlight each morning. Consider study sessions outdoors when possible.",
    exercise: "Start with 30 minutes of moderate activity like walking or cycling 3-4 times per week. Gradually increase intensity.",
    nutrition: "Incorporate more fruits, vegetables, and whole grains into your meals. Plan weekly meal prep sessions.",
    "fresh-air": "Take short outdoor breaks between study sessions. Open windows to improve indoor air circulation.",
    temperance: "Practice mindful eating and moderate screen time. Establish a consistent daily routine with balanced activities.",
    rest: "Maintain a regular sleep schedule of 7-9 hours. Avoid screens 1 hour before bedtime for better sleep quality.",
    trust: "Engage in activities that bring you peace and purpose. Consider journaling, meditation, or community involvement.",
  }
  return recommendations[lowestRemedy] || "Focus on developing consistent healthy habits in all 8 remedy areas."
}

function ResultsContent() {
  const searchParams = useSearchParams()

  const data = remedyKeys.map((r) => {
    const val = Number(searchParams.get(r.key)) || 3
    return { ...r, value: val, fullMark: 5 }
  })

  const totalScore = data.reduce((sum, d) => sum + d.value, 0)
  const avgScore = totalScore / data.length
  const classification = getOverallClassification(avgScore)
  const lowestRemedy = data.reduce((min, d) => (d.value < min.value ? d : min), data[0])

  return (
    <>
      <DashboardNavbar role="user" userName="Student" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link
          href="/dashboard/user"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Your 8 Remedies Results
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Personalized assessment of your healthy lifestyle dimensions
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              backgroundColor: `${classification.color}10`,
              borderColor: `${classification.color}30`,
            }}
          >
            <Activity className="w-4 h-4" style={{ color: classification.color }} />
            <span className="text-sm font-bold" style={{ color: classification.color }}>
              {classification.label}
            </span>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2563EB]" />
            Wellness Radar
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  tickCount={6}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#22C55E"
                  fill="#22C55E"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {data.map((remedy) => {
            const cls = classifyScore(remedy.value)
            const Icon = remedy.icon
            return (
              <div
                key={remedy.key}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: `${cls.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: cls.color }} />
                </div>
                <span className="text-xs font-medium text-[#6B7280]">{remedy.name}</span>
                <span className="text-2xl font-bold text-[#1F2937]">{remedy.value}/5</span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: `${cls.color}15`, color: cls.color }}
                >
                  {cls.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Overall classification */}
        <div
          className="rounded-xl p-6 mb-6 border"
          style={{ backgroundColor: `${classification.color}08`, borderColor: `${classification.color}20` }}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: `${classification.color}15` }}>
              <Activity className="w-6 h-6" style={{ color: classification.color }} />
            </div>
            <div>
              <p className="text-lg font-bold font-heading text-[#1F2937]">{classification.label}</p>
              <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{classification.description}</p>
              <p className="mt-2 text-sm text-[#1F2937]">
                <span className="font-semibold">Average Score:</span> {avgScore.toFixed(1)}/5.0 &bull; <span className="font-semibold">Total:</span> {totalScore}/40
              </p>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="rounded-xl bg-[#FFFFFF] border border-[#16A34A]/20 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#16A34A]" />
            AI-Powered Recommendation
          </h3>
          <div className="p-4 rounded-xl bg-[#16A34A]/5 border border-[#16A34A]/10">
            <p className="text-sm font-semibold text-[#16A34A] mb-1">
              Focus Area: {lowestRemedy.name}
            </p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {getRecommendation(lowestRemedy.key)}
            </p>
          </div>
          <p className="mt-3 text-xs text-[#6B7280] text-center">
            Personalized AI recommendations will be enhanced with generative AI in future updates.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/user"
            className="flex-1 flex items-center justify-center h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            View Recommended Activities
          </Link>
          <Link
            href="/dashboard/user/survey"
            className="flex-1 flex items-center justify-center h-11 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors"
          >
            Retake Survey
          </Link>
        </div>
      </main>
    </>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-sm text-[#6B7280]">Loading results...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
