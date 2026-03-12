import { RegisterForm } from "@/components/register-form"
import { WellnessPanel } from "@/components/wellness-panel"

export default function RegisterPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-10 bg-[#F8FAFC]">
        <RegisterForm />
      </div>

      {/* Illustration side */}
      <WellnessPanel />
    </main>
  )
}
