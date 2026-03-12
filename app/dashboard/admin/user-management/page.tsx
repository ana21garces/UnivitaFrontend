"use client"

import { useState } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import {
  Users,
  Search,
  ChevronDown,
  AlertTriangle,
  X,
  Check,
} from "lucide-react"

type Role = "Cliente" | "Gestor de Salud" | "Administrador"

interface UserRecord {
  id: number
  name: string
  email: string
  role: Role
  status: "Activo" | "Inactivo"
  registeredAt: string
}

const initialUsers: UserRecord[] = [
  { id: 1, name: "Maria Garcia", email: "maria.garcia@universidad.edu", role: "Cliente", status: "Activo", registeredAt: "2026-01-15" },
  { id: 2, name: "Carlos Rodriguez", email: "carlos.rod@universidad.edu", role: "Cliente", status: "Activo", registeredAt: "2026-01-18" },
  { id: 3, name: "Ana Lopez", email: "ana.lopez@universidad.edu", role: "Gestor de Salud", status: "Activo", registeredAt: "2026-01-10" },
  { id: 4, name: "Pedro Martinez", email: "pedro.mtz@universidad.edu", role: "Cliente", status: "Inactivo", registeredAt: "2026-02-01" },
  { id: 5, name: "Sofia Torres", email: "sofia.torres@universidad.edu", role: "Cliente", status: "Activo", registeredAt: "2026-02-05" },
  { id: 6, name: "Diego Sanchez", email: "diego.sanchez@universidad.edu", role: "Administrador", status: "Activo", registeredAt: "2025-12-01" },
  { id: 7, name: "Lucia Fernandez", email: "lucia.fdz@universidad.edu", role: "Cliente", status: "Activo", registeredAt: "2026-02-10" },
  { id: 8, name: "Jorge Ramirez", email: "jorge.ram@universidad.edu", role: "Gestor de Salud", status: "Activo", registeredAt: "2026-01-22" },
  { id: 9, name: "Elena Diaz", email: "elena.diaz@universidad.edu", role: "Cliente", status: "Inactivo", registeredAt: "2026-01-28" },
  { id: 10, name: "Fernando Ruiz", email: "fernando.ruiz@universidad.edu", role: "Cliente", status: "Activo", registeredAt: "2026-02-14" },
]

const roleOptions: Role[] = ["Cliente", "Gestor de Salud", "Administrador"]

