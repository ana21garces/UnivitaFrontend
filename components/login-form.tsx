"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react"
import { UniVitaLogo } from "@/components/univita-logo"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, getRoleFromToken, setSurveyDone } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Roles que no pasan por la encuesta: entran directo a su vista.
// Las claves son el `role` del JWT que emite el backend.
const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard/admin",
  capellan: "/dashboard/capellan",
  actividad_fisica: "/dashboard/actividad-fisica",
  responsabilidad_salud: "/dashboard/responsabilidad-salud",
};

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("registro") === "exitoso") {
      setJustRegistered(true)
      // Limpiamos la marca de la URL para que el mensaje no reaparezca al recargar
      params.delete("registro")
      const query = params.toString()
      window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""))
    }
  }, [])

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
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)

      const role = getRoleFromToken(data.access_token)
      const home = role ? ROLE_HOME[role] : undefined

      // Roles profesionales: van directo a su vista sin pasar por la encuesta
      if (home) {
        setSurveyDone(true)
        router.push(home)
        return
      }

      // Verificar si el usuario ya completó la encuesta
      try {
        const { data: estado } = await axios.get(`${API_URL}/encuesta/estado`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (estado.completada) {
          setSurveyDone(true)
          router.push("/dashboard/user")
        } else {
          setSurveyDone(false)
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
      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-3">
        <UniVitaLogo size="md" />
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-[#1F2937]">
            UnacHealth
          </h1>
          <p className="mt-1 text-md text-[#6B7280]">
            Pequeños hábitos, grandes cambios...
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

        {/* Success message after registration */}
        {justRegistered && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-[#15803D]">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Cuenta creada. Ahora inicia sesión.</span>
          </div>
        )}

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
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-11 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
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

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="#"
            className="relative text-sm font-medium text-[#16A34A] transition-colors
            after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 
            after:bg-[#16A34A] after:transition-all after:duration-300
            hover:after:w-full"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-[#6B7280]">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="relative font-semibold text-[#16A34A] transition-colors
          after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0
          after:bg-[#16A34A] after:transition-all after:duration-300
          hover:after:w-full pb-1"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
