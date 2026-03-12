import { LoginForm } from "@/components/login-form"
import { WellnessPanel } from "@/components/wellness-panel"

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <LoginForm />
      </div>

      {/* Illustration side */}
      <WellnessPanel />
    </main>
  )
}
