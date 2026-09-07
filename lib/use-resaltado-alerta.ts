import { useEffect, useRef, useState } from "react"

// Resalta y hace scroll a la fila de un estudiante cuando se llega a la vista
// desde una alerta de la campana (`?alerta=<usuario_id>`). Reacciona al evento
// "alerta-nav" que dispara la campana, así también funciona si ya se estaba en
// la misma vista (solo cambia el query, sin remontar). Devuelve el ref de la
// fila y si está resaltada; `onResaltar` se llama una vez (p. ej. desplegar).
export function useResaltadoAlerta(
  usuarioId: string | undefined,
  onResaltar?: () => void,
) {
  const ref = useRef<HTMLDivElement>(null)
  const [alertaId, setAlertaId] = useState<string | null>(null)

  useEffect(() => {
    // Solo resalta cuando se hace clic en una alerta de la campana (evento),
    // nunca al entrar o recargar la vista: con muchos estudiantes en alerta,
    // saltar a uno solo al entrar sería confuso.
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setAlertaId(typeof detail === "string" ? detail : null)
    }
    window.addEventListener("alerta-nav", onNav)
    return () => window.removeEventListener("alerta-nav", onNav)
  }, [])

  const resaltado = !!usuarioId && usuarioId === alertaId

  useEffect(() => {
    if (!resaltado) return
    onResaltar?.()
    const t = setTimeout(
      () => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      150,
    )
    return () => clearTimeout(t)
    // onResaltar se deja fuera a propósito: solo debe correr al cambiar resaltado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resaltado])

  return { ref, resaltado }
}
