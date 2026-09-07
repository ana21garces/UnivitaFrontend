"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken, LOGIN_PATH } from "@/lib/auth"
import {
  Search,
  Plus,
  Eye,
  UserCog,
  Ban,
  CircleCheck,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Repeat,
  ShieldCheck,
  EyeOff,
  Copy,
  Wand2,
  UserPlus,
} from "lucide-react"
import { avatarSrc } from "@/lib/gamificacion"

interface ApiUser {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  tipo_usuario: string | null
  facultad: string | null
  program: string | null
  sexo: string | null
  avatar_url: string | null
}

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

const ASSIGNABLE_ROLES = [
  "student",
  "capellan",
  "actividad_fisica",
  "responsabilidad_salud",
  "relaciones_interpersonales",
  "manejo_estres",
  "nutricion",
  "admin",
]

// Los roles agrupados para el modal de "Cambiar rol": general arriba, áreas de
// bienestar abajo. Más ordenado que una lista plana de ocho opciones.
const ROLE_GROUPS: { label: string; roles: string[] }[] = [
  { label: "General", roles: ["student", "admin"] },
  {
    label: "Áreas de bienestar",
    roles: [
      "capellan",
      "actividad_fisica",
      "responsabilidad_salud",
      "relaciones_interpersonales",
      "manejo_estres",
      "nutricion",
    ],
  },
]

const labelFor = (r: string) => ROLE_LABELS[r] ?? r

