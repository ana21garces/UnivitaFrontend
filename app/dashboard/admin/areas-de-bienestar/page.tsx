import Link from "next/link"
import {
  Sparkles,
  Dumbbell,
  Stethoscope,
  HeartHandshake,
  ArrowRight,
} from "lucide-react"

// Cada área corresponde a la vista completa de un profesional. El admin puede
// entrar a verlas (el backend le da acceso además de a cada rol).
const AREAS = [
  {
    title: "Psicología positiva",
    desc: "Vista del capellán: resultados y estadísticas.",
    href: "/dashboard/capellan",
    Icon: Sparkles,
    box: "bg-[#F5F3FF] text-[#7C3AED]",
  },
  {
    title: "Actividad física",
    desc: "Resultados y estadísticas de actividad física.",
    href: "/dashboard/actividad-fisica",
    Icon: Dumbbell,
    box: "bg-[#ECFEFF] text-[#0891B2]",
  },
  {
    title: "Responsabilidad en salud",
    desc: "Resultados y estadísticas de responsabilidad en salud.",
    href: "/dashboard/responsabilidad-salud",
    Icon: Stethoscope,
    box: "bg-[#FFF1F2] text-[#E11D48]",
  },
  {
    title: "Relaciones interpersonales",
    desc: "Resultados y estadísticas de relaciones interpersonales.",
    href: "/dashboard/relaciones-interpersonales",
    Icon: HeartHandshake,
    box: "bg-[#EEF2FF] text-[#4F46E5]",
  },
]

export default function AreasDeBienestarPage() {
  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Áreas de bienestar</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Entra a la vista completa de cada área profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AREAS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm hover:border-[#16A34A]/40 hover:shadow-md transition-all"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${a.box}`}>
              <a.Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#1F2937]">{a.title}</p>
              <p className="text-sm text-[#6B7280]">{a.desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#CBD5E1] group-hover:text-[#16A34A] transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </main>
  )
}
