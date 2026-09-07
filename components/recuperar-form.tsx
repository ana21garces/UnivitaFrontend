"use client"

import { useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { UniVitaLogo } from "@/components/univita-logo"

// Recuperación de contraseña en modo directo (sin código por correo):
// 1) se verifica que el correo exista, 2) se escribe la nueva contraseña.
export function RecuperarForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const iconBox =
    "absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg bg-[#EAF3DE]"
  const iconInner = "w-4 h-4 text-[#16A34A]"
  const inputBase =
    "w-full h-11 pl-12 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
  const submitBtn =
    "w-full h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"

  // Paso 1: comprobar que el correo esté registrado.
  const handleVerificarCorreo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo válido, por ejemplo: nombre@dominio.com")
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post("/auth/verificar-correo", { email })
      if (data.existe) {
        setStep(2)
      } else {
        setError("No encontramos una cuenta con ese correo.")
      }
    } catch {
      setError("No pudimos verificar el correo. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Paso 2: guardar la nueva contraseña.
  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/restablecer-clave", {
        email,
        new_password: password,
        confirm_password: confirmPassword,
      })
      setStep(3)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      let msg = "No pudimos actualizar la contraseña. Inténtalo de nuevo."
      if (Array.isArray(detail)) msg = detail[0]?.msg ?? msg
      else if (typeof detail === "string") msg = detail
      msg = msg.replace(/^Value error,\s*/i, "")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-md">
      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-3">
        <UniVitaLogo size="md" />
        <div className="text-center">
          <h1 className="text-[26px] font-bold font-heading text-[#1F2937]">
            Unac<span className="text-[#16A34A]">Health</span>
          </h1>
          <p className="mt-1 text-md text-[#6B7280]">
            Pequeños hábitos, grandes cambios.
          </p>
        </div>
      </div>

      {/* Paso 1: verificar correo */}
      {step === 1 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Recuperar contraseña
            </h2>
            <p className="mt-1 text-md text-[#6B7280]">
              Escribe tu correo para continuar.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleVerificarCorreo}>
            {error && (
              <div className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-email" className="text-sm font-medium text-[#1F2937]">
                Correo institucional
              </label>
              <div className="relative">
                <div className={iconBox}>
                  <Mail className={iconInner} />
                </div>
                <input
                  id="rec-email"
                  type="email"
                  placeholder="tu.nombre@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${inputBase} pr-4`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={submitBtn}
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </form>
        </>
      )}

      {/* Paso 2: nueva contraseña */}
      {step === 2 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Nueva contraseña
            </h2>
            <p className="mt-1 text-md text-[#6B7280]">
              Crea una contraseña para <span className="font-medium text-[#1F2937]">{email}</span>
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleRestablecer}>
            {error && (
              <div className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-password" className="text-sm font-medium text-[#1F2937]">
                Nueva contraseña
              </label>
              <div className="relative">
                <div className={iconBox}>
                  <Lock className={iconInner} />
                </div>
                <input
                  id="rec-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-confirm" className="text-sm font-medium text-[#1F2937]">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className={iconBox}>
                  <Lock className={iconInner} />
                </div>
                <input
                  id="rec-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={submitBtn}
              style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
            >
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("")
                setStep(1)
              }}
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Usar otro correo
            </button>
          </form>
        </>
      )}

      {/* Paso 3: éxito */}
      {step === 3 && (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#EAF3DE]">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              Contraseña actualizada
            </h2>
            <p className="mt-1 text-md text-[#6B7280]">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full h-11 flex items-center justify-center rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            Ir a iniciar sesión
          </Link>
        </div>
      )}

      {/* Volver al login */}
      {step !== 3 && (
        <p className="text-center text-sm text-[#6B7280]">
          ¿Recordaste tu contraseña?{" "}
          <Link
            href="/login"
            className="relative font-semibold text-[#16A34A] transition-colors
            after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0
            after:bg-[#16A34A] after:transition-all after:duration-300
            hover:after:w-full pb-1"
          >
            Inicia sesión
          </Link>
        </p>
      )}
    </div>
  )
}
