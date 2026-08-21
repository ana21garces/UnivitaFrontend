"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Info,
  AlertCircle,
} from "lucide-react"
import { UniVitaLogo } from "@/components/univita-logo"

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
  const [emailTaken, setEmailTaken] = useState(false)
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Validaciones instantáneas del lado del cliente
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean)
  const nameError =
    nameParts.length < 2 || nameParts.some((part) => part.length < 2)
      ? "Ingresa tu nombre y apellido."
      : ""
  const emailError = !emailRegex.test(email)
    ? "Ingresa un correo válido, por ejemplo: nombre@dominio.com"
    : emailTaken
      ? "El correo ya está registrado."
      : ""
  const passwordError =
    password.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : ""
  const confirmError =
    confirmPassword !== password ? "Las contraseñas no coinciden." : ""
  const isFormValid = !nameError && !emailError && !passwordError && !confirmError

  // Revisa si el correo ya existe mientras se escribe (sin esperar al botón).
  // Reutiliza el endpoint de la recuperación; con debounce para no consultar
  // en cada tecla. Si la consulta falla, no bloquea: el registro valida igual.
  useEffect(() => {
    setEmailTaken(false)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const t = setTimeout(() => {
      api
        .post("/auth/verificar-correo", { email })
        .then(({ data }) => setEmailTaken(!!data.existe))
        .catch(() => {})
    }, 450)
    return () => clearTimeout(t)
  }, [email])

  const markTouched = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  // Muestra el error solo cuando el campo ya fue tocado
  const showNameError = touched.fullName && !!nameError
  const showEmailError = (touched.email || emailTaken) && !!emailError
  const showPasswordError = touched.password && !!passwordError
  const showConfirmError = touched.confirmPassword && !!confirmError

  // Clases del input: borde rojo cuando hay error, verde por defecto
  const inputClass = (hasError: boolean, pr: string) =>
    `w-full h-11 pl-12 ${pr} rounded-lg border bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? "border-[#F87171] focus:ring-[#F87171]/30 focus:border-[#F87171]"
        : "border-[#E2E8F0] focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
    }`

  // Cajita del ícono: verde por defecto, roja cuando hay error
  const iconBoxClass = (hasError: boolean) =>
    `absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg ${
      hasError ? "bg-[#FEE2E2]" : "bg-[#EAF3DE]"
    }`

  const iconInnerClass = (hasError: boolean) =>
    `w-4 h-4 ${hasError ? "text-[#EF4444]" : "text-[#16A34A]"}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Marca todos los campos como tocados para revelar los errores pendientes
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })
    if (!isFormValid) return

    setLoading(true)

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      })

      // El registro devuelve el usuario, no tokens. Enviamos al login con la
      // marca para mostrar el aviso "Cuenta creada. Ahora inicia sesión".
      router.push("/?registro=exitoso")
    } catch (err: any) {
      const detail = err.response?.data?.detail
      let msg = "Error al registrarse"
      if (Array.isArray(detail)) {
        msg = detail[0]?.msg ?? msg
      } else if (typeof detail === "string") {
        msg = detail
      }
      // Pydantic antepone "Value error, " a los mensajes de validación; lo quitamos
      msg = msg.replace(/^Value error,\s*/i, "")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-3">
        <UniVitaLogo size="md" />
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-[#1F2937]">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-md text-[#6B7280]">
            Pequeños hábitos, grandes cambios.
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-name" className="text-sm font-medium text-[#1F2937]">
            Nombre completo
          </label>
          <div className="relative">
            <div className={iconBoxClass(showNameError)}>
              <User className={iconInnerClass(showNameError)} />
            </div>
            <input
              id="register-name"
              type="text"
              placeholder="Juan Perez Garcia"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => markTouched("fullName")}
              required
              className={inputClass(showNameError, "pr-4")}
            />
          </div>
          {showNameError && (
            <p className="flex items-center gap-1.5 text-sm text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {nameError}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-email" className="text-sm font-medium text-[#1F2937]">
            Correo institucional
          </label>
          <div className="relative">
            <div className={iconBoxClass(showEmailError)}>
              <Mail className={iconInnerClass(showEmailError)} />
            </div>
            <input
              id="register-email"
              type="email"
              placeholder="tu.nombre@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              required
              className={inputClass(showEmailError, "pr-4")}
            />
          </div>
          {showEmailError && (
            <p className="flex items-center gap-1.5 text-sm text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {emailError}
            </p>
          )}
        </div>

        {/* Passwords row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-sm font-medium text-[#1F2937]">
              Contraseña
            </label>
            <div className="relative">
              <div className={iconBoxClass(showPasswordError)}>
                <Lock className={iconInnerClass(showPasswordError)} />
              </div>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched("password")}
                required
                className={inputClass(showPasswordError, "pr-11")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showPasswordError && (
              <p className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-confirm" className="text-sm font-medium text-[#1F2937]">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className={iconBoxClass(showConfirmError)}>
                <Lock className={iconInnerClass(showConfirmError)} />
              </div>
              <input
                id="register-confirm"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => markTouched("confirmPassword")}
                required
                className={inputClass(showConfirmError, "pr-11")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showConfirmError && (
              <p className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {confirmError}
              </p>
            )}
          </div>
        </div>

        {/* Informational note about role */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
          <Info className="w-4.5 h-4.5 text-[#2563EB] mt-0.5 shrink-0" />
          <p className="text-xs text-[#1F2937] leading-relaxed">
            Con tu registro empiezas tu camino saludable: encuesta, puntos y{" "}
            <span className="font-semibold text-[#16A34A]">niveles</span>.
            Los roles se asignan internamente.
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full h-11 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-[#6B7280]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
