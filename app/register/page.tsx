import type { Metadata } from "next"
import { RegisterForm } from "@/components/register-form"
import { WellnessPanel } from "@/components/wellness-panel"

export const metadata: Metadata = { title: "Crear cuenta" }

export default function RegisterPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-[#FFFFFF] to-[#F0FDF4]">
      {/* Form side */}
      <div className="flex items-start justify-center lg:items-center px-6 py-10">
        <RegisterForm />
      </div>

      {/* Illustration side */}
      <WellnessPanel />
    </main>
  )
}
