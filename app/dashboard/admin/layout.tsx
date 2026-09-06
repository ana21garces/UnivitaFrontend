import type { Metadata } from "next"
import { AdminShell } from "@/components/admin-shell"

// Componente de servidor para poder fijar el título de la pestaña. Las
// subrutas (user-management, auditoria, …) ponen el suyo con su propio
// layout.tsx; el índice /dashboard/admin usa este `default`.
export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s · UnacHealth",
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
