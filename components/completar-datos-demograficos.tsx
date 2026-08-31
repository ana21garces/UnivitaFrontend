"use client"

// Bloqueo del dashboard cuando a la cuenta le faltan datos demográficos
// (facultad, programa, tipo de usuario o sexo). Varias cuentas se registraron
// sin estos datos por una caída del servidor; en vez de pedirlos otra vez en el
// seguimiento, se piden apenas la persona entra a la aplicación y son
// obligatorios: no se puede usar el dashboard hasta completarlos.

import { useCallback, useEffect, useMemo, useState } from "react"
import Select from "react-select"
import { AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { facultadOptions, programaOptions, selectStyles } from "@/lib/facultades"

type Perfil = {
  role: string
  facultad: string | null
  program: string | null
  tipo_usuario: string | null
  sexo: string | null
}

const TIPOS = [
  { value: "estudiante", label: "Estudiante" },
  { value: "docente", label: "Docente" },
  { value: "administrativo", label: "Administrativo" },
]

export function CompletarDatosDemograficos() {
  const [estado, setEstado] = useState<"cargando" | "ok" | "falta">("cargando")

  // Qué faltaba en el perfil original (define qué se pregunta).
  const [faltaSexo, setFaltaSexo] = useState(false)
  const [faltaTipo, setFaltaTipo] = useState(false)
  const [faltaFacultad, setFaltaFacultad] = useState(false)
  const [faltaPrograma, setFaltaPrograma] = useState(false)

  // Valores del formulario.
  const [sexo, setSexo] = useState<string>("")
  const [tipo, setTipo] = useState<string>("")
  const [facultad, setFacultad] = useState<string>("")
  const [programa, setPrograma] = useState<string>("")

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [intento, setIntento] = useState(false)

  useEffect(() => {
    let vivo = true
    api
      .get("/users/me")
      .then((res) => {
        if (!vivo) return
        const p = res.data as Perfil
        // Solo aplica a estudiantes: los perfiles profesionales no tienen
        // facultad ni la necesitan.
        if (p.role !== "student") {
          setEstado("ok")
          return
        }
        const sinTipo = !p.tipo_usuario
        const esAdmin = p.tipo_usuario === "administrativo"
        const sinSexo = !p.sexo
        const sinFacultad = !p.facultad && !esAdmin
        const sinPrograma = !p.program && !esAdmin

        if (!sinSexo && !sinTipo && !sinFacultad && !sinPrograma) {
          setEstado("ok")
          return
        }
        setFaltaSexo(sinSexo)
        setFaltaTipo(sinTipo)
        setFaltaFacultad(!p.facultad) // si además falta el tipo, se decide por el tipo elegido
        setFaltaPrograma(!p.program)
        setTipo(p.tipo_usuario ?? "")
        setFacultad(p.facultad ?? "")
        setPrograma(p.program ?? "")
        setSexo(p.sexo ?? "")
        setEstado("falta")
      })
      .catch(() => {
        // Si no se pudo leer el perfil, no bloqueamos: el dashboard sigue.
        if (vivo) setEstado("ok")
      })
    return () => {
      vivo = false
    }
  }, [])

  const tipoEfectivo = faltaTipo ? tipo : tipo || "estudiante"
  const esAdministrativo = tipoEfectivo === "administrativo"

  // Facultad/Programa se piden solo si faltaban y el tipo no es administrativo.
  const pedirFacultad = faltaFacultad && !esAdministrativo
  const pedirPrograma = faltaPrograma && !esAdministrativo

  const listo = useMemo(() => {
    if (faltaSexo && !sexo) return false
    if (faltaTipo && !tipo) return false
    if (pedirFacultad && !facultad) return false
    if (pedirPrograma && !programa) return false
    return true
  }, [faltaSexo, sexo, faltaTipo, tipo, pedirFacultad, facultad, pedirPrograma, programa])

  const enviar = useCallback(() => {
    setIntento(true)
    if (!listo || enviando) return
    setEnviando(true)
    setError("")

    const payload: Record<string, string> = {}
    if (faltaSexo) payload.sexo = sexo
    if (faltaTipo) payload.tipo_usuario = tipo
    if (pedirFacultad) payload.facultad = facultad
    if (pedirPrograma) payload.program = programa

    api
      .patch("/users/me/datos-demograficos", payload)
      .then(() => {
        // Recargar para que todas las vistas del dashboard tomen los datos
        // nuevos (clasificación por facultad, autoexamen por sexo, etc.).
        window.location.reload()
      })
      .catch(() => {
        setEnviando(false)
        setError("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.")
      })
  }, [listo, enviando, faltaSexo, sexo, faltaTipo, tipo, pedirFacultad, facultad, pedirPrograma, programa])

  if (estado !== "falta") return null

  const req = (falta: boolean, valor: string) =>
    intento && falta && !valor ? (
      <span className="ml-2 text-xs text-[#EF4444] font-normal inline-flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Requerido
      </span>
    ) : null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completar-datos-titulo"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 id="completar-datos-titulo" className="text-lg font-bold font-heading text-[#1F2937]">
          Completa tus datos
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Faltan algunos datos de tu registro. Los usamos solo para los análisis generales.
          Complétalos para continuar.
        </p>

        <div className="mt-5 flex flex-col gap-5">
          {faltaSexo && (
            <fieldset>
              <legend className="text-sm font-medium text-[#1F2937] mb-2">
                Sexo {req(faltaSexo, sexo)}
              </legend>
              <div className="flex gap-3">
                {["masculino", "femenino"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSexo(opt)}
                    aria-pressed={sexo === opt}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium capitalize transition-all cursor-pointer ${
                      sexo === opt
                        ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                        : "border-[#E2E8F0] bg-white text-[#6B7280] hover:border-[#16A34A]/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {faltaTipo && (
            <fieldset>
              <legend className="text-sm font-medium text-[#1F2937] mb-2">
                Tipo de usuario {req(faltaTipo, tipo)}
              </legend>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    aria-pressed={tipo === t.value}
                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                      tipo === t.value
                        ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                        : "border-[#E2E8F0] bg-white text-[#6B7280] hover:border-[#16A34A]/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {pedirFacultad && (
            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-2">
                Facultad {req(pedirFacultad, facultad)}
              </label>
              <Select
                instanceId="completar-facultad"
                options={facultadOptions}
                value={facultadOptions.find((f) => f.value === facultad) || null}
                onChange={(sel) => {
                  setFacultad(sel?.value || "")
                  setPrograma("")
                }}
                placeholder="Seleccione una facultad"
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          )}

          {pedirPrograma && (
            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-2">
                Programa {req(pedirPrograma, programa)}
              </label>
              <Select
                instanceId="completar-programa"
                options={programaOptions(facultad)}
                value={programaOptions(facultad).find((p) => p.value === programa) || null}
                onChange={(sel) => setPrograma(sel?.value || "")}
                placeholder="Seleccione un programa"
                isDisabled={!facultad}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-[#EF4444] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <button
          type="button"
          onClick={enviar}
          disabled={enviando}
          className="mt-6 w-full h-11 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          {enviando ? "Guardando…" : "Guardar y continuar"}
        </button>
      </div>
    </div>
  )
}
