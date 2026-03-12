import Image from "next/image"

export function WellnessPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center relative bg-gradient-to-br from-[#F0FDF4] to-[#EFF6FF] p-12 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#16A34A]/8" />
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-[#2563EB]/10" />
      <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-[#6D28D9]/6" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/wellness-illustration.jpg"
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
            Descubre habitos saludables, completa desafios y gana recompensas mientras cuidas tu salud con inteligencia artificial.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF] shadow-sm border border-[#E2E8F0]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span className="text-sm font-medium text-[#1F2937]">+2,500 usuarios activos</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF] shadow-sm border border-[#E2E8F0]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6D28D9]" />
            <span className="text-sm font-medium text-[#1F2937]">8 Remedios</span>
          </div>
        </div>
      </div>
    </div>
  )
}
