import { CalendarCheck, Eye, MoveUpRight, Hand, BedDouble, CheckCircle2, AlertTriangle } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

// ── Diagrama base de mama (par de siluetas) ────────────────────────────────
// Silueta propia (no la foto externa): dos "domos" apoyados en una línea
// base, con pezón, para poder marcar encima cada señal de alarma.

const CYAN_LINE = "#0891B2"
const CYAN_FILL = "#ECFEFF"

function Domo({ cx, r, fill, strokeDasharray }: { cx: number; r: number; fill: string; strokeDasharray?: string }) {
  const left = cx - r
  const right = cx + r
  const top = 34 - r
  return (
    <path
      d={`M ${left} 34 C ${left} ${top + r * 0.3}, ${cx - r * 0.55} ${top}, ${cx} ${top} C ${cx + r * 0.55} ${top}, ${right} ${top + r * 0.3}, ${right} 34 Z`}
      fill={fill}
      stroke={CYAN_LINE}
      strokeWidth="1.6"
      strokeDasharray={strokeDasharray}
    />
  )
}

type VarianteSeno =
  | "protuberancias"
  | "venas"
  | "hendiduras"
  | "bulto_interno"
  | "erosiones"
  | "hundimiento_pezon"
  | "piel_anaranjada"
  | "enrojecimiento"
  | "huecos"
  | "asimetria"
  | "fluidos"
  | "endurecimiento"

