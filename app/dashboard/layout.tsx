import { CompletarDatosDemograficos } from "@/components/completar-datos-demograficos"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {children}
      <CompletarDatosDemograficos />
    </div>
  )
}
