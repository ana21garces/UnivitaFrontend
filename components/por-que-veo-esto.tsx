// AI assisted development
import { Info } from "lucide-react"
import {
  TRANSPARENCY,
  type DimensionKey,
  getDimensionConfig,
  formatIndicadoresActivados,
  nivelTieneRecomendacion,
} from "@/lib/content/transparency"

type TarjetaIndicador = {
  pregunta_num: number
  pregunta_texto: string
}

type PorQueVeoEstoProps = {
  dimensionKey: DimensionKey
  nivel: string
  tarjetas?: TarjetaIndicador[]
  className?: string
}

export function PorQueVeoEsto({
  dimensionKey,
  nivel,
  tarjetas = [],
  className = "",
}: PorQueVeoEstoProps) {
  const dim = getDimensionConfig(dimensionKey)
  const { porQueRecomendacion } = TRANSPARENCY
  const tieneCobertura = nivelTieneRecomendacion(dimensionKey, nivel)
  const tieneTarjetas = tarjetas.length > 0

  return (
    <section
      className={`rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 ${className}`}
      aria-labelledby={`por-que-${dimensionKey}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3DE]"
          aria-hidden="true"
        >
          <Info className="h-4 w-4 text-[#16A34A]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id={`por-que-${dimensionKey}`}
            className="text-sm font-bold text-[#1F2937]"
          >
            {porQueRecomendacion.title}
          </h2>

          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="font-medium text-[#6B7280]">
                {porQueRecomendacion.nivelLabel}
              </dt>
              <dd className="font-semibold text-[#1F2937]">{nivel}</dd>
            </div>

            {tieneTarjetas ? (
              <div>
                <dt className="font-medium text-[#6B7280]">Indicadores</dt>
                <dd className="text-[#374151] leading-relaxed">
                  {formatIndicadoresActivados(tarjetas)}
                </dd>
              </div>
            ) : !tieneCobertura ? (
              <div>
                <dt className="font-medium text-[#6B7280]">
                  {porQueRecomendacion.sinTarjetasTitulo}
                </dt>
                <dd className="text-[#374151] leading-relaxed">
                  {dim.sinRecomendacionRazon}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="font-medium text-[#6B7280]">Indicadores</dt>
                <dd className="text-[#374151] leading-relaxed">
                  {dim.indicadoresDescripcion} En este momento no hay tarjetas
                  activas porque tus respuestas no indican áreas prioritarias de
                  mejora.
                </dd>
              </div>
            )}

            <div>
              <dt className="font-medium text-[#6B7280]">
                {porQueRecomendacion.redactadoPorLabel}
              </dt>
              <dd className="text-[#374151]">
                {dim.responsibleProfessional} — {dim.professionalArea} (
                {dim.credential})
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-xs leading-relaxed text-[#6B7280]">
            {porQueRecomendacion.fixedContentNote}
          </p>
        </div>
      </div>
    </section>
  )
}
