"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, redirigirPorError } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
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
} from "lucide-react"

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
}

const ROLE_LABELS: Record<string, string> = {
  student: "Usuario",
  admin: "Administrador",
  capellan: "Capellán",
  actividad_fisica: "Actividad física",
  responsabilidad_salud: "Responsabilidad en salud",
  relaciones_interpersonales: "Relaciones interpersonales",
  manejo_estres: "Manejo del estrés",
}

const ASSIGNABLE_ROLES = [
  "student",
  "capellan",
  "actividad_fisica",
  "responsabilidad_salud",
  "relaciones_interpersonales",
  "manejo_estres",
  "admin",
]

const roleStyle: Record<string, { bg: string; text: string; dot: string }> = {
  student: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#22C55E]" },
  admin: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
  capellan: { bg: "bg-[#FFFBEB]", text: "text-[#B45309]", dot: "bg-[#F59E0B]" },
  actividad_fisica: { bg: "bg-[#ECFEFF]", text: "text-[#0891B2]", dot: "bg-[#06B6D4]" },
  responsabilidad_salud: { bg: "bg-[#FFF1F2]", text: "text-[#E11D48]", dot: "bg-[#F43F5E]" },
  relaciones_interpersonales: { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", dot: "bg-[#6366F1]" },
  manejo_estres: { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]", dot: "bg-[#7C3AED]" },
}
const styleFor = (r: string) =>
  roleStyle[r] ?? { bg: "bg-[#F1F5F9]", text: "text-[#6B7280]", dot: "bg-[#94A3B8]" }
const labelFor = (r: string) => ROLE_LABELS[r] ?? r

// Chip neutro (para los modales, donde el color por rol distrae).
const neutralChip =
  "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0]"

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<"all" | "active" | "suspended">("all")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [confirmRol, setConfirmRol] = useState<{ user: ApiUser; toRole: string } | null>(null)
  const [detalle, setDetalle] = useState<ApiUser | null>(null)
  const [eliminar, setEliminar] = useState<ApiUser | null>(null)
  const [eliminarOk, setEliminarOk] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [nuevo, setNuevo] = useState({ full_name: "", email: "", password: "", role: "student" })

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/")
      return
    }
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        if (!redirigirPorError(err, router)) setLoadError("No pudimos cargar los usuarios. Inténtalo de nuevo.")
      })
      .finally(() => setLoading(false))
  }, [router])

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchesEstado =
      filterEstado === "all" || (filterEstado === "active" ? u.is_active : !u.is_active)
    const matchesRole = filterRole === "all" || u.role === filterRole
    return matchesSearch && matchesEstado && matchesRole
  })

  const totalActivos = users.filter((u) => u.is_active).length
  const estadoPills = [
    { key: "all" as const, label: "Todos", count: users.length },
    { key: "active" as const, label: "Activos", count: totalActivos },
    { key: "suspended" as const, label: "Suspendidos", count: users.length - totalActivos },
  ]

  function elegirRol(user: ApiUser, newRole: string) {
    setOpenRoleMenuId(null)
    if (user.role === newRole) return
    setConfirmRol({ user, toRole: newRole })
  }

  async function confirmarRol() {
    if (!confirmRol) return
    const { user, toRole } = confirmRol
    setSaving(true)
    try {
      const { data } = await api.patch(`/users/${user.id}/role`, { role: toRole })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)))
      setConfirmRol(null)
    } catch (err) {
      if (!redirigirPorError(err, router)) {
        setLoadError("No pudimos cambiar el rol. Inténtalo de nuevo.")
        setConfirmRol(null)
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
      if (!redirigirPorError(err, router)) setLoadError("No pudimos cambiar el estado. Inténtalo de nuevo.")
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
        setLoadError("No pudimos eliminar el usuario. Inténtalo de nuevo.")
        setEliminar(null)
      }
    } finally {
      setSaving(false)
    }
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    if (nuevo.full_name.trim().length < 2) return setCreateError("Ingresa el nombre completo.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevo.email))
      return setCreateError("Ingresa un correo válido, por ejemplo: nombre@dominio.com")
    if (nuevo.password.length < 8) return setCreateError("La contraseña debe tener al menos 8 caracteres.")
    setCreating(true)
    try {
      const { data } = await api.post("/users", nuevo)
      setUsers((prev) => [data, ...prev])
      setShowCreate(false)
      setNuevo({ full_name: "", email: "", password: "", role: "student" })
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
  const btnBase = "flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer"
  const btnVer = `${btnBase} bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]`
  const btnRol = `${btnBase} bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:bg-[#DBEAFE]`
  const btnEstado = `${btnBase} bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] hover:bg-[#FEF3C7]`
  const btnDel = `${btnBase} bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]`

  const Avatar = ({ name }: { name: string }) => (
    <div className="w-9 h-9 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A] shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
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

  const Acciones = ({ user }: { user: ApiUser }) => (
    <div className="flex items-center justify-center gap-1.5">
      <button onClick={() => setDetalle(user)} className={btnVer} title="Ver detalles">
        <Eye className="w-4 h-4" />
      </button>
      <div className="relative">
        <button
          onClick={() => setOpenRoleMenuId(openRoleMenuId === user.id ? null : user.id)}
          className={btnRol}
          title="Cambiar rol"
        >
          <UserCog className="w-4 h-4" />
        </button>
        {openRoleMenuId === user.id && (
          <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] shadow-lg py-1">
            {ASSIGNABLE_ROLES.map((option) => {
              const isCurrent = user.role === option
              return (
                <button
                  key={option}
                  onClick={() => elegirRol(user, option)}
                  disabled={isCurrent}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                    isCurrent ? "bg-[#F1F5F9] text-[#94A3B8] cursor-default" : "text-[#1F2937] hover:bg-[#F8FAFC] cursor-pointer"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${styleFor(option).dot}`} />
                  {labelFor(option)}
                  {isCurrent && <span className="ml-auto text-[10px] text-[#94A3B8]">Actual</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <button
        onClick={() => toggleEstado(user)}
        className={btnEstado}
        title={user.is_active ? "Suspender" : "Activar"}
      >
        {user.is_active ? <Ban className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
      </button>
      <button
        onClick={() => {
          setEliminarOk(false)
          setEliminar(user)
        }}
        className={btnDel}
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.full_name} />
                            <div className="min-w-0">
                              <p className="font-medium text-[#1F2937] truncate">{user.full_name}</p>
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
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={user.full_name} />
                      <div className="min-w-0">
                        <p className="font-medium text-[#1F2937] text-sm truncate">{user.full_name}</p>
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
      </main>

      {/* Capa para cerrar el menú de roles */}
      {openRoleMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenRoleMenuId(null)} />}

      {/* Modal: ver detalles */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => setDetalle(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setDetalle(null)} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-lg font-bold text-[#16A34A]">
                {detalle.full_name.charAt(0).toUpperCase()}
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

      {/* Modal: confirmar cambio de rol */}
      {confirmRol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !saving && setConfirmRol(null)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setConfirmRol(null)} disabled={saving} className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EAF3DE] text-[#16A34A] mb-4">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Confirmar cambio de rol</h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              Vas a cambiar el rol de{" "}
              <span className="font-semibold text-[#1F2937]">{confirmRol.user.full_name}</span> de{" "}
              <span className="font-semibold text-[#1F2937]">{labelFor(confirmRol.user.role)}</span> a{" "}
              <span className="font-semibold text-[#1F2937]">{labelFor(confirmRol.toRole)}</span>. Esto
              actualizará sus accesos y permisos de inmediato.
            </p>
            <div className="flex items-center justify-center gap-3 mb-6 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className={neutralChip}>{labelFor(confirmRol.user.role)}</span>
              <svg className="w-5 h-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className={neutralChip}>{labelFor(confirmRol.toRole)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setConfirmRol(null)} disabled={saving} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmarRol} disabled={saving} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
                <Check className="w-4 h-4" />
                {saving ? "Guardando..." : "Confirmar"}
              </button>
            </div>
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
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={() => !creating && setShowCreate(false)} />
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => setShowCreate(false)} disabled={creating} className="absolute top-4 right-4 p-1 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">Nuevo usuario</h3>
            <p className="text-sm text-[#6B7280] mb-5">Crea una cuenta y asígnale un rol.</p>
            <form className="flex flex-col gap-4" onSubmit={crearUsuario}>
              {createError && (
                <div className="flex items-center gap-1.5 text-sm text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Nombre completo</label>
                <input type="text" value={nuevo.full_name} onChange={(e) => setNuevo({ ...nuevo, full_name: e.target.value })} placeholder="Juan Pérez García" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Correo</label>
                <input type="email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} placeholder="nombre@dominio.com" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">Contraseña</label>
                <input type="password" value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} placeholder="Mín. 8 caracteres" className={inputCls} />
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
                <button type="button" onClick={() => setShowCreate(false)} disabled={creating} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={creating} className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
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
