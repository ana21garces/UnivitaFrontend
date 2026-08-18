import Image from "next/image"
import { Star } from "lucide-react"
import { UsuariosRegistradosBadge } from "@/components/usuarios-registrados-badge"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function WellnessPanel() {
  return (
    <div className="hidden lg:flex items-center relative overflow-hidden bg-[#F0FDF4] px-14 py-10 lg:self-start lg:sticky lg:top-0 lg:h-screen">
      {/* Óvalo decorativo verde */}
      <div className="pointer-events-none absolute right-[-5%] bottom-[-1%] w-[48%] aspect-square rounded-full bg-[#C7F0D6]" />

      {/* Bowl + vaso + manzana */}
      <div className="pointer-events-none absolute right-[2%] top-1/2 -translate-y-1/2 w-[42%]">
        <Image src={`${BASE}/images/ensalada.png`} alt="Plato saludable" width={826} height={832} className="w-full h-auto" priority />
      </div>
      <div className="pointer-events-none absolute right-[8%] top-[15%] w-[12%]">
        <Image src={`${BASE}/images/vaso.png`} alt="" width={422} height={415} className="w-full h-auto" />
      </div>

      {/* Contenido a la izquierda */}
      <div className="relative z-10 flex flex-col gap-7 max-w-xs">
        <div>
          <h2 className="text-4xl font-bold font-heading text-[#1F2937] leading-tight">
            Tu bienestar,
            <br />
            <span className="text-[#16A34A]">tu mejor logro</span>
          </h2>
          <p className="mt-4 text-sm text-[#6B7280] leading-relaxed">
            Descubre hábitos saludables, completa desafíos y gana recompensas
            mientras cuidas tu salud en sus seis dimensiones.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <UsuariosRegistradosBadge />
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EAF3DE] text-[#3B6D11] shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] leading-none">6</p>
              <p className="text-sm text-[#6B7280] mt-1">dimensiones de bienestar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
