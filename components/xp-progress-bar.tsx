"use client"

interface XpProgressBarProps {
  currentXp: number
  maxXp: number
  level: number
}

export function XpProgressBar({ currentXp, maxXp, level }: XpProgressBarProps) {
  const percentage = Math.min((currentXp / maxXp) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-full text-[#FFFFFF] text-xs font-bold font-heading"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          {level}
        </div>
        <span className="text-xs font-medium text-[#6B7280]">Nivel {level}</span>
      </div>
      <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #22C55E, #6D28D9)",
            boxShadow: percentage > 0 ? "0 0 8px rgba(109, 40, 217, 0.3)" : "none",
          }}
        />
      </div>
      <span className="text-xs font-medium text-[#6B7280]">
        {currentXp}/{maxXp} XP
      </span>
    </div>
  )
}
