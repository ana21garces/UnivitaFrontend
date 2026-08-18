/**
 * Escala de niveles del PEPS II. Definición única en el frontend.
 *
 * Los cortes son los del backend, en `_nivel_por_indice`
 * (app/services/encuesta_hplp_service.py):
 * `≤25 Pobre`, `≤50 Moderado`, `≤75 Bueno`, `>75 Excelente`.
 *
 * Estaba escrita en cinco sitios con tres escalas distintas: el hub del
 * estudiante clasificaba con 34 / 67 / 84, las vistas de actividad física y
 * responsabilidad en salud mostraban una leyenda de 0–33 / 34–55 / 56–77 /
 * 78–100, `level-badge.tsx` inventaba cinco nombres en dos idiomas, y solo la
 * vista de capellán coincidía con la API. Vive aquí para que no vuelva a
 * separarse.
 *
 * El nombre del nivel de un resultado concreto **no se calcula**: lo manda la
 * API en `nivel_global` y en el `nivel` de cada dimensión. Estos cortes sirven
 * para las leyendas y para saber cuánto falta para el siguiente nivel.
 */
export const NIVELES = [
  { numero: 1, nivel: "Pobre", corte: 25, rango: "0 – 25" },
  { numero: 2, nivel: "Moderado", corte: 50, rango: "26 – 50" },
  { numero: 3, nivel: "Bueno", corte: 75, rango: "51 – 75" },
  { numero: 4, nivel: "Excelente", corte: null, rango: "76 – 100" },
] as const

/** Rango legible por nombre de nivel, para las leyendas de las vistas de rol. */
export const RANGO_POR_NIVEL: Record<string, string> = {
  Pobre: "0 – 25",
  Moderado: "26 – 50",
  Bueno: "51 – 75",
  Excelente: "76 – 100",
}

/**
 * Número de nivel, nombre y siguiente corte, a partir del nivel que devuelve
 * la API. Si llegara un nombre desconocido, cae en el primero en vez de
 * romper la pantalla.
 */
export function infoDeNivel(nivelGlobal: string) {
  const i = Math.max(
    0,
    NIVELES.findIndex((n) => n.nivel === nivelGlobal),
  )
  const actual = NIVELES[i]
  const siguiente = i + 1 < NIVELES.length ? NIVELES[i + 1] : null

  return {
    numero: actual.numero,
    nivel: actual.nivel,
    nextThreshold: actual.corte,
    nextNivel: siguiente ? siguiente.nivel : null,
  }
}
