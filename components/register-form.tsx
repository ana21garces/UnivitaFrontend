"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import {
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
  User,
  HeartPulse,
  Shield,
  Award,
  Info,
} from "lucide-react"
import { XpProgressBar } from "@/components/xp-progress-bar"
import { UniVitaLogo } from "@/components/univita-logo"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      })

      // Guardar tokens
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)

      router.push("/")
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Error al registrarse")
      } else {
        setError(detail || "Error al registrarse")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      {/* XP indicator at top */}
      <div className="px-1">
        <XpProgressBar currentXp={0} maxXp={100} level={1} />
      </div>

      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-3">
        <UniVitaLogo size="md" />
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-[#1F2937]">
            Crear tu cuenta
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Unete a la comunidad UniVita 8
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

        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-name" className="text-sm font-medium text-[#1F2937]">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
            <input
              id="register-name"
              type="text"
              placeholder="Juan Perez Garcia"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-email" className="text-sm font-medium text-[#1F2937]">
            Correo institucional
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
            <input
              id="register-email"
              type="email"
              placeholder="tu.nombre@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
            />
          </div>
        </div>

        {/* Passwords row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-sm font-medium text-[#1F2937]">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-11 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-confirm" className="text-sm font-medium text-[#1F2937]">
              Confirmar contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
              <input
                id="register-confirm"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contrasena"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-11 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Informational note about role */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
          <Info className="w-4.5 h-4.5 text-[#2563EB] mt-0.5 shrink-0" />
          <p className="text-xs text-[#1F2937] leading-relaxed">
            Todas las cuentas nuevas se registran como{" "}
            <span className="font-semibold text-[#16A34A]">Cliente (Usuario)</span>.
            Los roles administrativos se asignan internamente.
          </p>
        </div>

        {/* Gamification badges preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FACC15]/20">
            <Award className="w-5 h-5 text-[#FACC15]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1F2937]">Nivel 1 - Principiante</p>
            <p className="text-xs text-[#6B7280]">Completa tu registro para ganar tu primera insignia</p>
          </div>
          <div className="flex -space-x-1">
            <div className="w-7 h-7 rounded-full bg-[#E2E8F0] border-2 border-[#FFFFFF] flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E2E8F0] border-2 border-[#FFFFFF] flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E2E8F0] border-2 border-[#FFFFFF] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-[#6B7280]">
        Ya tienes cuenta?{" "}
        <Link href="/" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
          Inicia sesion
        </Link>
      </p>
    </div>
  )
}