const roleBadgeStyles: Record<Role, { bg: string; text: string; dot: string }> = {
  Cliente: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#22C55E]" },
  "Gestor de Salud": { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]", dot: "bg-[#7C3AED]" },
  Administrador: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
}

const statusBadgeStyles: Record<string, { bg: string; text: string }> = {
  Activo: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
  Inactivo: { bg: "bg-[#FEF2F2]", text: "text-[#EF4444]" },
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | Role>("all")
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    userId: number
    userName: string
    fromRole: Role
    toRole: Role
  } | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || u.role === filterRole
    return matchesSearch && matchesRole
  })

  function handleRoleSelect(userId: number, newRole: Role) {
    const user = users.find((u) => u.id === userId)
    if (!user || user.role === newRole) {
      setOpenDropdownId(null)
      return
    }
    setConfirmModal({
      userId,
      userName: user.name,
      fromRole: user.role,
      toRole: newRole,
    })
    setOpenDropdownId(null)
  }

  function confirmRoleChange() {
    if (!confirmModal) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === confirmModal.userId ? { ...u, role: confirmModal.toRole } : u
      )
    )
    setConfirmModal(null)
  }

  const roleCounts = {
    all: users.length,
    Cliente: users.filter((u) => u.role === "Cliente").length,
    "Gestor de Salud": users.filter((u) => u.role === "Gestor de Salud").length,
    Administrador: users.filter((u) => u.role === "Administrador").length,
  }

  return (
    <>
      <DashboardNavbar role="admin" userName="Admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#1F2937]">
              User Management
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage registered users and assign roles
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <Users className="w-4.5 h-4.5 text-[#16A34A]" />
            <span className="text-sm font-semibold text-[#1F2937]">{users.length}</span>
            <span className="text-sm text-[#6B7280]">total users</span>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#1F2937] text-sm placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-colors"
            />
          </div>

          {/* Role filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", ...roleOptions] as const).map((option) => {
              const isActive = filterRole === option
              const label = option === "all" ? "All" : option
              const count = roleCounts[option]
              return (
                <button
                  key={option}
                  onClick={() => setFilterRole(option)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#16A34A] text-[#FFFFFF]"
                      : "bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-[#FFFFFF]/20 text-[#FFFFFF]" : "bg-[#E2E8F0] text-[#6B7280]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#6B7280]">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B7280]">Current Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B7280]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6B7280]">Registered</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#6B7280]">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const rStyle = roleBadgeStyles[user.role]
                  const sStyle = statusBadgeStyles[user.status]
                  const isDropdownOpen = openDropdownId === user.id
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors"
                    >
                      {/* User info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A] shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#1F2937] truncate">{user.name}</p>
                            <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${rStyle.bg} ${rStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rStyle.dot}`} />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sStyle.bg} ${sStyle.text}`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-[#6B7280]">
                        {new Date(user.registeredAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Role dropdown */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdownId(isDropdownOpen ? null : user.id)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#1F2937] hover:border-[#16A34A]/40 transition-colors cursor-pointer"
                          >
                            Change Role
                            <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] shadow-lg py-1">
                              {roleOptions.map((option) => {
                                const optStyle = roleBadgeStyles[option]
                                const isCurrent = user.role === option
                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleRoleSelect(user.id, option)}
                                    disabled={isCurrent}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                                      isCurrent
                                        ? "bg-[#F1F5F9] text-[#6B7280] cursor-default"
                                        : "text-[#1F2937] hover:bg-[#F8FAFC]"
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${optStyle.dot}`} />
                                    {option}
                                    {isCurrent && (
                                      <span className="ml-auto text-[10px] text-[#6B7280]">Current</span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-[#E2E8F0]">
            {filteredUsers.map((user) => {
              const rStyle = roleBadgeStyles[user.role]
              const sStyle = statusBadgeStyles[user.status]
              const isDropdownOpen = openDropdownId === user.id
              return (
                <div key={user.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-sm font-bold text-[#16A34A]">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F2937] text-sm">{user.name}</p>
                        <p className="text-xs text-[#6B7280]">{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${sStyle.bg} ${sStyle.text}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${rStyle.bg} ${rStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rStyle.dot}`} />
                      {user.role}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : user.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#1F2937] cursor-pointer"
                      >
                        Change Role
                        <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] shadow-lg py-1">
                          {roleOptions.map((option) => {
                            const optStyle = roleBadgeStyles[option]
                            const isCurrent = user.role === option
                            return (
                              <button
                                key={option}
                                onClick={() => handleRoleSelect(user.id, option)}
                                disabled={isCurrent}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                                  isCurrent
                                    ? "bg-[#F1F5F9] text-[#6B7280] cursor-default"
                                    : "text-[#1F2937] hover:bg-[#F8FAFC]"
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${optStyle.dot}`} />
                                {option}
                                {isCurrent && (
                                  <span className="ml-auto text-[10px] text-[#6B7280]">Current</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredUsers.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-[#6B7280]">
                No users found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          />

          {/* Modal */}
          <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md mx-4 p-6">
            {/* Close button */}
            <button
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FACC15]/15 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#FACC15]" />
            </div>

            <h3 className="text-lg font-bold font-heading text-[#1F2937] mb-1">
              Confirm Role Change
            </h3>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              You are about to change the role of{" "}
              <span className="font-semibold text-[#1F2937]">{confirmModal.userName}</span>{" "}
              from{" "}
              <span className={`font-semibold ${roleBadgeStyles[confirmModal.fromRole].text}`}>
                {confirmModal.fromRole}
              </span>{" "}
              to{" "}
              <span className={`font-semibold ${roleBadgeStyles[confirmModal.toRole].text}`}>
                {confirmModal.toRole}
              </span>.
              This action will update their access and permissions immediately.
            </p>

            {/* Role change visualization */}
            <div className="flex items-center justify-center gap-3 mb-6 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeStyles[confirmModal.fromRole].bg} ${roleBadgeStyles[confirmModal.fromRole].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleBadgeStyles[confirmModal.fromRole].dot}`} />
                {confirmModal.fromRole}
              </span>
              <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeStyles[confirmModal.toRole].bg} ${roleBadgeStyles[confirmModal.toRole].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleBadgeStyles[confirmModal.toRole].dot}`} />
                {confirmModal.toRole}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm font-medium text-[#6B7280] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="flex-1 h-10 rounded-lg text-sm font-semibold text-[#FFFFFF] transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
              >
                <Check className="w-4 h-4" />
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
