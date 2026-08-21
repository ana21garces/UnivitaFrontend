import { Construction } from "lucide-react"

// Página placeholder para las secciones del panel de admin que aún no existen.
export function Proximamente({ titulo }: { titulo: string }) {
  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#1F2937]">{titulo}</h2>
      </div>
      <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#FFFFFF] p-12 flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] mb-4">
          <Construction className="w-7 h-7" />
        </div>
        <p className="text-lg font-semibold text-[#1F2937]">Próximamente</p>
        <p className="mt-1 text-sm text-[#6B7280] max-w-sm">
          Esta sección está en construcción. Pronto podrás gestionarla desde aquí.
        </p>
      </div>
    </main>
  )
}
