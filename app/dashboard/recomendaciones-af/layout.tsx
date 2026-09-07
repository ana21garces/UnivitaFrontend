import type { Metadata } from "next"

// El title de estas vistas se pone aquí (server) y no en page.tsx: casi todas
// son "use client" y un componente de cliente no puede export const metadata.
export const metadata: Metadata = { title: "Plan · Actividad física" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
