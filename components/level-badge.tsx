import { Award } from "lucide-react"

interface LevelBadgeProps {
  level: number
  title?: string
  size?: "sm" | "md"
}

const levelTitles: Record<number, string> = {
  1: "Beginner",
  2: "Explorer",
  3: "Apprentice",
  4: "Practitioner",
  5: "Champion",
}

export function LevelBadge({ level, title, size = "md" }: LevelBadgeProps) {
  const displayTitle = title || levelTitles[level] || "Beginner"

  if (size === "sm") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 shadow-sm">
        <Award className="w-3.5 h-3.5 text-[#16A34A]" />
        <span className="text-xs font-bold text-[#16A34A]">
          Level {level}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#16A34A]/8 border border-[#16A34A]/15 shadow-sm">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm"
        style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
      >
        <Award className="w-5 h-5 text-[#FFFFFF]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#1F2937]">
          Level {level} &ndash; {displayTitle}
        </p>
        <p className="text-xs text-[#6B7280]">Keep completing activities to level up</p>
      </div>
    </div>
  )
}
