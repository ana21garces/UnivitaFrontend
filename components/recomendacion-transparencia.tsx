// AI assisted development
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { PorQueVeoEsto } from "@/components/por-que-veo-esto"
import type { DimensionKey } from "@/lib/content/transparency"

type TarjetaIndicador = {
  pregunta_num: number
  pregunta_texto: string
}

type RecomendacionTransparenciaProps = {
  dimensionKey: DimensionKey
  nivel: string
  tarjetas?: TarjetaIndicador[]
}

/** Bloques de transparencia (TR-003 + TR-004) para vistas de recomendaciones */
export function RecomendacionTransparencia({
  dimensionKey,
  nivel,
  tarjetas = [],
}: RecomendacionTransparenciaProps) {
  return (
    <div className="flex flex-col gap-4">
      <PorQueVeoEsto
        dimensionKey={dimensionKey}
        nivel={nivel}
        tarjetas={tarjetas}
      />
      <DisclaimerBanner compact />
    </div>
  )
}
