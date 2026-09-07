import type { Metadata } from "next"
import { RecuperarForm } from "@/components/recuperar-form"
import { WellnessPanel } from "@/components/wellness-panel"

export const metadata: Metadata = { title: "Recuperar contraseña" }

export default function RecuperarPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-[#FFFFFF] to-[#F0FDF4]">
      {/* Form side */}
      <div className="flex items-start justify-center lg:items-center px-6 py-12">
        <RecuperarForm />
      </div>

      {/* Illustration side */}
      <WellnessPanel />
    </main>
  )
}