function SenalMamaIcono({ variante, className }: { variante: VarianteSeno; className?: string }) {
  const rIzq = variante === "asimetria" ? 14 : 16
  const rDer = variante === "asimetria" ? 17 : 16
  const cxIzq = 30
  const cxDer = 30 + rIzq + rDer - 1

  return (
    <svg viewBox="0 0 90 40" className={className} fill="none">
      <line x1="4" y1="34" x2="86" y2="34" stroke={CYAN_LINE} strokeWidth="1.6" strokeLinecap="round" />

      <Domo cx={cxIzq} r={rIzq} fill={variante === "endurecimiento" ? "#94A3B8" : CYAN_FILL} />
      <Domo
        cx={cxDer}
        r={rDer}
        fill={variante === "enrojecimiento" || variante === "piel_anaranjada" ? "#FDBA74" : CYAN_FILL}
      />

      {/* Pezones, salvo donde la variante los reemplaza */}
      {variante !== "hundimiento_pezon" && variante !== "fluidos" && (
        <>
          <circle cx={cxIzq} cy="26" r="2" fill={CYAN_LINE} />
          <circle cx={cxDer} cy="26" r="2" fill={CYAN_LINE} />
        </>
      )}

      {variante === "protuberancias" && <circle cx={cxIzq + 9} cy="16" r="4" fill="none" stroke={CYAN_LINE} strokeWidth="1.6" />}

      {variante === "venas" && (
        <path
          d={`M ${cxDer - 8} 30 Q ${cxDer - 4} 20 ${cxDer} 24 T ${cxDer + 6} 12`}
          fill="none"
          stroke="#7C3AED"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      )}

      {variante === "hendiduras" && (
        <path d={`M ${cxIzq + 6} 14 L ${cxIzq + 10} 20 L ${cxIzq + 5} 20`} fill="#FFFFFF" stroke={CYAN_LINE} strokeWidth="1.2" />
      )}

      {variante === "bulto_interno" && (
        <circle cx={cxDer - 2} cy="20" r="4" fill="none" stroke={CYAN_LINE} strokeWidth="1.4" strokeDasharray="2 2" />
      )}

      {variante === "erosiones" && (
        <>
          <circle cx={cxIzq - 6} cy="18" r="1.1" fill={CYAN_LINE} />
          <circle cx={cxIzq + 2} cy="14" r="1.1" fill={CYAN_LINE} />
          <circle cx={cxIzq - 2} cy="23" r="1.1" fill={CYAN_LINE} />
        </>
      )}

      {variante === "hundimiento_pezon" && (
        <>
          <circle cx={cxIzq} cy="26" r="2" fill={CYAN_LINE} />
          <circle cx={cxDer} cy="26" r="2.2" fill="none" stroke={CYAN_LINE} strokeWidth="1.2" />
          <circle cx={cxDer} cy="26" r="0.6" fill={CYAN_LINE} />
        </>
      )}

      {variante === "enrojecimiento" && (
        <>
          <path d={`M ${cxDer - 10} 10 l 2 -3`} stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
          <path d={`M ${cxDer} 8 l 1.5 -3`} stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
          <path d={`M ${cxDer + 9} 11 l 2 -2.5`} stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}

      {variante === "huecos" && (
        <>
          <circle cx={cxIzq - 5} cy="20" r="1.6" fill="none" stroke={CYAN_LINE} strokeWidth="1" />
          <circle cx={cxIzq + 4} cy="16" r="1.6" fill="none" stroke={CYAN_LINE} strokeWidth="1" />
        </>
      )}

      {variante === "fluidos" && (
        <>
          <circle cx={cxDer} cy="26" r="2" fill={CYAN_LINE} />
          <path
            d={`M ${cxDer} 28 q -1.4 3 0 5.5 q 1.4 -2.5 0 -5.5`}
            fill="#0891B2"
            opacity="0.6"
          />
        </>
      )}
    </svg>
  )
}

// ── Diagrama base testicular ────────────────────────────────────────────────

type VarianteTesticulo = "sujeta" | "gira" | "familiarizate" | "busca"

function TesticuloIcono({ variante, className }: { variante: VarianteTesticulo; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <path
        d="M30 12 C42 12 48 24 48 34 C48 46 40 52 30 52 C20 52 12 46 12 34 C12 24 18 12 30 12 Z"
        fill={CYAN_FILL}
        stroke={CYAN_LINE}
        strokeWidth="1.8"
      />

      {variante === "sujeta" && (
        <>
          <path d="M6 34 Q12 26 18 30" fill="none" stroke={CYAN_LINE} strokeWidth="2" strokeLinecap="round" />
          <path d="M54 34 Q48 26 42 30" fill="none" stroke={CYAN_LINE} strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {variante === "gira" && (
        <path
          d="M46 20 A20 20 0 1 1 28 12"
          fill="none"
          stroke="#0891B2"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#flecha)"
        />
      )}
      {variante === "gira" && (
        <defs>
          <marker id="flecha" markerWidth="6" markerHeight="6" refX="2" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" fill={CYAN_LINE} />
          </marker>
        </defs>
      )}

      {variante === "familiarizate" && (
        <path
          d="M20 16 Q30 8 40 16 Q34 20 38 26"
          fill="none"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      {variante === "busca" && (
        <>
          <circle cx="38" cy="30" r="3" fill="none" stroke={CYAN_LINE} strokeWidth="1.4" />
          <circle cx="44" cy="42" r="6" fill="none" stroke="#374151" strokeWidth="1.6" />
          <line x1="48.2" y1="46.2" x2="53" y2="51" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ── Tarjeta de paso reutilizable ─────────────────────────────────────────────

function PasoCard({
  numero,
  icono: Icono,
  titulo,
  children,
}: {
  numero: number
  icono: ComponentType<{ className?: string }>
  titulo: string
  children: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px] shrink-0">
          {numero}
        </span>
        <Icono className="w-4 h-4 text-[#16A34A] shrink-0" />
        <p className="text-xs font-bold text-[#1F2937]">{titulo}</p>
      </div>
      <p className="text-xs text-[#6B7280] leading-relaxed">{children}</p>
    </div>
  )
}

function PasoCardIlustrado({
  numero,
  diagrama,
  titulo,
  children,
}: {
  numero: number
  diagrama: ReactNode
  titulo: string
  children: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px] shrink-0">
          {numero}
        </span>
        <p className="text-xs font-bold text-[#1F2937]">{titulo}</p>
      </div>
      <div className="w-full h-14 flex items-center justify-center">{diagrama}</div>
      <p className="text-xs text-[#6B7280] leading-relaxed">{children}</p>
    </div>
  )
}

export function InfografiaAutoexamenMamas() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p className="text-sm font-bold text-[#1F2937] mb-1">Autoexamen de mamas</p>
      <p className="text-xs text-[#6B7280] mb-3">
        Escoge un día al mes, practícalo una vez al mes. 5 minutos pueden salvar tu vida.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <PasoCard numero={1} icono={CalendarCheck} titulo="Fija una fecha">
          Elige una fecha, al menos 10 días pre o post período menstrual, y conviértelo en un hábito mensual.
        </PasoCard>
        <PasoCard numero={2} icono={Eye} titulo="Observa">
          Frente a un espejo, con los brazos a los costados, mira si alguna mama está deforme, con cambios de color,
          textura, o si el pezón está hundido o desviado.
        </PasoCard>
        <PasoCard numero={3} icono={MoveUpRight} titulo="Inclinación y brazos extendidos">
          Inclínate levemente hacia adelante y busca los mismos signos; repite con los brazos extendidos hacia
          arriba.
        </PasoCard>
        <PasoCard numero={4} icono={Hand} titulo="Masajea el área">
          Con las yemas de los dedos, masajea en movimientos circulares desde la axila hasta el pezón, buscando
          irregularidades.
        </PasoCard>
        <PasoCard numero={5} icono={BedDouble} titulo="Examen recostada">
          Repite todos los pasos anteriores recostada, con un brazo extendido y masajeando con las yemas de los
          dedos.
        </PasoCard>
        <PasoCard numero={6} icono={CheckCircle2} titulo="Terminando de explorar">
          Finaliza apretando levemente el pezón y fíjate si secreta algún líquido anormal.
        </PasoCard>
      </div>
    </div>
  )
}

const SENALES_ALARMA_MAMAS: { label: string; variante: VarianteSeno }[] = [
  { label: "Protuberancias", variante: "protuberancias" },
  { label: "Venas crecientes", variante: "venas" },
  { label: "Hendiduras", variante: "hendiduras" },
  { label: "Bulto interno", variante: "bulto_interno" },
  { label: "Erosiones en la piel", variante: "erosiones" },
  { label: "Hundimiento del pezón", variante: "hundimiento_pezon" },
  { label: "Piel anaranjada", variante: "piel_anaranjada" },
  { label: "Enrojecimiento y ardor", variante: "enrojecimiento" },
  { label: "Huecos", variante: "huecos" },
  { label: "Asimetría", variante: "asimetria" },
  { label: "Fluidos desconocidos", variante: "fluidos" },
  { label: "Endurecimiento", variante: "endurecimiento" },
]

export function InfografiaSenalesAlarmaMamas() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-sm font-bold text-[#1F2937]">Una detección a tiempo salva tu vida</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SENALES_ALARMA_MAMAS.map(({ label, variante }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2 py-2.5"
          >
            <SenalMamaIcono variante={variante} className="w-14 h-7" />
            <p className="text-center text-[10.5px] font-semibold text-[#374151] leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InfografiaAutoexamenTesticular() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p className="text-sm font-bold text-[#1F2937] mb-1">Autoexamen testicular</p>
      <p className="text-xs text-[#6B7280] mb-3">Hazlo una vez al mes, de preferencia durante o después de un baño.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <PasoCardIlustrado numero={1} diagrama={<TesticuloIcono variante="sujeta" className="w-14 h-14" />} titulo="Sujeta">
          Usa ambas manos para agarrar un testículo a la vez. Es mejor hacerlo durante o después de un baño.
        </PasoCardIlustrado>
        <PasoCardIlustrado numero={2} diagrama={<TesticuloIcono variante="gira" className="w-14 h-14" />} titulo="Gira">
          Gira el testículo entre los dedos de ambas manos, aplicando una leve presión.
        </PasoCardIlustrado>
        <PasoCardIlustrado
          numero={3}
          diagrama={<TesticuloIcono variante="familiarizate" className="w-14 h-14" />}
          titulo="Familiarízate"
        >
          Reconoce el cordón espermático, el epidídimo y las estructuras tubulares conectadas a la parte posterior de
          cada testículo.
        </PasoCardIlustrado>
        <PasoCardIlustrado numero={4} diagrama={<TesticuloIcono variante="busca" className="w-14 h-14" />} titulo="Busca cambios">
          Busca bultos, cambios de tamaño o irregularidades. Es normal que un testículo sea un poco más grande que el
          otro.
        </PasoCardIlustrado>
      </div>
    </div>
  )
}
