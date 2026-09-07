import { useEffect, useRef } from "react"

// Abre el reporte individual de una persona cuando se llega a la vista desde una
// cita aceptada (`?reporte=<usuario_id>`). Reacciona a dos casos:
// - Llegada nueva / entre vistas: lee `?reporte=` al cargar los datos (una vez).
// - Clic en la campana estando en la misma vista: escucha el evento "reporte-nav".
export function useReporteEnlace(listo: boolean, abrir: (usuarioId: string) => void) {
  const hecho = useRef(false)
  const abrirRef = useRef(abrir)
  abrirRef.current = abrir

  useEffect(() => {
    if (hecho.current || !listo) return
    const id = new URLSearchParams(window.location.search).get("reporte")
    if (!id) return
    hecho.current = true
    abrirRef.current(id)
  }, [listo])

  useEffect(() => {
    const onNav = (e: Event) => {
      const id = (e as CustomEvent).detail
      if (typeof id === "string") abrirRef.current(id)
    }
    window.addEventListener("reporte-nav", onNav)
    return () => window.removeEventListener("reporte-nav", onNav)
  }, [])
}