export default function UserManagementPage() {  const router = useRouter()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [yo, setYo] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<"all" | "active" | "suspended">("all")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState(false)

  const [rolModal, setRolModal] = useState<ApiUser | null>(null)
  const [rolSel, setRolSel] = useState<string>("")
  const [rolError, setRolError] = useState("")
  const [rolOk, setRolOk] = useState<string | null>(null)
  const [detalle, setDetalle] = useState<ApiUser | null>(null)
  const [eliminar, setEliminar] = useState<ApiUser | null>(null)
  const [eliminarOk, setEliminarOk] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [nuevo, setNuevo] = useState({ full_name: "", email: "", password: "", role: "student" })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [touched, setTouched] = useState({ full_name: false, email: false, password: false, confirmPassword: false })

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(LOGIN_PATH)
      return
    }
    // Traemos también la cuenta propia: sobre uno mismo no se puede cambiar el
    // rol, ni suspender, ni eliminar.
    Promise.all([api.get("/users"), api.get("/users/me")])
      .then(([lista, propio]) => {
        setUsers(lista.data)
        setYo(propio.data)
      })
      .catch((err) => {
        if (!redirigirPorError(err, router)) setLoadError("No pudimos cargar los usuarios. Inténtalo de nuevo.")
      })
      .finally(() => setLoading(false))
  }, [router])

  // Al cambiar búsqueda o filtros, vuelve a la primera página.
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterEstado, filterRole])

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchesEstado =
      filterEstado === "all" || (filterEstado === "active" ? u.is_active : !u.is_active)
    const matchesRole = filterRole === "all" || u.role === filterRole
    return matchesSearch && matchesEstado && matchesRole
  })

  const esYo = (user: ApiUser) => yo?.id === user.id

  // Si queda un solo administrador no se le puede quitar el rol, ni suspenderlo,
  // ni eliminarlo: la plataforma quedaría sin quien la administre.
  const totalAdmins = users.filter((u) => u.role === "admin").length
  const esUltimoAdmin = (user: ApiUser) => user.role === "admin" && totalAdmins <= 1
  const rolModalUltimoAdmin = rolModal !== null && esUltimoAdmin(rolModal)

  const totalActivos = users.filter((u) => u.is_active).length
  const estadoPills = [
    { key: "all" as const, label: "Todos", count: users.length },
    { key: "active" as const, label: "Activos", count: totalActivos },
    { key: "suspended" as const, label: "Suspendidos", count: users.length - totalActivos },
  ]

  // Paginación (en cliente, ya que traemos todos los usuarios).
  const pageSize = 10
  const total = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paginaActual = Math.min(page, totalPages)
  const inicio = (paginaActual - 1) * pageSize
  const paginados = filteredUsers.slice(inicio, inicio + pageSize)
  const desde = total === 0 ? 0 : inicio + 1
  const hasta = Math.min(inicio + pageSize, total)

  function abrirCambioRol(user: ApiUser) {
    setRolModal(user)
    setRolSel(user.role)
    setRolError("")
  }

  function cerrarCambioRol() {
    if (saving) return
    setRolModal(null)
  }

  async function guardarRol() {
    if (!rolModal || rolSel === rolModal.role) return
    const nombre = rolModal.full_name
    const nuevoRol = rolSel
    setSaving(true)
    setRolError("")
    try {
      const { data } = await api.patch(`/users/${rolModal.id}/role`, { role: rolSel })
      setUsers((prev) => prev.map((u) => (u.id === rolModal.id ? data : u)))
      setRolModal(null)
      setRolOk(`Ahora ${nombre} tiene el rol de ${labelFor(nuevoRol)}.`)
      setTimeout(() => setRolOk(null), 2200)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as any).response?.data?.detail
        setRolError(typeof detail === "string" ? detail : "No pudimos cambiar el rol. Inténtalo de nuevo.")
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleEstado(user: ApiUser) {
    try {
      const { data } = await api.patch(`/users/${user.id}/estado`, { is_active: !user.is_active })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)))
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as any).response?.data?.detail
        setLoadError(
          typeof detail === "string" ? detail : "No pudimos cambiar el estado. Inténtalo de nuevo."
        )
      }
    }
  }

  async function eliminarUsuario() {
    if (!eliminar) return
    setSaving(true)
    try {
      await api.delete(`/users/${eliminar.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== eliminar.id))
      setEliminar(null)
      setEliminarOk(false)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as any).response?.data?.detail
        setLoadError(
          typeof detail === "string" ? detail : "No pudimos eliminar el usuario. Inténtalo de nuevo."
        )
        setEliminar(null)
      }
    } finally {
      setSaving(false)
    }
  }

  function generarContrasena(): string {
    // Se omiten caracteres confusos (I, O, l, 0, 1) para que sea fácil de leer
    // y dictar. Va con crypto para que sea aleatoria de verdad.
    const may = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const min = "abcdefghijkmnopqrstuvwxyz"
    const num = "23456789"
    const sim = "!@#$%&*?-_"
    const todos = may + min + num + sim
    const azar = (n: number) =>
      Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * n)
    const tomar = (set: string) => set[azar(set.length)]
    // Garantiza al menos uno de cada grupo, completa hasta 14 y baraja.
    const chars = [tomar(may), tomar(min), tomar(num), tomar(sim)]
    while (chars.length < 14) chars.push(tomar(todos))
    for (let i = chars.length - 1; i > 0; i--) {
      const j = azar(i + 1)
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    return chars.join("")
  }

  function generar() {
    const p = generarContrasena()
    setNuevo((s) => ({ ...s, password: p }))
    setConfirmPassword(p) // el confirmar se llena solo al generar
    setShowPass(true) // se revela para poder verla y copiarla
    setShowConfirm(true)
    setCreateError("")
  }

  async function copiarContrasena() {
    if (!nuevo.password) return
    try {
      await navigator.clipboard.writeText(nuevo.password)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      setCreateError("No pudimos copiar la contraseña. Cópiala a mano.")
    }
  }

  function cerrarCrear() {
    // Cancelar descarta el formulario: la contraseña solo debe existir si se
    // llega a crear el usuario. Se limpia todo para que al reabrir esté en blanco.
    setShowCreate(false)
    setNuevo({ full_name: "", email: "", password: "", role: "student" })
    setConfirmPassword("")
    setShowPass(false)
    setShowConfirm(false)
    setCopiado(false)
    setTouched({ full_name: false, email: false, password: false, confirmPassword: false })
    setCreateError("")
  }

  function fuerzaContrasena(pw: string) {
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const nivel = pw.length === 0 ? 0 : score <= 1 ? 1 : score === 2 ? 2 : score === 3 ? 3 : 4
    const label = ["", "Débil", "Aceptable", "Buena", "Segura"][nivel]
    const color = ["#94A3B8", "#DC2626", "#D97706", "#639922", "#16A34A"][nivel]
    return { nivel, label, color }
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    setTouched({ full_name: true, email: true, password: true, confirmPassword: true })
    if (!formValido) return
    setCreating(true)
    try {
      const { data } = await api.post("/users", nuevo)
      setUsers((prev) => [data, ...prev])
      setShowCreate(false)
      setNuevo({ full_name: "", email: "", password: "", role: "student" })
      setConfirmPassword("")
      setShowPass(false)
      setShowConfirm(false)
      setCopiado(false)
      setTouched({ full_name: false, email: false, password: false, confirmPassword: false })
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        const detail = (err as any).response?.data?.detail
        let msg = "No pudimos crear el usuario. Inténtalo de nuevo."
        if (Array.isArray(detail)) msg = detail[0]?.msg ?? msg
        else if (typeof detail === "string") msg = detail
        setCreateError(msg.replace(/^Value error,\s*/i, ""))
      }
    } finally {
      setCreating(false)
    }
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })

  const inputCls =
    "w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
  const btnBase =
    "flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
  const btnVer = `${btnBase} bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]`
  const btnRol = `${btnBase} bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:bg-[#DBEAFE]`

  // Mismas validaciones que el registro público (register-form.tsx): nombre y
  // apellido, correo con formato, contraseña de 8+ y confirmación que coincide.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nombrePartes = nuevo.full_name.trim().split(/\s+/).filter(Boolean)
  const nameError =
    nombrePartes.length < 2 || nombrePartes.some((p) => p.length < 2)
      ? "Ingresa el nombre y el apellido."
      : ""
  const emailError = !emailRegex.test(nuevo.email)
    ? "Ingresa un correo válido, por ejemplo: nombre@dominio.com"
    : ""
  const passwordError = nuevo.password.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : ""
  const confirmError = confirmPassword !== nuevo.password ? "Las contraseñas no coinciden." : ""
  const formValido = !nameError && !emailError && !passwordError && !confirmError
  const pwFuerza = fuerzaContrasena(nuevo.password)

  const markTouched = (campo: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [campo]: true }))
  const showNameError = touched.full_name && !!nameError
  const showEmailError = touched.email && !!emailError
  const showPasswordError = touched.password && !!passwordError
  const showConfirmError = touched.confirmPassword && !!confirmError

  // Igual que el input del registro: borde rojo cuando el campo tocado tiene error.
  const campoCls = (hasError: boolean) =>
    `w-full h-10 px-3 rounded-lg border bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? "border-[#F87171] focus:ring-[#F87171]/30 focus:border-[#F87171]"
        : "border-[#E2E8F0] focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
    }`
  const btnEstado = `${btnBase} bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] hover:bg-[#FEF3C7]`
  const btnDel = `${btnBase} bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]`

  const Avatar = ({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) => {
    const src = avatarSrc(avatarUrl)
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A] shrink-0">
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
    )
  }

  const ChipTu = () => (
    <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0]">
      Tú
    </span>
  )

  const RoleChip = ({ role }: { role: string }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold text-[#475569] bg-[#F1F5F9]">
      {labelFor(role)}
    </span>
  )

  const EstadoBadge = ({ activo }: { activo: boolean }) => (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        activo ? "bg-[#F0FDF4] text-[#15803D]" : "bg-[#FEF2F2] text-[#DC2626]"
      }`}
    >
      {activo ? <CircleCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
      {activo ? "Activo" : "Suspendido"}
    </span>
  )

  // En la cuenta propia solo se muestra el detalle: no hay nada que uno pueda
  // hacer sobre sí mismo. A otro administrador se le puede cambiar el rol o
  // suspenderlo (es reversible), pero no eliminarlo: primero hay que quitarle el
  // rol. Al último administrador tampoco se le puede quitar el rol ni suspenderlo.
  const Acciones = ({ user }: { user: ApiUser }) => {
    const esAdmin = user.role === "admin"
    const ultimoAdmin = esUltimoAdmin(user)

    if (esYo(user)) {
      return (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setDetalle(user)} className={btnVer} title="Ver detalles">
            <Eye className="w-4 h-4" />
          </button>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE]"
            title="Es tu cuenta: ya tienes todos los permisos del panel"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso total
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center gap-1.5">
        <button onClick={() => setDetalle(user)} className={btnVer} title="Ver detalles">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => abrirCambioRol(user)} className={btnRol} title="Cambiar rol">
          <UserCog className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleEstado(user)}
          disabled={ultimoAdmin && user.is_active}
          className={btnEstado}
          title={
            ultimoAdmin && user.is_active
              ? "No puedes suspender al último administrador"
              : user.is_active
                ? "Suspender"
                : "Activar"
          }
        >
          {user.is_active ? <Ban className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
        </button>
        <button
          onClick={() => {
            setEliminarOk(false)
            setEliminar(user)
          }}
          disabled={esAdmin}
          className={btnDel}
          title={
            esAdmin
              ? "No puedes eliminar a otro administrador: primero cámbiale el rol"
              : "Eliminar"
          }
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <main className="px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Gestión de usuarios</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Consulta los usuarios registrados y asígnales roles.</p>
          </div>
          <button
            onClick={() => {
              setCreateError("")
              setConfirmPassword("")
              setShowPass(false)
              setShowConfirm(false)
              setCopiado(false)
              setTouched({ full_name: false, email: false, password: false, confirmPassword: false })
              setShowCreate(true)
            }}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-[#FFFFFF] shadow-md shadow-[#16A34A]/20 hover:shadow-lg transition-all cursor-pointer shrink-0"
            style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>

        {/* Tarjeta de búsqueda + filtros */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm p-4 mb-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputCls} pl-10`}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {estadoPills.map((p) => {
                const active = filterEstado === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => setFilterEstado(p.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      active ? "bg-[#16A34A] text-[#FFFFFF]" : "bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    {p.label}
                    <span
                      className={`px-1.5 rounded-full text-[10px] font-bold ${
                        active ? "bg-white/20" : "bg-[#E2E8F0] text-[#6B7280]"
                      }`}
                    >
                      {p.count}
                    </span>
                  </button>
                )
              })}
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="sm:ml-auto h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] cursor-pointer"
            >
              <option value="all">Todos los roles</option>
              {Object.keys(ROLE_LABELS).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-[#DC2626]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-[#6B7280]">Cargando usuarios...</div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Usuario</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Rol</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Estado</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Registrado</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map((user) => (
                      <tr key={user.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.full_name} avatarUrl={user.avatar_url} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <p className="font-medium text-[#1F2937] truncate">{user.full_name}</p>
                                {esYo(user) && <ChipTu />}
                              </div>
                              <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <RoleChip role={user.role} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <EstadoBadge activo={user.is_active} />
                        </td>
                        <td className="px-4 py-3 text-center text-[#6B7280]">{formatFecha(user.created_at)}</td>
                        <td className="px-4 py-3">
                          <Acciones user={user} />
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                          No hay usuarios que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {paginados.map((user) => (
                  <div key={user.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={user.full_name} avatarUrl={user.avatar_url} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="font-medium text-[#1F2937] text-sm truncate">{user.full_name}</p>
                          {esYo(user) && <ChipTu />}
                        </div>
                        <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <RoleChip role={user.role} />
                      <EstadoBadge activo={user.is_active} />
                    </div>
                    <Acciones user={user} />
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    No hay usuarios que coincidan con la búsqueda.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-[#6B7280]">
              Mostrando {desde}–{hasta} de {total} usuario{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-[#6B7280] px-2">
                Página {paginaActual} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={paginaActual === totalPages}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal: ver detalles */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => setDetalle(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setDetalle(null)} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#16A34A]/10 flex items-center justify-center text-lg font-bold text-[#16A34A]">
                {avatarSrc(detalle.avatar_url) ? (
                  <img src={avatarSrc(detalle.avatar_url)!} alt={detalle.full_name} className="w-full h-full object-cover" />
                ) : (
                  detalle.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1F2937] truncate">{detalle.full_name}</p>
                <p className="text-sm text-[#6B7280] truncate">{detalle.email}</p>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-[#F1F5F9]">
              {[
                { k: "Rol", v: labelFor(detalle.role) },
                { k: "Estado", v: detalle.is_active ? "Activo" : "Suspendido" },
                { k: "Tipo de usuario", v: detalle.tipo_usuario ? detalle.tipo_usuario : "No especificado" },
                { k: "Sexo", v: detalle.sexo || "No registrado" },
                { k: "Facultad", v: detalle.facultad || "No especificada" },
                { k: "Programa", v: detalle.program || "No especificado" },
                { k: "Registrado", v: formatFecha(detalle.created_at) },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-[#6B7280]">{row.k}</span>
                  <span className="font-medium text-[#1F2937] text-right capitalize">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: cambiar rol */}
      {rolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={cerrarCambioRol} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={cerrarCambioRol} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Cambiar rol</h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              Elige el nuevo rol de{" "}
              <span className="font-semibold text-[#1F2937]">{rolModal.full_name}</span>. Su rol actual es{" "}
              <span className="font-semibold text-[#1F2937]">{labelFor(rolModal.role)}</span>. El cambio
              actualiza sus accesos y permisos de inmediato.
            </p>
            {rolModalUltimoAdmin && (
              <div className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-sm text-[#B45309]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Es el único administrador y debe quedar al menos uno. Para cambiarle el rol, primero
                  asigna otro administrador.
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4 mb-6">
              {ROLE_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.roles.map((option) => {
                      const selected = rolSel === option
                      const bloqueada = rolModalUltimoAdmin && option !== "admin"
                      return (
                        <button
                          key={option}
                          onClick={() => setRolSel(option)}
                          disabled={saving || bloqueada}
                          title={bloqueada ? "Debe quedar al menos un administrador" : undefined}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] text-left leading-tight transition-colors cursor-pointer disabled:cursor-not-allowed ${
                            selected
                              ? "border-[#16A34A] bg-[#F0FDF4] text-[#15803D] font-medium"
                              : bloqueada
                                ? "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                                : "border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <span className="flex-1">{labelFor(option)}</span>
                          {selected && <Check className="w-4 h-4 shrink-0 text-[#16A34A]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            {rolError && (
              <div className="flex items-center gap-1.5 mb-4 text-sm text-[#DC2626]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{rolError}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={cerrarCambioRol} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button
                onClick={guardarRol}
                disabled={saving || rolSel === rolModal.role}
                className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
              >
                <Check className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de éxito al cambiar el rol */}
      {rolOk && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1F2937]/40 backdrop-blur-sm"
          onClick={() => setRolOk(null)}
        >
          <div className="flex flex-col items-center text-center gap-3 bg-[#FFFFFF] rounded-2xl shadow-2xl px-12 py-10 mx-4 max-w-xs">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#16A34A]">
              <Check className="w-9 h-9 text-[#FFFFFF]" strokeWidth={3} />
            </div>
            <p className="text-xl font-bold font-heading text-[#1F2937]">Rol actualizado</p>
            <p className="text-sm text-[#6B7280]">{rolOk}</p>
          </div>
        </div>
      )}

      {/* Modal: eliminar (doble confirmación) */}
      {eliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setEliminar(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setEliminar(null)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#EF4444] mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Eliminar usuario</h3>
            <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
              Vas a eliminar de forma permanente a{" "}
              <span className="font-semibold text-[#1F2937]">{eliminar.full_name}</span> y todos sus datos
              (encuestas y notificaciones). Esta acción <span className="font-semibold text-[#EF4444]">no se puede deshacer</span>.
            </p>
            <label className="flex items-center gap-2 mb-5 text-sm text-[#475569] cursor-pointer select-none">
              <input type="checkbox" checked={eliminarOk} onChange={(e) => setEliminarOk(e.target.checked)} className="w-4 h-4 accent-[#EF4444] cursor-pointer" />
              Entiendo que es permanente.
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setEliminar(null)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={eliminarUsuario} disabled={saving || !eliminarOk} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] bg-[#EF4444] hover:bg-[#DC2626] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Trash2 className="w-4 h-4" />
                {saving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: nuevo usuario */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !creating && cerrarCrear()} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={cerrarCrear} disabled={creating} className="absolute top-4 right-4 p-1 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#EAF3DE] text-[#16A34A] shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-[#1F2937]">Nuevo usuario</h3>
                <p className="text-sm text-[#6B7280]">Crea una cuenta y asígnale un rol.</p>
              </div>
            </div>
            <div className="h-px bg-[#F1F5F9] mb-5" />
            <form className="flex flex-col gap-4" onSubmit={crearUsuario}>
              {createError && (
                <div className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Nombre completo</label>
                <input type="text" value={nuevo.full_name} onChange={(e) => setNuevo({ ...nuevo, full_name: e.target.value })} onBlur={() => markTouched("full_name")} placeholder="Juan Pérez García" className={campoCls(showNameError)} />
                {showNameError && <p className="text-[11px] text-[#DC2626]">{nameError}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Correo</label>
                <input type="email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} onBlur={() => markTouched("email")} placeholder="nombre@dominio.com" className={campoCls(showEmailError)} />
                {showEmailError && <p className="text-[11px] text-[#DC2626]">{emailError}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#1F2937]">Contraseña</label>
                  <button type="button" onClick={generar} className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] hover:text-[#15803D] cursor-pointer">
                    <Wand2 className="w-3.5 h-3.5" />
                    Generar
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={nuevo.password}
                    onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
                    onBlur={() => markTouched("password")}
                    placeholder="Mín. 8 caracteres"
                    className={`${campoCls(showPasswordError)} pr-16 ${nuevo.password ? "font-mono" : ""}`}
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="p-1 rounded text-[#94A3B8] hover:text-[#475569] cursor-pointer" aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={copiarContrasena} disabled={!nuevo.password} className="p-1 rounded text-[#94A3B8] hover:text-[#16A34A] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Copiar contraseña">
                      {copiado ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {nuevo.password ? (
                  <div className="mt-0.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i < pwFuerza.nivel ? pwFuerza.color : "#E2E8F0" }} />
                      ))}
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: pwFuerza.color }}>
                      {pwFuerza.label} · mayúsculas, minúsculas, números y símbolos.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#94A3B8]">Escríbela o pulsa «Generar»: mayúsculas, minúsculas, números y símbolos.</p>
                )}
                {showPasswordError && <p className="text-[11px] text-[#DC2626] mt-1">{passwordError}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => markTouched("confirmPassword")}
                    placeholder="Repite la contraseña"
                    className={`${campoCls(showConfirmError)} pr-10 ${confirmPassword ? "font-mono" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-2 flex items-center text-[#94A3B8] hover:text-[#475569] cursor-pointer" aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showConfirmError && (
                  <p className="text-[11px] text-[#DC2626]">{confirmError}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Rol</label>
                <select value={nuevo.role} onChange={(e) => setNuevo({ ...nuevo, role: e.target.value })} className={`${inputCls} cursor-pointer`}>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {labelFor(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button type="button" onClick={cerrarCrear} disabled={creating} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={creating || !formValido} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                  {creating ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
