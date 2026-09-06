import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"
import { WellnessPanel } from "@/components/wellness-panel"

// El `template` del layout raíz no aplica a este `page.tsx` (mismo segmento),
// así que aquí el título va completo.
export const metadata: Metadata = { title: "Inicio de sesión · UnacHealth" }

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-[#FFFFFF] to-[#F0FDF4]">
      {/* Form side */}
      <div className="flex items-start justify-center lg:items-center px-6 py-12">
        <LoginForm />
      </div>

      {/* Illustration side */}
      <WellnessPanel />
    </main>
  )
}
