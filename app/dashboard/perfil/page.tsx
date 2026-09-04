"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
  Flame,
  Loader2,
  Upload,
  ChevronDown,
} from "lucide-react"
import { ProfileAvatar } from "@/components/profile-avatar"
import { XpProgressBar } from "@/components/xp-progress-bar"
import { InsigniasGrid } from "@/components/insignias-grid"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { UniVitaLogo } from "@/components/univita-logo"
import {
  motivoXpLabel,
  RANK_LABELS,
  type ProgresoGamificacion,
  type RankTier,
} from "@/lib/gamificacion"

const ROLE_LABELS: Record<string, string> = {
  student: "Usuario",
  admin: "Administrador",
  capellan: "Psicología Positiva",
  actividad_fisica: "Actividad física",
  responsabilidad_salud: "Responsabilidad en salud",
  relaciones_interpersonales: "Relaciones interpersonales",
  manejo_estres: "Manejo del estrés",
  nutricion: "Nutrición",
}

type XpEvento = {
  id: string
  xp: number
  motivo: string
  detalle: string | null
  created_at: string
}

export default function PerfilPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null)

  const [nombre, setNombre] = useState("")
  const [nombreOriginal, setNombreOriginal] = useState("")
  const [correo, setCorreo] = useState("")
  const [correoOriginal, setCorreoOriginal] = useState("")
  const [rol, setRol] = useState("")
  const [progreso, setProgreso] = useState<ProgresoGamificacion | null>(null)
  const [historial, setHistorial] = useState<XpEvento[]>([])
  const [verTodoXp, setVerTodoXp] = useState(false)
  const [xpExpandido, setXpExpandido] = useState<Set<string>>(new Set())
  const [diasColapsados, setDiasColapsados] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<"progreso" | "cuenta">("progreso")

  // Historial de puntos agrupado por día; dentro de cada día se juntan los eventos
  // seguidos del mismo tipo (ej. "Misión completada ·3") para que no sea un
  // larguero. El backend ya lo entrega del más reciente al más antiguo.
  const historialPorDia = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const etiquetaDia = (iso: string) => {
      const d = new Date(iso)
      d.setHours(0, 0, 0, 0)
      const dias = Math.round((hoy.getTime() - d.getTime()) / 86_400_000)
      if (dias === 0) return "Hoy"
      if (dias === 1) return "Ayer"
      return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
    }

    const hora = (iso: string) =>
      new Date(iso).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })

    const grupos: {
      dia: string
      totalXp: number
      items: {
        motivo: string
        xp: number
        count: number
        detalles: { hora: string; xp: number; detalle: string | null }[]
      }[]
    }[] = []

    for (const ev of historial) {
      const dia = etiquetaDia(ev.created_at)
      let g = grupos[grupos.length - 1]
      if (!g || g.dia !== dia) {
        g = { dia, totalXp: 0, items: [] }
        grupos.push(g)
      }
      g.totalXp += ev.xp
      const sub = { hora: hora(ev.created_at), xp: ev.xp, detalle: ev.detalle }
      const ultimo = g.items[g.items.length - 1]
      if (ultimo && ultimo.motivo === ev.motivo) {
        ultimo.xp += ev.xp
        ultimo.count += 1
        ultimo.detalles.push(sub)
      } else {
        g.items.push({ motivo: ev.motivo, xp: ev.xp, count: 1, detalles: [sub] })
      }
    }
    return grupos
  }, [historial])

  const [actual, setActual] = useState("")
  const [nueva, setNueva] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [verActual, setVerActual] = useState(false)
  const [verNueva, setVerNueva] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const cargarGamificacion = useCallback(async () => {
    try {
      const [prog, hist] = await Promise.all([
        api.get("/gamificacion/progreso"),
        api.get("/gamificacion/historial"),
      ])
      setProgreso(prog.data)
      setHistorial(hist.data)
    } catch {
      /* La gamificación es complementaria; no bloquea el perfil. */
    }
  }, [])

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    Promise.all([api.get("/users/me"), cargarGamificacion()])
      .then(([me]) => {
        setNombre(me.data.full_name)
        setNombreOriginal(me.data.full_name)
        setCorreo(me.data.email)
        setCorreoOriginal(me.data.email)
        setRol(me.data.role)
        setProgreso((prev) =>
          prev ?? {
            total_xp: me.data.total_xp ?? 0,
            current_level: me.data.current_level ?? 1,
            rank_tier: (me.data.rank_tier ?? "bronce") as RankTier,
            streak_days: me.data.streak_days ?? 0,
            xp_en_nivel: 0,
            xp_para_siguiente: 100,
            avatar_url: me.data.avatar_url,
          }
        )
      })
      .catch((err) => redirigirPorError(err, router))
      .finally(() => setLoading(false))
  }, [router, cargarGamificacion])

  const subirAvatar = async (file: File) => {
    setSubiendo(true)
    setAvatarMsg(null)
    const formData = new FormData()
    formData.append("archivo", file)
    try {
      const { data } = await api.post("/gamificacion/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setProgreso(data)
      setAvatarMsg("Foto de perfil actualizada.")
    } catch {
      setAvatarMsg("No se pudo subir la imagen. Usa JPG, PNG o WebP (máx. 2 MB).")
    } finally {
      setSubiendo(false)
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const correoCambio = correo.trim() !== correoOriginal

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    const datosCambiaron = nombre.trim() !== nombreOriginal || correo.trim() !== correoOriginal
    const quiereCambiarPass = Boolean(actual || nueva || confirmar)

    if (!datosCambiaron && !quiereCambiarPass) {
      return setMsg({ ok: false, text: "No hay cambios para guardar." })
    }
    if (datosCambiaron) {
      if (nombre.trim().length < 2) return setMsg({ ok: false, text: "Ingresa tu nombre completo." })
      if (!emailRegex.test(correo)) return setMsg({ ok: false, text: "Ingresa un correo válido." })
    }
    if (quiereCambiarPass) {
      if (!actual) return setMsg({ ok: false, text: "Ingresa tu contraseña actual para cambiarla." })
      if (nueva.length < 8) return setMsg({ ok: false, text: "La nueva contraseña debe tener al menos 8 caracteres." })
      if (nueva !== confirmar) return setMsg({ ok: false, text: "Las contraseñas nuevas no coinciden." })
    }

    setSaving(true)
    const correoAntes = correoOriginal
    try {
      if (datosCambiaron) {
        await api.patch("/users/me", { full_name: nombre.trim(), email: correo.trim() })
        setNombreOriginal(nombre.trim())
        setCorreoOriginal(correo.trim())
      }
      if (quiereCambiarPass) {
        await api.patch("/users/me/password", { current_password: actual, new_password: nueva })
        setActual("")
        setNueva("")
        setConfirmar("")
      }
      const correoChanged = correo.trim() !== correoAntes
      setToast(
        correoChanged
          ? "Ahora inicia sesión con tu nuevo correo."
          : "Tu perfil se actualizó correctamente."
      )
      setTimeout(() => router.back(), 1900)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        const text = typeof detail === "string" ? detail : "No pudimos guardar los cambios. Inténtalo de nuevo."
        setMsg({ ok: false, text })
      }
    } finally {
      setSaving(false)
    }
  }

  const iconBox = "absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg bg-[#EAF3DE]"
  const iconInner = "w-4 h-4 text-[#16A34A]"
  const input = "w-full h-11 pl-12 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
  const label = "text-sm font-medium text-[#1F2937]"

  const rank = progreso?.rank_tier ?? "bronce"
  const esUsuario = rol === "student"
  const verProgreso = !esUsuario || tab === "progreso"
  const verCuenta = !esUsuario || tab === "cuenta"

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {toast && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1F2937]/40 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center gap-3 bg-white rounded-2xl shadow-2xl px-12 py-10 mx-4 max-w-xs">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#16A34A]">
              <Check className="w-9 h-9 text-white" strokeWidth={3} />
            </div>
            <p className="text-xl font-bold font-heading text-[#1F2937]">Cambios guardados</p>
            <p className="text-sm text-[#6B7280]">{toast}</p>
          </div>
        </div>
      )}

      <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <UniVitaLogo size="xs" />
          <span className="text-lg font-bold font-heading text-[#1F2937]">UnacHealth</span>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-[#1F2937]">Mi perfil</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {esUsuario
              ? "Tu progreso por un lado y tus datos de acceso por el otro."
              : "Tu foto de perfil y tus datos de acceso."}
          </p>
        </div>

        {esUsuario && !loading && (
          <div className="flex gap-1 border-b border-[#E2E8F0] mb-6">
            {(["progreso", "cuenta"] as const).map((clave) => (
              <button
                key={clave}
                type="button"
                onClick={() => setTab(clave)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                  tab === clave
                    ? "border-[#16A34A] text-[#16A34A]"
                    : "border-transparent text-[#6B7280] hover:text-[#1F2937]"
                }`}
              >
                {clave === "progreso" ? "Mi progreso" : "Mi cuenta"}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />
            Cargando...
          </div>
        ) : (
          <>
            {verProgreso && progreso && (
              <section className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ProfileAvatar
                    name={nombre || "Usuario"}
                    rankTier={rank}
                    avatarUrl={progreso.avatar_url}
                    size="lg"
                    plain={!esUsuario}
                    showRankBadge={esUsuario}
                  />
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h2 className="text-xl font-bold text-[#1F2937]">{nombre || "Usuario"}</h2>
                    <p className="text-sm text-[#6B7280]">{correoOriginal}</p>
                    {esUsuario && (
                      <>
                        <div className="mt-4">
                          <XpProgressBar
                            currentXp={progreso.xp_en_nivel}
                            maxXp={progreso.xp_para_siguiente}
                            level={progreso.current_level}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-[#6B7280]">
                          <span>{progreso.total_xp} puntos en total</span>
                          <span>Rango: {RANK_LABELS[rank]}</span>
                          <span className="inline-flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Racha: {progreso.streak_days} días
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[#9CA3AF]">
                          Ganas puntos al completar misiones y actividades. Suman tu nivel y tu rango (bronce, plata, oro, platino).
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) subirAvatar(file)
                    }}
                  />
                  <button
                    type="button"
                    disabled={subiendo}
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {subiendo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Cambiar foto de perfil
                  </button>
                  {avatarMsg && <p className="mt-2 text-sm text-[#6B7280]">{avatarMsg}</p>}
                </div>
              </section>
            )}

            {verCuenta && (
            <form onSubmit={guardar}>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-b border-[#E2E8F0]">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-[#1F2937] truncate">{nombre || "Usuario"}</p>
                    <p className="text-sm text-[#6B7280] truncate">{correoOriginal}</p>
                  </div>
                  {rol && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] shrink-0 self-start sm:self-auto">
                      {ROLE_LABELS[rol] ?? rol}
                    </span>
                  )}
                </div>

                <div className="p-6 border-b border-[#E2E8F0]">
                  <h2 className="text-sm font-semibold text-[#1F2937] mb-4">Información personal</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={label}>Nombre completo</label>
                      <div className="relative">
                        <div className={iconBox}><User className={iconInner} /></div>
                        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={`${input} pr-4`} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={label}>Correo</label>
                      <div className="relative">
                        <div className={iconBox}><Mail className={iconInner} /></div>
                        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className={`${input} pr-4`} />
                      </div>
                    </div>
                  </div>
                  {correoCambio && (
                    <div className="flex items-start gap-1.5 text-xs text-[#B45309] mt-2">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Si cambias tu correo, a partir del próximo inicio de sesión entrarás con el nuevo.</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-[#1F2937]">Seguridad</h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Déjalo en blanco si no quieres cambiar la contraseña.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={label}>Contraseña actual</label>
                      <div className="relative">
                        <div className={iconBox}><Lock className={iconInner} /></div>
                        <input type={verActual ? "text" : "password"} value={actual} onChange={(e) => setActual(e.target.value)} placeholder="Actual" className={`${input} pr-10`} />
                        <button type="button" onClick={() => setVerActual(!verActual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors">
                          {verActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={label}>Nueva contraseña</label>
                      <div className="relative">
                        <div className={iconBox}><Lock className={iconInner} /></div>
                        <input type={verNueva ? "text" : "password"} value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Mín. 8" className={`${input} pr-10`} />
                        <button type="button" onClick={() => setVerNueva(!verNueva)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors">
                          {verNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {nueva.length > 0 && nueva.length < 8 && (
                        <p className="text-xs text-[#DC2626]">Mínimo 8 caracteres.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={label}>Confirmar</label>
                      <div className="relative">
                        <div className={iconBox}><Lock className={iconInner} /></div>
                        <input type={verConfirmar ? "text" : "password"} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="Repite" className={`${input} pr-10`} />
                        <button type="button" onClick={() => setVerConfirmar(!verConfirmar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors">
                          {verConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmar.length > 0 && confirmar !== nueva && (
                        <p className="text-xs text-[#DC2626]">No coinciden.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                  {msg && (
                    <div className={`flex items-center gap-1.5 text-sm sm:mr-auto ${msg.ok ? "text-[#15803D]" : "text-[#DC2626]"}`}>
                      {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{msg.text}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 px-6 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </form>
            )}

            {esUsuario && verProgreso && (
              <div className="mb-6">
                <InsigniasGrid />
              </div>
            )}

            {esUsuario && verProgreso && (
            <section className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-6">
              <h2 className="text-lg font-bold font-heading text-[#1F2937] mb-4">Historial de puntos</h2>
              {historialPorDia.length === 0 ? (
                <p className="text-sm text-[#6B7280]">
                  Aún no has ganado puntos. Completa misiones en tu dashboard.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {(verTodoXp ? historialPorDia : historialPorDia.slice(0, 3)).map((g) => {
                      const colapsado = diasColapsados.has(g.dia)
                      return (
                      <div key={g.dia}>
                        <button
                          type="button"
                          onClick={() =>
                            setDiasColapsados((prev) => {
                              const s = new Set(prev)
                              if (s.has(g.dia)) s.delete(g.dia)
                              else s.add(g.dia)
                              return s
                            })
                          }
                          className="w-full flex items-center justify-between gap-2 mb-1.5 group"
                        >
                          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${colapsado ? "-rotate-90" : ""}`}
                            />
                            {g.dia}
                          </span>
                          <span className="text-xs font-bold text-[#16A34A]">+{g.totalXp} puntos</span>
                        </button>
                        {!colapsado && (
                        <div className="flex flex-col divide-y divide-[#F1F5F9] rounded-lg border border-[#F1F5F9]">
                          {g.items.map((it, i) => {
                            const clave = `${g.dia}-${i}`
                            const desglosable = it.count > 1
                            const abierto = xpExpandido.has(clave)
                            return (
                              <div key={i}>
                                <button
                                  type="button"
                                  disabled={!desglosable}
                                  onClick={() =>
                                    setXpExpandido((prev) => {
                                      const s = new Set(prev)
                                      s.has(clave) ? s.delete(clave) : s.add(clave)
                                      return s
                                    })
                                  }
                                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left ${
                                    desglosable ? "hover:bg-[#F8FAFC] cursor-pointer" : "cursor-default"
                                  }`}
                                >
                                  <span className="min-w-0">
                                    <span className="flex items-center gap-1.5 text-sm text-[#1F2937]">
                                      {motivoXpLabel(it.motivo)}
                                      {desglosable && (
                                        <>
                                          <span className="text-[#9CA3AF] font-normal">·{it.count}</span>
                                          <ChevronDown
                                            className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform ${abierto ? "rotate-180" : ""}`}
                                          />
                                        </>
                                      )}
                                    </span>
                                    {!desglosable && it.detalles[0].detalle && (
                                      <span className="block text-xs text-[#9CA3AF] truncate">{it.detalles[0].detalle}</span>
                                    )}
                                  </span>
                                  <span className="text-sm font-semibold text-[#16A34A] shrink-0">+{it.xp} puntos</span>
                                </button>
                                {desglosable && abierto && (
                                  <div className="bg-[#F8FAFC] px-3 py-1.5 flex flex-col gap-1">
                                    {it.detalles.map((d, j) => (
                                      <div key={j} className="flex items-center justify-between gap-3 text-xs pl-3">
                                        <span className="text-[#6B7280] truncate">
                                          {d.detalle ?? "Registro"}
                                          <span className="text-[#B8C0CC]"> · {d.hora}</span>
                                        </span>
                                        <span className="font-medium text-[#16A34A] shrink-0">+{d.xp} puntos</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        )}
                      </div>
                      )
                    })}
                  </div>
                  {historialPorDia.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setVerTodoXp((v) => !v)}
                      className="mt-4 text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      {verTodoXp ? "Ver menos" : `Ver todos los días (${historialPorDia.length})`}
                    </button>
                  )}
                </>
              )}
            </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
