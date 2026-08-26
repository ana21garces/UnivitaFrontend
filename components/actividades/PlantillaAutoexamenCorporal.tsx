"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import {
  InfografiaAutoexamenMamas,
  InfografiaSenalesAlarmaMamas,
  InfografiaAutoexamenTesticular,
} from "@/components/actividades/InfografiasAutoexamen"

type Sexo = "masculino" | "femenino" | null

export function PlantillaAutoexamenCorporal({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  const [sexo, setSexo] = useState<Sexo>(null)
  const [hallazgo, setHallazgo] = useState<"si" | "no" | null>(null)
  const [descripcion, setDescripcion] = useState("")

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setSexo(res.data.sexo === "masculino" || res.data.sexo === "femenino" ? res.data.sexo : null))
      .catch(() => setSexo(null))
  }, [])

  const listo = hallazgo === "no" || (hallazgo === "si" && descripcion.trim().length > 0)

  const enviar = () => {
    if (hallazgo === "no") {
      onEnviar("Autoexamen realizado. Sin cambios.")
    } else {
      onEnviar(`Autoexamen realizado. Hallazgo: ${descripcion.trim()}. Pendiente consultar al médico.`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {(sexo === "femenino" || sexo === null) && (
          <>
            <InfografiaAutoexamenMamas />
            <InfografiaSenalesAlarmaMamas />
          </>
        )}
        {(sexo === "masculino" || sexo === null) && <InfografiaAutoexamenTesticular />}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#6B7280]">¿Notaste algo diferente al examinarte?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHallazgo("no")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              hallazgo === "no" ? "bg-[#16A34A] text-white border-transparent" : "border-[#E2E8F0] text-[#374151]"
            }`}
          >
            No, todo normal
          </button>
          <button
            type="button"
            onClick={() => setHallazgo("si")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              hallazgo === "si" ? "bg-amber-500 text-white border-transparent" : "border-[#E2E8F0] text-[#374151]"
            }`}
          >
            Sí, encontré algo
          </button>
        </div>
      </div>

      {hallazgo === "si" && (
        <div className="flex flex-col gap-1.5">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            placeholder="Describe qué encontraste (dónde, cómo se siente, hace cuánto)"
            className="w-full border border-amber-300 rounded-lg p-2 text-sm text-[#1F2937] focus:outline-none focus:border-amber-500 resize-none"
          />
          <p className="flex items-center gap-1.5 text-xs text-amber-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Recuerda consultar este hallazgo con tu médico.
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={enviando || !listo}
        onClick={enviar}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "Guardar"}
      </button>
    </div>
  )
}
