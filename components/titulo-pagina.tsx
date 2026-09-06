"use client"

import { useEffect } from "react"

/**
 * Título de la pestaña para las páginas que son componentes de cliente.
 *
 * En el App Router solo los componentes de servidor pueden `export const
 * metadata`, y casi todas las vistas del dashboard son `"use client"`. Esto
 * escribe `document.title` al montar y lo restaura al salir, para que la
 * pestaña diga «Mi perfil · UnacHealth», «Auditoría · UnacHealth», etc.
 */
export function useTituloPagina(titulo: string) {
  useEffect(() => {
    const anterior = document.title
    document.title = `${titulo} · UnacHealth`
    return () => {
      document.title = anterior
    }
  }, [titulo])
}

/** Igual que el hook, para usar como elemento dentro del JSX. No pinta nada. */
export function TituloPagina({ children }: { children: string }) {
  useTituloPagina(children)
  return null
}
