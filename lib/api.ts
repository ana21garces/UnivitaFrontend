import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/lib/auth"

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

// ─────────────────────────────────────────────────────────────────────────────
// Renovación de sesión
//
// El access token dura 30 minutos. Sin esto, la sesión se caía a mitad de la
// encuesta de 52 ítems y había que escribir la contraseña otra vez.
// ─────────────────────────────────────────────────────────────────────────────

/** Marca de que una petición ya se reintentó, para no entrar en bucle. */
type PeticionReintentable = InternalAxiosRequestConfig & { _reintentada?: boolean }

/**
 * Una sola renovación en vuelo. Las vistas de rol lanzan dos y tres peticiones
 * a la vez; si todas fallan con 401, comparten esta promesa en vez de pedir
 * tres tokens distintos y pisarse unas a otras.
 */
let renovacionEnCurso: Promise<string | null> | null = null

async function renovarSesion(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    // Cliente aparte, a propósito: si esta llamada respondiera 401, no debe
    // pasar por el interceptor e intentar renovarse a sí misma.
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refresh_token: refresh },
      { headers: { "ngrok-skip-browser-warning": "true" } },
    )
    setAccessToken(data.access_token)
    return data.access_token
  } catch {
    // El refresh también caducó, o la cuenta se desactivó. Quien llamó
    // recibirá el 401 original y redirigirá al acceso.
    return null
  }
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    const original = error.config as PeticionReintentable | undefined

    if (error.response?.status !== 401 || !original || original._reintentada) {
      return Promise.reject(error)
    }
    original._reintentada = true

    if (!renovacionEnCurso) {
      renovacionEnCurso = renovarSesion().finally(() => {
        renovacionEnCurso = null
      })
    }

    const nuevoToken = await renovacionEnCurso
    if (!nuevoToken) return Promise.reject(error)

    return api(original)
  },
)

/** Lo mínimo que se necesita del router. Evita depender de tipos internos de Next. */
type Navegable = { replace: (href: string) => void }

/**
 * Traduce un fallo de la API a la navegación que corresponde:
 *
 * - **401** — la sesión ya no vale, y renovarla tampoco funcionó: se limpia y
 *   se vuelve al acceso.
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
