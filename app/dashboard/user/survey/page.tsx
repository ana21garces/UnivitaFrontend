"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Droplets,
  Sun,
  Dumbbell,
  Salad,
  Wind,
  Heart,
  Moon,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
  Award,
  Leaf,
} from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

interface RemedyStep {
  id: number
  name: string
  icon: React.ComponentType<{ className?: string }>
  question: string
  description: string
}

const remedySteps: RemedyStep[] = [
  {
    id: 1,
    name: "Agua",
    icon: Droplets,
    question: "How would you rate your daily water intake?",
    description: "Adequate hydration is essential for physical and mental health. Aim for at least 8 glasses per day.",
  },
  {
    id: 2,
    name: "Sunlight",
    icon: Sun,
    question: "How often do you get adequate sunlight exposure?",
    description: "Sunlight helps regulate mood, vitamin D production, and circadian rhythms.",
  },
  {
    id: 3,
    name: "Exercise",
    icon: Dumbbell,
    question: "How regularly do you engage in physical exercise?",
    description: "Regular exercise improves cardiovascular health, mental wellness, and energy levels.",
  },
  {
    id: 4,
    name: "Nutrition",
    icon: Salad,
    question: "How balanced and nutritious is your daily diet?",
    description: "A diet rich in fruits, vegetables, whole grains, and legumes supports overall wellbeing.",
  },
  {
    id: 5,
    name: "Fresh Air",
    icon: Wind,
    question: "How often do you spend time in fresh outdoor air?",
    description: "Fresh air oxygenates the blood and helps clear the mind for better focus.",
  },
  {
    id: 6,
    name: "Temperance",
    icon: Heart,
    question: "How well do you practice moderation in your habits?",
    description: "Temperance means using good things wisely and avoiding harmful substances entirely.",
  },
  {
    id: 7,
    name: "Rest",
    icon: Moon,
    question: "How would you rate your sleep quality and rest habits?",
    description: "Quality sleep of 7-9 hours is vital for restoration, memory, and immune function.",
  },
  {
    id: 8,
    name: "Trust",
    icon: Brain,
    question: "How strong is your sense of purpose and trust in life?",
    description: "Spiritual wellbeing and trust contribute to resilience, hope, and emotional stability.",
  },
]

const likertOptions = [
  { value: 1, label: "Very Poor" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
]

export default function SurveyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const step = remedySteps[currentStep]
  const totalSteps = remedySteps.length
  const progressPct = ((currentStep + 1) / totalSteps) * 100

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const canGoNext = answers[step?.id] !== undefined
  const isLastStep = currentStep === totalSteps - 1
  const allAnswered = Object.keys(answers).length === totalSteps

  // Confirmation Screen
  if (submitted) {
    return (
      <>
        <DashboardNavbar role="user" userName="Estudiante" />
        <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Success icon */}
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#22C55E]/10">
                <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
              </div>
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-[#FACC15] shadow-md">
                <Award className="w-4 h-4 text-[#FFFFFF]" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
                Survey Completed!
              </h2>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                You have successfully completed the 8 Remedies Survey. Your personalized results are ready.
              </p>
            </div>

            {/* XP Reward */}
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[#22C55E]/5 border border-[#22C55E]/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#22C55E]/20">
                <Zap className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#22C55E]">+50 XP Earned!</p>
                <p className="text-xs text-[#6B7280]">Survey completion reward</p>
              </div>
            </div>

            {/* Badge Unlocked placeholder */}
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[#FACC15]/5 border border-[#FACC15]/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FACC15]/20">
                <Award className="w-5 h-5 text-[#FACC15]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#1F2937]">Badge Unlocked: First Survey</p>
                <p className="text-xs text-[#6B7280]">You completed your first wellness assessment</p>
              </div>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams()
                remedySteps.forEach((s) => {
                  params.set(s.name.toLowerCase().replace(/\s+/g, "-"), String(answers[s.id] || 3))
                })
                router.push(`/dashboard/user/results?${params.toString()}`)
              }}
              className="w-full max-w-xs h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              View My Results
            </button>

            <button
              onClick={() => router.push("/dashboard/user")}
              className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </>
    )
  }

  const StepIcon = step.icon

  return (
    <>
      <DashboardNavbar role="user" userName="Estudiante" />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-bold text-[#16A34A]">
              {Math.round(progressPct)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #22C55E, #6D28D9)",
              }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between">
            {remedySteps.map((s, i) => {
              const Icon = s.icon
              const isCompleted = answers[s.id] !== undefined
              const isCurrent = i === currentStep
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (isCompleted || i <= currentStep) setCurrentStep(i)
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#16A34A] text-[#FFFFFF] shadow-md shadow-[#16A34A]/20"
                      : isCompleted
                      ? "bg-[#16A34A]/20 text-[#16A34A]"
                      : "bg-[#E2E8F0] text-[#6B7280]"
                  }`}
                  aria-label={`Step ${i + 1}: ${s.name}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#16A34A]/10">
              <StepIcon className="w-7 h-7 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide">
                Remedy {step.id}: {step.name}
              </p>
              <h3 className="text-xl font-bold font-heading text-[#1F2937] mt-1">
                {step.question}
              </h3>
            </div>
          </div>

          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Likert Scale */}
          <div className="flex flex-col gap-3">
            {likertOptions.map((option) => {
              const isSelected = answers[step.id] === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? "border-[#16A34A] bg-[#F0FDF4] shadow-sm"
                      : "border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#16A34A]/40"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-colors ${
                      isSelected
                        ? "bg-[#16A34A] text-[#FFFFFF]"
                        : "bg-[#F1F5F9] text-[#6B7280]"
                    }`}
                  >
                    {option.value}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isSelected ? "text-[#16A34A]" : "text-[#1F2937]"
                    }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] ml-auto" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              <Leaf className="w-4 h-4" />
              Submit Survey
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </>
  )
}
