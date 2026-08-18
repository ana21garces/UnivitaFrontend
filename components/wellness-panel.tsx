import Image from "next/image"
import { UsuariosRegistradosBadge } from "@/components/usuarios-registrados-badge"

export function WellnessPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center relative p-12 overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/wellness-illustration.jpg`}
            alt="Healthy lifestyle illustration showing people practicing wellness activities"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading text-[#1F2937] text-balance">
            Tu bienestar, tu mejor logro
          </h2>
          <p className="mt-3 text-[#6B7280] leading-relaxed text-pretty">
            Descubre hábitos saludables, completa desafíos y gana recompensas mientras cuidas tu salud en sus seis dimensiones.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <UsuariosRegistradosBadge />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF] shadow-sm border border-[#E2E8F0]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#549d87]" />
            <span className="text-sm font-medium text-[#1F2937]">6 Dimensiones</span>
          </div>
        </div>
      </div>
    </div>
  )
}
