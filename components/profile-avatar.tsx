"use client"

import Image from "next/image"
import { Crown, Gem, Sparkles, Star } from "lucide-react"
import { avatarSrc, RANK_LABELS, type RankTier } from "@/lib/gamificacion"

interface ProfileAvatarProps {
  name: string
  rankTier?: RankTier
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg"
  showRankBadge?: boolean
  plain?: boolean
}

const SIZE = {
  sm: {
    box: "w-10 h-10",
    text: "text-sm",
    badge: "text-[8px] px-1.5 py-0.5",
    ringPad: "p-[6px]",
    aura: "-inset-1.5",
    sparkle: "w-3 h-3",
    sparklePos: "top-0 right-0",
    accent: "w-3 h-3 -top-1 left-1/2 -translate-x-1/2",
    accentIcon: "w-2 h-2",
    star: "w-2.5 h-2.5 bottom-0 right-0",
    starIcon: "w-1.5 h-1.5",
  },
  md: {
    box: "w-[4.5rem] h-[4.5rem]",
    text: "text-xl",
    badge: "text-[9px] px-2 py-0.5",
    ringPad: "p-[6px]",
    aura: "-inset-2",
    sparkle: "w-3.5 h-3.5",
    sparklePos: "top-0 right-0",
    accent: "w-3.5 h-3.5 -top-1 left-1/2 -translate-x-1/2",
    accentIcon: "w-2.5 h-2.5",
    star: "w-3 h-3 bottom-0 right-0",
    starIcon: "w-2 h-2",
  },
  lg: {
    box: "w-32 h-32",
    text: "text-4xl",
    badge: "text-[11px] px-3 py-1",
    ringPad: "p-[6px]",
    aura: "-inset-3",
    sparkle: "w-5 h-5",
    sparklePos: "top-0.5 right-0.5",
    accent: "w-5 h-5 -top-1.5 left-1/2 -translate-x-1/2",
    accentIcon: "w-3 h-3",
    star: "w-4 h-4 bottom-0.5 right-0.5",
    starIcon: "w-2.5 h-2.5",
  },
} as const

const BRONCE_RING = {
  outer: "bg-[#B45309]",
  inner: "bg-[#FFFBEB] ring-2 ring-[#D97706]/30",
  badge: "bg-[#92400E] text-[#FEF3C7] border border-[#D97706]/40",
}

function AvatarContent({
  name,
  rankTier,
  src,
  textClass,
}: {
  name: string
  rankTier: RankTier
  src: string | null
  textClass: string
}) {
  const inicial = name.charAt(0).toUpperCase() || "?"

  if (src) {
    return (
      <Image
        src={src}
        alt={`Avatar de ${name}`}
        width={128}
        height={128}
        className="w-full h-full object-cover"
        unoptimized
      />
    )
  }

  const textColor =
    rankTier === "platino"
      ? "bg-gradient-to-br from-[#16A34A] via-[#6D28D9] to-[#22D3EE] bg-clip-text text-transparent"
      : rankTier === "oro"
        ? "text-[#B45309]"
        : rankTier === "plata"
          ? "text-[#475569]"
          : "text-[#B45309]"

  return (
    <span
      className={`w-full h-full flex items-center justify-center ${textClass} font-bold ${textColor}`}
    >
      {inicial}
    </span>
  )
}

function PlataFrame({
  name,
  avatarUrl,
  size,
  showRankBadge,
}: {
  name: string
  avatarUrl?: string | null
  size: keyof typeof SIZE
  showRankBadge: boolean
}) {
  const s = SIZE[size]
  const src = avatarSrc(avatarUrl)

  return (
    <div className="relative inline-flex flex-col items-center gap-1.5">
      <div className={`relative ${s.box}`}>
        <div className={`absolute ${s.aura} rounded-full avatar-plata-aura`} aria-hidden />
        <div className={`relative w-full h-full rounded-full ${s.ringPad} avatar-plata-ring`}>
          <div className="absolute inset-0 rounded-full avatar-plata-shine" aria-hidden />
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#F1F5F9] ring-2 ring-[#E2E8F0] shadow-[inset_0_2px_10px_rgba(71,85,105,0.2)]">
            <AvatarContent name={name} rankTier="plata" src={src} textClass={s.text} />
          </div>
        </div>
        <span
          className={`absolute ${s.accent} z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F8FAFC] to-[#94A3B8] text-[#475569] shadow-[0_2px_8px_rgba(100,116,139,0.45)] ring-1 ring-white/70`}
          aria-hidden
        >
          <Gem className={s.accentIcon} />
        </span>
      </div>
      {showRankBadge && (
        <span
          className={`${s.badge} rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-[#64748B] via-[#CBD5E1] to-[#64748B] text-[#0F172A] border border-white/40 shadow-[0_0_10px_rgba(148,163,184,0.35)]`}
        >
          {RANK_LABELS.plata}
        </span>
      )}
    </div>
  )
}

