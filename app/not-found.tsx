import Link from "next/link"
import { UniVitaLogo } from "@/components/univita-logo"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFFFF] to-[#F0FDF4] px-6">
      <div className="flex flex-col items-center text-center gap-5 max-w-sm">
        <UniVitaLogo size="md" />
        <div>
          <p className="text-5xl font-bold font-heading text-[#16A34A]">404</p>
          <h1 className="mt-2 text-xl font-bold font-heading text-[#1F2937]">
            No encontramos esta página
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            El enlace puede estar roto o la página se movió.
          </p>
        </div>
        <Link
          href="/"
          className="h-11 px-6 inline-flex items-center rounded-lg text-white text-sm font-semibold shadow-md shadow-[#16A34A]/20 hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
