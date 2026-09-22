"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { getAccessToken, getRoleFromToken } from "@/lib/auth"
import { homePorRol } from "@/lib/roles"
import { DashboardNavbar, type RolNavbar } from "@/components/dashboard-navbar"
import { CheckCircle2, AlertCircle, ClipboardList } from "lucide-react"

type Preguntas = { items: string[]; escala_min: number; escala_max: number }

export default function UsabilidadPage() {
  const router = useRouter()
  const [navRole, setNavRole] = useState<RolNavbar>("user")
  const [home, setHome] = useState("/dashboard/user")
  const [rolArea, setRolArea] = useState<string | null>(null)
  const [preguntas, setPreguntas] = useState<Preguntas | null>(null)
  const [respuestas, setRespuestas] = useState<(number | null)[]>([])
  const [estado, setEstado] = useState<"cargando" | "form" | "respondida" | "enviada">("cargando")
  const [enviando, setEnviando] = useState(false)
  const [intento, setIntento] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.push("/")
      return
    }
    const jwt = getRoleFromToken(token)
    const rol = (jwt === "student" ? "user" : jwt === "admin" ? "admin" : (jwt || "").replace(/_/g, "-")) as RolNavbar
    setNavRole(rol)
    setHome(homePorRol(jwt))

    let area: string | null = null
    try {
      area = new URLSearchParams(window.location.search).get("rol")
    } catch {}
    setRolArea(area)

    const estadoUrl = area ? `/usabilidad/estado?rol=${encodeURIComponent(area)}` : "/usabilidad/estado"
    Promise.all([api.get(estadoUrl), api.get("/usabilidad/preguntas")])
      .then(([e, p]) => {
        setPreguntas(p.data)
        setRespuestas(new Array(p.data.items.length).fill(null))
        setEstado(e.data.respondida ? "respondida" : "form")
      })
      .catch(() => setEstado("form"))
  }, [router])

  const escala = preguntas
    ? Array.from({ length: preguntas.escala_max - preguntas.escala_min + 1 }, (_, i) => preguntas.escala_min + i)
    : []
  const contestadas = respuestas.filter((r) => r !== null).length
  const total = respuestas.length

  const marcar = (i: number, v: number) => {
    setRespuestas((prev) => {
      const copia = [...prev]
      copia[i] = v
      return copia
    })
  }

  const enviar = () => {
    setIntento(true)
    if (enviando) return
    const faltante = respuestas.findIndex((r) => r === null)
    if (faltante !== -1) {
      document.getElementById(`item-${faltante}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setEnviando(true)
    setError("")
    api
      .post("/usabilidad", { respuestas, ...(rolArea ? { rol: rolArea } : {}) })
      .then(() => setEstado("enviada"))
      .catch((err) => {
        setEnviando(false)
        if (err?.response?.status === 409) setEstado("respondida")
        else setError("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.")
      })
  }

  return (
    <>
      <DashboardNavbar role={navRole} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#16A34A]">
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Encuesta de usabilidad</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold font-heading text-[#1F2937]">
            Ayúdanos a mejorar UnacHealth
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Responde esta encuesta corta sobre tu experiencia con la plataforma. Toma menos de 5 minutos y es anónima en los resultados.
          </p>
        </div>

        {estado === "cargando" && <p className="text-sm text-[#6B7280]">Cargando…</p>}

        {(estado === "respondida" || estado === "enviada") && (
          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-[#F0FDF4]">
              <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#1F2937]">
              {estado === "enviada" ? "¡Gracias por responder!" : "Ya respondiste esta encuesta"}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {estado === "enviada"
                ? "Tu opinión quedó registrada. ¡Nos ayuda muchísimo a mejorar!"
                : "Cada persona responde la encuesta de usabilidad una sola vez."}
            </p>
            <Link
              href={rolArea ? "/dashboard/admin/areas-de-bienestar" : home}
              className="mt-5 inline-flex items-center justify-center h-10 px-5 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              {rolArea ? "Volver a áreas de bienestar" : "Volver al inicio"}
            </Link>
          </div>
        )}

        {estado === "form" && preguntas && (
          <>
            <div className="rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 p-4 mb-5">
              <p className="text-sm text-[#166534]">
                Marca del <span className="font-semibold">1 (totalmente en desacuerdo)</span> al{" "}
                <span className="font-semibold">7 (totalmente de acuerdo)</span> según qué tan de acuerdo estés con cada frase.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {preguntas.items.map((texto, i) => {
                const falta = intento && respuestas[i] === null
                return (
                  <div
                    key={i}
                    id={`item-${i}`}
                    className={`rounded-xl bg-white border shadow-sm p-4 sm:p-5 scroll-mt-24 ${
                      falta ? "border-[#EF4444]" : "border-[#E2E8F0]"
                    }`}
                  >
                    <p className="text-sm font-medium text-[#1F2937]">
                      <span className="text-[#16A34A] font-semibold">{i + 1}.</span> {texto}
                    </p>
                    <div className="mt-3 flex items-stretch justify-between gap-1.5">
                      {escala.map((v) => {
                        const sel = respuestas[i] === v
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => marcar(i, v)}
                            aria-pressed={sel}
                            aria-label={`${v}`}
                            className={`flex-1 h-10 rounded-lg border-2 text-sm font-semibold transition-all ${
                              sel
                                ? "border-[#16A34A] bg-[#16A34A] text-white"
                                : "border-[#E2E8F0] bg-white text-[#6B7280] hover:border-[#16A34A]/50"
                            }`}
                          >
                            {v}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-[#94A3B8]">
                      <span>Totalmente en desacuerdo</span>
                      <span>Totalmente de acuerdo</span>
                    </div>
                    {falta && (
                      <p className="mt-2 text-xs text-[#EF4444] inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Selecciona una opción
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {error && (
              <p className="mt-4 text-sm text-[#EF4444] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}

            <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-[#F8FAFC]/90 backdrop-blur border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#6B7280] tabular-nums">
                  {contestadas} de {total} respondidas
                </span>
                <button
                  type="button"
                  onClick={enviar}
                  disabled={enviando}
                  className="h-11 px-6 rounded-lg text-sm font-semibold text-white shadow-md transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                >
                  {enviando ? "Enviando…" : "Enviar encuesta"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
