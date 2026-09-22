import { CompletarDatosDemograficos } from "@/components/completar-datos-demograficos"
import { UsabilidadGate } from "@/components/usabilidad-gate"
import { UsabilidadAreaPrompt } from "@/components/usabilidad-area-prompt"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {children}
      <CompletarDatosDemograficos />
      <UsabilidadGate />
      <UsabilidadAreaPrompt />
    </div>
  )
}
