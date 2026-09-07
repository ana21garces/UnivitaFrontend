// AI assisted development
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react"
import { PublicHeader } from "@/components/public-header"
import { LandingHero } from "@/components/landing-hero"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { TRANSPARENCY } from "@/lib/content/transparency"
import { LOGIN_PATH } from "@/lib/auth"

export function LandingPage() {
  const { queEsUnacHealth, quienesLoAvalan, comoSeConstruyen, enQueSeBasa } =
    TRANSPARENCY

  return (
    <>
      <a
        href="#contenido-principal"
        className="absolute left-4 top-4 z-[100] -translate-y-[calc(100%+2rem)] rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition-transform focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
      >
        Saltar al contenido principal
      </a>

      <PublicHeader />

      <main id="contenido-principal" className="min-h-screen bg-[#F8FAFC]">
        <LandingHero />

        {/* Qué es UnacHealth */}
        <section
          id="que-es"
          className="border-t border-[#E2E8F0] bg-white py-16"
          aria-labelledby="que-es-heading"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-xl bg-[#EAF3DE] p-3 sm:block" aria-hidden="true">
                <BookOpen className="h-6 w-6 text-[#16A34A]" />
              </div>
              <div className="max-w-3xl">
                <h2
                  id="que-es-heading"
                  className="text-2xl font-bold font-heading text-[#1F2937] md:text-3xl"
                >
                  {queEsUnacHealth.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {queEsUnacHealth.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-base leading-relaxed text-[#6B7280]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quiénes lo avalan */}
        <section
          id="quienes-aval"
          className="py-16"
          aria-labelledby="quienes-heading"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-xl bg-[#EAF3DE] p-3 sm:block" aria-hidden="true">
                <Users className="h-6 w-6 text-[#16A34A]" />
              </div>
              <div className="w-full">
                <h2
                  id="quienes-heading"
                  className="text-2xl font-bold font-heading text-[#1F2937] md:text-3xl"
                >
                  {quienesLoAvalan.title}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6B7280]">
                  {quienesLoAvalan.intro}
                </p>

                <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <GraduationCap
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937]">
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

                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {quienesLoAvalan.experts.map((expert) => (
                    <li
                      key={expert.area}
                      className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-semibold text-[#1F2937]">
                        {expert.displayName}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[#16A34A]">
                        {expert.area}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo se construyen las recomendaciones */}
        <section
          id="como-se-construyen"
          className="border-t border-[#E2E8F0] bg-white py-16"
          aria-labelledby="como-heading"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-xl bg-[#EAF3DE] p-3 sm:block" aria-hidden="true">
                <ClipboardList className="h-6 w-6 text-[#16A34A]" />
              </div>
              <div className="w-full">
                <h2
                  id="como-heading"
                  className="text-2xl font-bold font-heading text-[#1F2937] md:text-3xl"
                >
                  {comoSeConstruyen.title}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6B7280]">
                  {comoSeConstruyen.summary}
                </p>

                <ol className="mt-8 grid gap-6 md:grid-cols-3">
                  {comoSeConstruyen.steps.map((step, i) => (
                    <li
                      key={step.title}
                      className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#BBF7D0] hover:shadow-md"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#16A34A] to-[#6D28D9] text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <h3 className="mt-4 font-semibold text-[#1F2937]">{step.title.replace(/^\d+\.\s*/, "")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                        {step.description}
                      </p>
                    </li>
                  ))}
                </ol>

                <p className="mt-8">
                  <Link
                    href={comoSeConstruyen.metodologiaLink}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#16A34A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 rounded"
                  >
                    {comoSeConstruyen.metodologiaLinkLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* En qué se basa */}
        <section
          id="en-que-se-basa"
          className="py-16"
          aria-labelledby="basado-heading"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-xl bg-[#EAF3DE] p-3 sm:block" aria-hidden="true">
                <Shield className="h-6 w-6 text-[#16A34A]" />
              </div>
              <div className="max-w-3xl">
                <h2
                  id="basado-heading"
                  className="text-2xl font-bold font-heading text-[#1F2937] md:text-3xl"
                >
                  {enQueSeBasa.title}
                </h2>
                {enQueSeBasa.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-4 text-base leading-relaxed text-[#6B7280]"
                  >
                    {paragraph}
                  </p>
                ))}

                <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 text-center shadow-sm">
                    <dt className="text-sm font-medium text-[#6B7280]">Instrumento</dt>
                    <dd className="mt-1 text-xl font-bold text-[#16A34A]">
                      {enQueSeBasa.instrument}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 text-center shadow-sm">
                    <dt className="text-sm font-medium text-[#6B7280]">Ítems</dt>
                    <dd className="mt-1 text-xl font-bold text-[#16A34A]">
                      {enQueSeBasa.items}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 text-center shadow-sm">
                    <dt className="text-sm font-medium text-[#6B7280]">Dimensiones</dt>
                    <dd className="mt-1 text-xl font-bold text-[#16A34A]">
                      {enQueSeBasa.dimensions}
                    </dd>
                  </div>
                </dl>

                <h3 className="mt-8 text-lg font-semibold text-[#1F2937]">
                  Las seis dimensiones
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {enQueSeBasa.dimensionNames.map((name) => (
                    <li
                      key={name}
                      className="flex items-center gap-2 text-sm text-[#6B7280]"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]"
                        aria-hidden="true"
                      />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer TR-004 */}
        <section className="border-t border-[#E2E8F0] bg-white py-16" aria-label="Aviso legal">
          <div className="mx-auto max-w-6xl px-6">
            <DisclaimerBanner />
          </div>
        </section>

        {/* CTA final */}
        <section
          className="relative overflow-hidden py-16"
          aria-label="Acciones"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#16A34A] to-[#6D28D9]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-2xl font-bold font-heading text-white sm:text-3xl">
              ¿Listo para conocerte mejor?
            </h2>
            <p className="mt-3 text-base text-white/85">
              Únete a la comunidad UnacHealth y empieza tu camino de bienestar hoy.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#16A34A] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16A34A]"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href={LOGIN_PATH}
                className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-white/60 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16A34A]"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-[#6B7280]">
          <p>
            © {new Date().getFullYear()} {TRANSPARENCY.appName} — Universidad
            Adventista de Colombia (UNAC)
          </p>
        </div>
      </footer>
    </>
  )
}
