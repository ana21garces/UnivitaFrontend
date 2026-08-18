import { LoginForm } from "@/components/login-form"
import { WellnessPanel } from "@/components/wellness-panel"

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
