import axios from "axios"
import { clearSession, getAccessToken } from "@/lib/auth"

/**
 * Cliente único de la API.
 *
 * Antes cada pantalla declaraba su propio `API_URL`, armaba las cabeceras a
 * mano y repetía el manejo del 401. Ese bloque estaba copiado en once
 * archivos, así que cualquier cambio transversal —el refresco de token, una
 * cabecera nueva, un reintento— había que hacerlo once veces.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "ngrok-skip-browser-warning": "true" },
})

// El token se lee en cada petición, no al construir el cliente: cuando este
// módulo se carga por primera vez todavía no hay sesión iniciada.
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Lo mínimo que se necesita del router. Evita depender de tipos internos de Next. */
type Navegable = { replace: (href: string) => void }

/**
 * Traduce un fallo de la API a la navegación que corresponde:
 *
 * - **401** — la sesión ya no vale: se limpia y se vuelve al acceso.
 * - **403** — el rol no puede ver esa vista: se le manda a la suya.
 *
 * Devuelve `true` si ya redirigió, para que la pantalla no siga procesando el
 * error. Cualquier otro código lo maneja quien llama, que es el único que sabe
 * qué significa ahí un 404 o qué mensaje mostrar.
 */
export function redirigirPorError(err: unknown, router: Navegable): boolean {
  if (estadoDeError(err) === 401) {
    clearSession()
    router.replace("/")
    return true
  }
  if (estadoDeError(err) === 403) {
    router.replace("/dashboard/user")
    return true
  }
  return false
}

/** Código de estado de un fallo de la API, o `undefined` si no hubo respuesta. */
export function estadoDeError(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined
}
