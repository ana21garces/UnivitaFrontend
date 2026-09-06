"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"

/**
 * Marco visual del panel de administración (sidebar + topbar).
 *
 * Estaba en app/dashboard/admin/layout.tsx, pero ese archivo tenía que pasar a
 * ser componente de servidor para poder `export const metadata` (el título de
 * la pestaña). La parte con estado —el sidebar que se abre y cierra— vive aquí.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminTopbar onMenu={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  )
}
