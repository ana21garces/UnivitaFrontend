"use client"

import { useRef, useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { ArrowLeft, ChevronDown, ChevronUp, Printer, AlertCircle, BookOpen, BookHeart } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { TarjetaSeguimiento, NivelChip } from "@/components/tarjeta-seguimiento"
import { SeguimientoControles } from "@/components/seguimiento-controles"
import type {
  SeguimientoRecomendacion,
  TarjetaConSeguimiento,
  TarjetasSeguimientoResponse,
} from "@/lib/seguimiento-recomendaciones"

// ── Hoja de trabajo interactiva (Tipo B) ───────────────────────────────────

function HojaDeTrabajoModal({ onClose }: { onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null)
  const [nombre, setNombre] = useState("")
  const [identidad, setIdentidad] = useState("")
  const [habDiarios, setHabDiarios] = useState<string[][]>(
    Array.from({ length: 7 }, () => ["", ""])
  )
  const [habSuman, setHabSuman] = useState<string[]>(Array(8).fill(""))
  const [habRestan, setHabRestan] = useState<string[]>(Array(7).fill(""))
  const [creencias, setCreencias] = useState("")

  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-start justify-center pt-8 pb-16 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]" style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)" }}>
          <div>
            <h2 className="text-white font-bold text-lg">Cuadro de Hábitos con Identidad</h2>
            <p className="text-white/80 text-sm">Hoja de trabajo interactiva</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Cerrar ✕
            </button>
          </div>
        </div>

        {/* Contenido de la hoja */}
        <div ref={printRef} className="px-6 py-6 flex flex-col gap-6">

          {/* 1. Nombre */}
          <section>
            <label className="text-sm font-bold text-[#1F2937]">Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              className="ml-3 border-b border-[#CBD5E1] text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] bg-transparent w-56"
            />
          </section>

          {/* 2. Mi identidad */}
          <section>
            <h3 className="text-sm font-bold text-[#1F2937] mb-1">Mi identidad</h3>
            <p className="text-xs text-[#6B7280] mb-2">
              Escribe cómo te gustaría que las personas te describieran dentro de un año. Piensa en tus valores, tu carácter y tus metas.
            </p>
            <textarea
              value={identidad}
              onChange={(e) => setIdentidad(e.target.value)}
              rows={5}
              placeholder="Escribe aquí..."
              className="w-full border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
            />
          </section>

          {/* 3. Registro de hábitos diarios */}
          <section>
            <h3 className="text-sm font-bold text-[#1F2937] mb-1">Registro de hábitos diarios</h3>
            <p className="text-xs text-[#6B7280] mb-3">A continuación escribirás una lista de tus hábitos diarios.</p>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#E2E8F0] rounded-lg text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <tbody>
                  {habDiarios.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`border border-[#E2E8F0] p-0 ${ci === 0 ? "w-1/2" : "w-1/2"}`}>
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const next = habDiarios.map((r) => [...r])
                              next[ri][ci] = e.target.value
                              setHabDiarios(next)
                            }}
                            placeholder={`Hábito ${ri * 2 + ci + 1}`}
                            className="w-full px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:bg-[#F0FDF4] bg-transparent"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Hábitos que me suman */}
          <section>
            <h3 className="text-sm font-bold text-[#16A34A] mb-1">Hábitos que me suman</h3>
            <p className="text-xs text-[#6B7280] mb-3">Escribe los hábitos que te ayudan a ser esa persona que sueñas ser.</p>
            <div className="flex flex-col gap-2">
              {habSuman.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#16A34A] w-5 shrink-0">{i + 1}.</span>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const next = [...habSuman]; next[i] = e.target.value; setHabSuman(next)
                    }}
                    placeholder="Escribe el hábito..."
                    className="flex-1 border-b border-[#CBD5E1] py-1 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] bg-transparent"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 5. Hábitos que me restan */}
          <section>
            <h3 className="text-sm font-bold text-red-600 mb-1">Hábitos que me restan</h3>
            <p className="text-xs text-[#6B7280] mb-3">Piensa en las costumbres o acciones que te hacen perder tiempo, energía o enfoque.</p>
            <div className="flex flex-col gap-2">
              {habRestan.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-500 w-5 shrink-0">{i + 1}.</span>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const next = [...habRestan]; next[i] = e.target.value; setHabRestan(next)
                    }}
                    placeholder="Escribe el hábito..."
                    className="flex-1 border-b border-[#CBD5E1] py-1 text-sm text-[#1F2937] focus:outline-none focus:border-red-300 bg-transparent"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 6. Creencias limitantes */}
          <section>
            <h3 className="text-sm font-bold text-[#1F2937] mb-2">
              <span className="font-bold">Creencias limitantes:</span>
            </h3>
            <textarea
              value={creencias}
              onChange={(e) => setCreencias(e.target.value)}
              rows={4}
              placeholder="Escribe aquí las creencias que te limitan..."
              className="w-full border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#1F2937] focus:outline-none focus:border-[#16A34A] resize-none"
            />
          </section>

        </div>
      </div>
    </div>
  )
}

