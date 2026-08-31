"use client"

// Panorama general (población total + facultades que más necesitan atención)
// para las vistas por rol: capellán, actividad física y, cuando exista,
// responsabilidad en salud. La forma de los datos es idéntica en las tres
// —la devuelve el mismo tipo de endpoint en el backend, uno por dimensión—
// así que este componente no sabe ni le importa de qué dimensión se trata.

export type ConteoNiveles = {
  pobre: number
  moderado: number
  bueno: number
  excelente: number
  total: number
  promedio_indice: number
}

export type FacultadEstadistica = {
  facultad: string | null
  conteo: ConteoNiveles
}

export type EstadisticasDimension = {
  poblacion_general: ConteoNiveles
  por_facultad: FacultadEstadistica[]
}

// Colores fijos para la etiqueta de nivel promedio. Independientes de la
// paleta que use cada vista para sus propias insignias por fila: aquí solo
// importa que Pobre/Moderado/Bueno/Excelente se lean igual en las tres vistas.
const COLOR_TEXTO_NIVEL: Record<string, string> = {
  Pobre: "#B91C1C",
  Moderado: "#C2410C",
  Bueno: "#A16207",
  Excelente: "#15803D",
}

export function nivelDeIndice(indice: number): string {
  return indice <= 25 ? "Pobre" : indice <= 50 ? "Moderado" : indice <= 75 ? "Bueno" : "Excelente"
}

function BarraSegmentada({ conteo }: { conteo: ConteoNiveles }) {
  const { pobre, moderado, bueno, excelente, total } = conteo
  if (total === 0) return <div className="h-3 rounded-full bg-[#F1F5F9]" />
  const pct = (n: number) => (n / total) * 100
  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-[#F1F5F9]">
      {pobre > 0 && <div className="bg-red-500" style={{ width: `${pct(pobre)}%` }} title={`Pobre: ${pobre}`} />}
      {moderado > 0 && <div className="bg-orange-400" style={{ width: `${pct(moderado)}%` }} title={`Moderado: ${moderado}`} />}
      {bueno > 0 && <div className="bg-yellow-400" style={{ width: `${pct(bueno)}%` }} title={`Bueno: ${bueno}`} />}
      {excelente > 0 && <div className="bg-green-500" style={{ width: `${pct(excelente)}%` }} title={`Excelente: ${excelente}`} />}
    </div>
  )
}

function LeyendaConteo({ conteo }: { conteo: ConteoNiveles }) {
  const items: Array<[keyof ConteoNiveles, string]> = [
    ["pobre", "bg-red-500"],
    ["moderado", "bg-orange-400"],
    ["bueno", "bg-yellow-400"],
    ["excelente", "bg-green-500"],
  ]
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {items.map(([clave, color]) => (
        <div key={clave} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="text-xs text-[#6B7280] capitalize">{clave}: {conteo[clave]}</span>
        </div>
      ))}
    </div>
  )
}

export function EstadisticasSection({
  stats,
  tituloDimension,
}: {
  stats: EstadisticasDimension
  /** Ej. "Psicología positiva", "Actividad física". */
  tituloDimension: string
}) {
  const g = stats.poblacion_general
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Población general */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#1F2937] mb-1">Población general</h3>
        <p className="text-xs text-[#6B7280] mb-3">{tituloDimension} en toda la universidad</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold" style={{ color: COLOR_TEXTO_NIVEL[nivelDeIndice(g.promedio_indice)] }}>
            {Math.round(g.promedio_indice)}%
          </span>
          <span className="text-xs text-[#6B7280]">
            promedio ({nivelDeIndice(g.promedio_indice)}) · {g.total} persona{g.total !== 1 ? "s" : ""}
          </span>
        </div>
        <BarraSegmentada conteo={g} />
        <LeyendaConteo conteo={g} />
      </div>

      {/* Por facultad */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#1F2937] mb-1">Facultades que más necesitan atención</h3>
        <p className="text-xs text-[#6B7280] mb-3">Ordenadas de menor a mayor porcentaje promedio</p>
        {stats.por_facultad.length === 0 ? (
          <p className="text-xs text-[#6B7280] py-4 text-center">Sin datos suficientes todavía.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.por_facultad.map((f) => (
              <div key={f.facultad ?? "sin-facultad"}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs font-medium text-[#1F2937] truncate">
                    {f.facultad || "Sin facultad asignada"}{" "}
                    <span className="text-[#9CA3AF] font-normal">({f.conteo.total})</span>
                  </span>
                  <span className="text-xs font-bold shrink-0" style={{ color: COLOR_TEXTO_NIVEL[nivelDeIndice(f.conteo.promedio_indice)] }}>
                    {Math.round(f.conteo.promedio_indice)}%
                  </span>
                </div>
                <BarraSegmentada conteo={f.conteo} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
