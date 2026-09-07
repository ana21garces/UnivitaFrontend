import { TrendingUp, TrendingDown, Minus } from "lucide-react"

/**
 * Chip "antes 55% ▲" que compara el porcentaje actual de una dimensión con el de
 * la medición anterior del usuario. No muestra nada si es su primera medición
 * (`anterior` nulo), para no ensuciar la fila de quien solo tiene una encuesta.
 */
export function ComparativoAnterior({
  actual,
  anterior,
}: {
  actual: number
  anterior?: number | null
}) {
  if (anterior === null || anterior === undefined) return null

  const delta = actual - anterior
  // Umbral pequeño: por debajo se considera que se mantuvo (evita marcar como
  // cambio un redondeo de décimas).
  const subio = delta > 0.05
  const bajo = delta < -0.05

  const estilo = subio
    ? "text-[#15803D] bg-[#F0FDF4]"
    : bajo
      ? "text-[#DC2626] bg-[#FEF2F2]"
      : "text-[#6B7280] bg-[#F1F5F9]"
  const Icono = subio ? TrendingUp : bajo ? TrendingDown : Minus

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${estilo}`}
      title="Comparado con su medición anterior"
    >
      <Icono className="w-3 h-3" />
      antes {anterior.toFixed(0)}%
    </span>
  )
}