// ── Tarjeta tipo B (pregunta 6, Moderado): hoja de trabajo + seguimiento ───

function TarjetaConHoja({
  item,
  onUpdate,
}: {
  item: TarjetaConSeguimiento
  onUpdate: (nuevo: SeguimientoRecomendacion) => void
}) {
  const { tarjeta, seguimiento } = item
  const [open, setOpen] = useState(true)
  const [hojaOpen, setHojaOpen] = useState(false)

  return (
    <>
      <div className="rounded-2xl border-2 border-[#16A34A]/40 bg-white shadow-sm overflow-hidden">
        <button
          className="w-full flex items-start justify-between px-5 py-4 hover:bg-[#F0FDF4] transition-colors text-left"
          onClick={() => setOpen(!open)}
        >
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <NivelChip nivel={tarjeta.nivel} />
              <span className="text-[10px] font-semibold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#16A34A]/30">
                Hoja interactiva
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mb-1">Pregunta {tarjeta.pregunta_num} · {tarjeta.pregunta_texto}</p>
            <h3 className="text-base font-bold text-[#1F2937]">{tarjeta.tecnica}</h3>
          </div>
          {open
            ? <ChevronUp className="w-5 h-5 text-[#6B7280] shrink-0 mt-1" />
            : <ChevronDown className="w-5 h-5 text-[#6B7280] shrink-0 mt-1" />
          }
        </button>

        {open && (
          <div className="px-5 pb-5 border-t border-[#16A34A]/20">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">Instrucciones</p>
            <ol className="flex flex-col gap-2 mb-5">
              {tarjeta.instrucciones.map((paso, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#374151]">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F0FDF4] text-[#16A34A] font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{paso}</span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => setHojaOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
              style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)" }}
            >
              <BookOpen className="w-4 h-4" />
              Abrir hoja de trabajo
            </button>

            <SeguimientoControles tarjeta={tarjeta} seguimiento={seguimiento} onUpdate={onUpdate} />
          </div>
        )}
      </div>

      {hojaOpen && <HojaDeTrabajoModal onClose={() => setHojaOpen(false)} />}
    </>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function PlanSemanalPage() {
  const router = useRouter()
  const [data, setData] = useState<TarjetasSeguimientoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/"); return }

    api
      .get("/seguimiento-recomendaciones/psicologia-positiva/tarjetas")
      .then((res) => setData(res.data))
      .catch((err) => {
        if (redirigirPorError(err, router)) return
        setError("No se pudo cargar el plan. Intenta de nuevo más tarde.")
      })
      .finally(() => setLoading(false))
  }, [router])

  const actualizarSeguimiento = (nuevo: SeguimientoRecomendacion) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            tarjetas: prev.tarjetas.map((t) =>
              t.seguimiento.id === nuevo.id ? { ...t, seguimiento: nuevo } : t
            ),
          }
        : prev
    )
  }

  const esTipoB = (item: TarjetaConSeguimiento) =>
    item.tarjeta.pregunta_num === 6 && item.tarjeta.nivel === "MODERADO"

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="user" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/user"
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] flex items-center justify-center">
              <BookHeart className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#1F2937]">Psicología Positiva</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">Recomendaciones personalizadas</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-sm font-bold text-[#1F2937]">{Math.round(data.indice_dimension)}%</p>
                <p className="text-[10px] text-[#6B7280]">Porcentaje del nivel</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-sm font-bold text-[#1F2937]">{data.nivel_dimension}</p>
                <p className="text-[10px] text-[#6B7280]">Nivel</p>
              </div>
            </div>
          )}
        </div>

        {/* Carga / error */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tarjetas */}
        {!loading && !error && data && (
          <>
            {data.tarjetas.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <p className="text-sm">No hay recomendaciones disponibles.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.tarjetas.map((item) =>
                  esTipoB(item)
                    ? (
                      <TarjetaConHoja key={item.seguimiento.id} item={item} onUpdate={actualizarSeguimiento} />
                    )
                    : (
                      <TarjetaSeguimiento
                        key={item.seguimiento.id}
                        tarjeta={item.tarjeta}
                        seguimiento={item.seguimiento}
                        onUpdate={actualizarSeguimiento}
                      />
                    )
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
