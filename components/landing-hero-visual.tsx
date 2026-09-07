// AI assisted development
import Image from "next/image"
import { Activity, Droplets, Heart, Leaf } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""

function FloatingLeaf({
  className,
  delay = "0s",
  duration = "6s",
}: {
  className: string
  delay?: string
  duration?: string
}) {
  return (
    <Leaf
      className={`pointer-events-none absolute text-[#22C55E] drop-shadow-sm ${className}`}
      style={{ animation: `hero-drift ${duration} ease-in-out infinite`, animationDelay: delay }}
      aria-hidden="true"
    />
  )
}

export function LandingHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:pt-2">
      <div className="relative rounded-3xl border border-white/60 bg-white/70 p-4 shadow-2xl shadow-[#16A34A]/10 backdrop-blur-md sm:p-6">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#DCFCE7] to-[#EDE9FE]">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_50%)]"
            aria-hidden="true"
          />

          <Image
            src={`${BASE}/images/hero-ejercicio.jpg`}
            alt="Persona corriendo con hábitos saludables y actividad física"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-2"
            priority
          />

          <FloatingLeaf className="left-[8%] top-[28%] h-5 w-5 -rotate-20 opacity-85" duration="5s" />
          <FloatingLeaf className="right-[6%] bottom-[30%] h-6 w-6 rotate-[30deg] opacity-75" delay="0.8s" duration="6.5s" />
          <FloatingLeaf className="left-[30%] bottom-[8%] h-4 w-4 rotate-6 opacity-70" delay="1.4s" duration="7s" />

          <div
            className="pointer-events-none absolute right-[8%] top-[8%] flex items-center gap-1 rounded-2xl border border-[#BBF7D0] bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm"
            style={{ animation: "hero-pulse 2.4s ease-in-out infinite" }}
            aria-hidden="true"
          >
            <Heart className="h-5 w-5 fill-[#16A34A] text-[#16A34A]" />
            <Activity className="h-4 w-4 text-[#22C55E]" />
          </div>

          <div
            className="pointer-events-none absolute left-[6%] top-[38%] flex h-10 w-10 items-center justify-center rounded-full border border-[#99F6E4]/80 bg-white/90 shadow-md backdrop-blur-sm"
            style={{ animation: "float 4s ease-in-out infinite 0.5s" }}
            aria-hidden="true"
          >
            <Droplets className="h-5 w-5 text-[#14B8A6]" />
          </div>

          <span
            className="pointer-events-none absolute right-[22%] top-[42%] h-8 w-1 rounded-full bg-[#FACC15]/80"
            style={{ animation: "hero-swoosh 1.8s ease-in-out infinite" }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute right-[18%] top-[46%] h-6 w-1 rounded-full bg-[#FACC15]/60"
            style={{ animation: "hero-swoosh 1.8s ease-in-out infinite 0.3s" }}
            aria-hidden="true"
          />
        </div>

        <div className="absolute -left-3 top-8 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg sm:-left-6">
          <p className="text-2xl font-extrabold text-[#16A34A]">6</p>
          <p className="text-xs font-medium text-[#6B7280]">dimensiones</p>
        </div>

        <div
          className="absolute -right-2 bottom-16 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg sm:-right-4"
          style={{ animation: "float 5s ease-in-out infinite 1s" }}
        >
          <p className="text-xs font-semibold text-[#6D28D9]">🎯 Misiones</p>
          <p className="text-sm font-bold text-[#1F2937]">Gana XP</p>
        </div>
      </div>
    </div>
  )
}
