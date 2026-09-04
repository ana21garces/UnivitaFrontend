export function Seccion({
  icono,
  titulo,
  children,
}: {
  icono: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
          {icono}
        </div>
        <h2 className="text-base font-bold font-heading text-[#1F2937]">{titulo}</h2>
      </div>
      <div className="flex flex-col gap-3 text-sm text-[#6B7280] leading-relaxed">{children}</div>
    </section>
  )
}

export function Preguntas({ items }: { items: { p: string; r: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.p}>
          <p className="text-sm font-semibold text-[#1F2937]">{item.p}</p>
          <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{item.r}</p>
        </div>
      ))}
    </div>
  )
}
