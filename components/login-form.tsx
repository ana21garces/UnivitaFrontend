"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { XpProgressBar } from "@/components/xp-progress-bar"
import { UniVitaLogo } from "@/components/univita-logo"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      // Guardar tokens
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)

      // Verificar si el usuario ya completó la encuesta
      try {
        const { data: estado } = await axios.get(`${API_URL}/encuesta/estado`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (estado.completada) {
          document.cookie = "univita8_survey_done=true; path=/; max-age=31536000"
          router.push("/dashboard/user")
        } else {
          document.cookie = "univita8_survey_done=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          router.push("/onboarding/survey")
        }
      } catch {
        // Si falla la verificación, manda a la encuesta por defecto
        router.push("/onboarding/survey")
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Credenciales inválidas")
      } else {
        setError(detail || "Credenciales inválidas")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-md">
      {/* XP indicator at top */}
      <div className="px-1">
        <XpProgressBar currentXp={0} maxXp={100} level={1} />
      </div>

      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-3">
        <UniVitaLogo size="md" />
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-[#1F2937]">
            VitalUNAC
          </h1>
          <p className="mt-1 text-md text-[#6B7280]">
            Plataforma gamificada de estilo de vida saludable para estudiantes universitarios
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-[#1F2937]">
            Correo institucional
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
            <input
              id="login-email"
              type="email"
              placeholder="tu.nombre@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-[#1F2937]">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-11 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="#"
            className="relative text-sm font-medium text-[#16A34A] transition-colors
            after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 
            after:bg-[#16A34A] after:transition-all after:duration-300
            hover:after:w-full"
          >
            Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesion"}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-[#6B7280]">
        No tienes cuenta?{" "}
        <Link
          href="/register"
          className="relative font-semibold text-[#16A34A] transition-colors
          after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0
          after:bg-[#16A34A] after:transition-all after:duration-300
          hover:after:w-full pb-1"
        >
          Registrate aqui
        </Link>
      </p>
    </div>
  )
}