function OroFrame({
  name,
  avatarUrl,
  size,
  showRankBadge,
}: {
  name: string
  avatarUrl?: string | null
  size: keyof typeof SIZE
  showRankBadge: boolean
}) {
  const s = SIZE[size]
  const src = avatarSrc(avatarUrl)
  const showStar = size === "lg"

  return (
    <div className="relative inline-flex flex-col items-center gap-1.5">
      <div className={`relative ${s.box}`}>
        <div className={`absolute ${s.aura} rounded-full avatar-oro-aura`} aria-hidden />
        <div className={`relative w-full h-full rounded-full ${s.ringPad} avatar-oro-ring`}>
          <div className="absolute inset-0 rounded-full avatar-oro-shine" aria-hidden />
          <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#B45309]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#FFFBEB] ring-2 ring-[#FDE68A]/70 shadow-[inset_0_2px_12px_rgba(180,83,9,0.18)]">
              <AvatarContent name={name} rankTier="oro" src={src} textClass={s.text} />
            </div>
          </div>
        </div>
        <span
          className={`absolute ${s.accent} z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FEF3C7] via-[#FBBF24] to-[#D97706] text-[#78350F] shadow-[0_2px_10px_rgba(245,158,11,0.55)] ring-2 ring-[#FDE68A]/80`}
          aria-hidden
        >
          <Crown className={s.accentIcon} />
        </span>
        {showStar && (
          <span
            className={`absolute ${s.star} z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EA580C] text-white shadow-md avatar-oro-twinkle`}
            aria-hidden
          >
            <Star className={s.starIcon} fill="currentColor" />
          </span>
        )}
      </div>
      {showRankBadge && (
        <span
          className={`${s.badge} rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-[#B45309] via-[#FBBF24] to-[#D97706] text-[#FFFBEB] border border-[#FDE68A]/60 shadow-[0_0_14px_rgba(245,158,11,0.45)]`}
        >
          {RANK_LABELS.oro}
        </span>
      )}
    </div>
  )
}

function PlatinoFrame({
  name,
  avatarUrl,
  size,
  showRankBadge,
}: {
  name: string
  avatarUrl?: string | null
  size: keyof typeof SIZE
  showRankBadge: boolean
}) {
  const s = SIZE[size]
  const src = avatarSrc(avatarUrl)
  const showExtraSparkles = size === "lg"

  return (
    <div className="relative inline-flex flex-col items-center gap-1.5">
      <div className={`relative ${s.box}`}>
        <div className={`absolute ${s.aura} rounded-full avatar-platino-aura`} aria-hidden />
        <div className={`relative w-full h-full rounded-full ${s.ringPad} avatar-platino-ring`}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#22D3EE]/80 via-[#6D28D9]/90 to-[#16A34A]/80">
            <div className="w-full h-full rounded-full overflow-hidden bg-white ring-2 ring-white/60 shadow-inner">
              <AvatarContent name={name} rankTier="platino" src={src} textClass={s.text} />
            </div>
          </div>
        </div>
        <span
          className={`absolute ${s.sparklePos} flex items-center justify-center rounded-full bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] text-white shadow-lg avatar-platino-twinkle ${s.sparkle}`}
          aria-hidden
        >
          <Sparkles className="w-[58%] h-[58%]" />
        </span>
        {showExtraSparkles && (
          <>
            <span
              className="absolute bottom-1 left-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-md avatar-platino-twinkle-delay"
              aria-hidden
            >
              <Sparkles className="h-2.5 w-2.5" />
            </span>
            <span
              className="absolute left-1 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full bg-[#A855F7] text-white shadow-md avatar-platino-twinkle"
              aria-hidden
            >
              <Sparkles className="h-2 w-2" />
            </span>
          </>
        )}
      </div>
      {showRankBadge && (
        <span
          className={`${s.badge} rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-[#16A34A] via-[#6D28D9] to-[#22D3EE] text-white border border-white/30 shadow-[0_0_14px_rgba(109,40,217,0.45)]`}
        >
          {RANK_LABELS.platino}
        </span>
      )}
    </div>
  )
}

export function ProfileAvatar({
  name,
  rankTier = "bronce",
  avatarUrl,
  size = "md",
  showRankBadge = false,
  plain = false,
}: ProfileAvatarProps) {
  if (plain) {
    const s = SIZE[size]
    const src = avatarSrc(avatarUrl)
    return (
      <div className={`${s.box} rounded-full overflow-hidden bg-[#EAF3DE] ring-2 ring-[#E2E8F0] flex items-center justify-center shrink-0`}>
        {src ? (
          <Image
            src={src}
            alt={`Avatar de ${name}`}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span className={`${s.text} font-bold text-[#16A34A]`}>
            {name.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
    )
  }

  if (rankTier === "platino") {
    return (
      <PlatinoFrame name={name} avatarUrl={avatarUrl} size={size} showRankBadge={showRankBadge} />
    )
  }
  if (rankTier === "oro") {
    return (
      <OroFrame name={name} avatarUrl={avatarUrl} size={size} showRankBadge={showRankBadge} />
    )
  }
  if (rankTier === "plata") {
    return (
      <PlataFrame name={name} avatarUrl={avatarUrl} size={size} showRankBadge={showRankBadge} />
    )
  }

  const s = SIZE[size]
  const src = avatarSrc(avatarUrl)

  return (
    <div className="relative inline-flex flex-col items-center gap-1.5">
      <div className={`${s.box} rounded-full ${s.ringPad} ${BRONCE_RING.outer}`}>
        <div
          className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${BRONCE_RING.inner}`}
        >
          <AvatarContent name={name} rankTier="bronce" src={src} textClass={s.text} />
        </div>
      </div>
      {showRankBadge && (
        <span className={`${s.badge} rounded-full font-bold uppercase tracking-wider ${BRONCE_RING.badge}`}>
          {RANK_LABELS.bronce}
        </span>
      )}
    </div>
  )
}
