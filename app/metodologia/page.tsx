import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Calendar, GraduationCap } from "lucide-react"
import { PublicHeader } from "@/components/public-header"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { TRANSPARENCY } from "@/lib/content/transparency"

export const metadata: Metadata = {
  title: `Metodología — ${TRANSPARENCY.appName}`,
  description: TRANSPARENCY.metodologia.intro,
}

function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function MetodologiaPage() {
  const { metodologia, comoSeConstruyen, quienesLoAvalan, dimensions } =
    TRANSPARENCY

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F0FDF4]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#16A34A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>

          <h1 className="mt-6 text-3xl font-bold font-heading text-[#1F2937] md:text-4xl">
            {metodologia.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#6B7280]">
            {metodologia.intro}
          </p>

          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white border border-[#E2E8F0] px-3 py-2 text-sm text-[#6B7280]">
            <Calendar className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
            Última revisión del contenido:{" "}
            <strong className="text-[#1F2937]">
              {formatReviewDate(TRANSPARENCY.lastReviewedDate)}
            </strong>
          </p>

          {/* Flujo */}
          <section className="mt-10" aria-labelledby="flujo-heading">
            <h2
              id="flujo-heading"
              className="text-xl font-bold font-heading text-[#1F2937]"
            >
              {comoSeConstruyen.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {comoSeConstruyen.summary}
            </p>
            <ol className="mt-4 space-y-4">
              {comoSeConstruyen.steps.map((step) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-[#1F2937]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Dimensiones y profesionales */}
          <section className="mt-10" aria-labelledby="dimensiones-heading">
            <h2
              id="dimensiones-heading"
              className="text-xl font-bold font-heading text-[#1F2937]"
            >
              Las 6 dimensiones y su área profesional
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Cada dimensión del cuestionario tiene un profesional responsable
              que redacta y revisa las tarjetas de orientación.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left">
                    <th className="px-4 py-3 font-semibold text-[#1F2937]">
                      Dimensión
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#1F2937]">
                      Área profesional
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#1F2937]">
                      Niveles con orientación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map((dim) => (
                    <tr
                      key={dim.key}
                      className="border-b border-[#F1F5F9] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[#1F2937]">
                        {dim.name}
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">
                        {dim.responsibleProfessional}
                        <br />
                        <span className="text-xs">{dim.credential}</span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">
                        {dim.nivelesConRecomendacion.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cobertura por nivel */}
          <section className="mt-10" aria-labelledby="cobertura-heading">
            <h2
              id="cobertura-heading"
              className="text-xl font-bold font-heading text-[#1F2937]"
            >
              {metodologia.coberturaTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {metodologia.coberturaIntro}
            </p>

            {/* Nutrición: decisión profesional explícita (TR-002) */}
            <aside
              className="mt-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-5"
              aria-label={metodologia.nutricionDestacado.title}
            >
              <h3 className="font-semibold text-[#92400E]">
                {metodologia.nutricionDestacado.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#78350F]">
                {metodologia.nutricionDestacado.content}
              </p>
            </aside>

            <ul className="mt-4 space-y-3">
              {dimensions.map((dim) => (
                <li
                  key={dim.key}
                  className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
                >
                  <h3 className="font-semibold text-[#1F2937]">{dim.name}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    <strong className="text-[#16A34A]">Con orientación:</strong>{" "}
                    {dim.nivelesConRecomendacion.join(", ")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {dim.sinRecomendacionRazon}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Respaldo institucional */}
          <section className="mt-10" aria-labelledby="respaldo-heading">
            <h2
              id="respaldo-heading"
              className="text-xl font-bold font-heading text-[#1F2937]"
            >
              Respaldo institucional
            </h2>
            <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <GraduationCap
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-[#1F2937]">
                    {quienesLoAvalan.institution.name}
                  </h3>
                  <p className="text-sm font-medium text-[#16A34A]">
                    {quienesLoAvalan.institution.subtitle}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {quienesLoAvalan.institution.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Límites */}
          <section className="mt-10" aria-labelledby="limites-heading">
            <h2
              id="limites-heading"
              className="text-xl font-bold font-heading text-[#1F2937]"
            >
              {metodologia.limitesTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {metodologia.limites.map((limite) => (
                <li
                  key={limite.slice(0, 40)}
                  className="flex gap-2 text-sm leading-relaxed text-[#6B7280]"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]"
                    aria-hidden="true"
                  />
                  {limite}
                </li>
              ))}
            </ul>
          </section>

          {/* Secciones adicionales */}
          <div className="mt-10 space-y-8">
            {metodologia.sections.map((section) => (
              <section key={section.title} aria-labelledby={section.title}>
                <h2
                  id={section.title}
                  className="text-xl font-bold font-heading text-[#1F2937]"
                >
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#6B7280]">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-12">
            <DisclaimerBanner showMetodologiaLink={false} />
          </div>
        </div>
      </main>
    </>
  )
}
