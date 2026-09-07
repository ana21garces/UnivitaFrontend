// AI assisted development
import Link from "next/link"
import { LandingHeroVisual } from "@/components/landing-hero-visual"
import {
  ArrowRight,
  Brain,
  Dumbbell,
  Heart,
  Leaf,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react"
import { UsuariosRegistradosBadge } from "@/components/usuarios-registrados-badge"
import { TRANSPARENCY } from "@/lib/content/transparency"
import { LOGIN_PATH } from "@/lib/auth"

const DIMENSIONES = [
  { label: "Nutrición", icon: Utensils, color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Actividad física", icon: Dumbbell, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Psicología positiva", icon: Sparkles, color: "#D97706", bg: "#FFFBEB" },
  { label: "Manejo del estrés", icon: Brain, color: "#0891B2", bg: "#ECFEFF" },
  { label: "Relaciones", icon: Users, color: "#DB2777", bg: "#FDF2F8" },
  { label: "Salud", icon: Heart, color: "#16A34A", bg: "#F0FDF4" },
] as const

export function LandingHero() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Fondo con gradiente y formas orgánicas */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#F0FDF4] via-white to-[#EDE9FE]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#BBF7D0]/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#C4B5FD]/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#FDE68A]/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-start gap-8 px-6 pt-5 pb-10 md:pt-6 md:pb-12 lg:grid-cols-2 lg:gap-10 lg:pt-8 lg:pb-14">
        {/* Columna izquierda: texto, acciones y banner */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:pt-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#15803D] shadow-sm backdrop-blur-sm">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            Universidad Adventista de Colombia
          </span>

          <h1
            id="hero-heading"
            className="mt-4 text-4xl font-extrabold font-heading leading-[1.1] tracking-tight text-[#1F2937] sm:text-5xl lg:text-6xl"
          >
            Tu bienestar,
            <br />
            <span className="bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#6D28D9] bg-clip-text text-transparent">
              tu mejor versión
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#4B5563] sm:text-xl">
            <strong className="font-semibold text-[#1F2937]">{TRANSPARENCY.appName}</strong>{" "}
            te guía a conocer tus hábitos en{" "}
            <strong className="text-[#16A34A]">6 dimensiones</strong>, completar
            desafíos y recibir orientación de profesionales UNAC.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#16A34A]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#16A34A]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
              style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)" }}
            >
              Empezar ahora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href={LOGIN_PATH}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[#16A34A]/30 bg-white/90 px-8 py-4 text-base font-bold text-[#16A34A] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#16A34A] hover:bg-[#F0FDF4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
          </div>

          <ul
            className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start"
            aria-label="Dimensiones de bienestar"
          >
            {DIMENSIONES.map(({ label, icon: Icon, color, bg }) => (
              <li key={label}>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
                  style={{ backgroundColor: bg, color }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 w-full max-w-md">
            <UsuariosRegistradosBadge />
          </div>
        </div>

        {/* Columna derecha: imagen */}
        <LandingHeroVisual />
      </div>
    </section>
  )
}
