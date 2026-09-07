// AI assisted development
/** Ruta pública de inicio de sesión (TR-001: la raíz `/` es la landing). */
export const LOGIN_PATH = "/login"

export const ACCESS_TOKEN_KEY = "access_token"
export const REFRESH_TOKEN_KEY = "refresh_token"
export const SURVEY_COOKIE = "univita8_survey_done"
// El token vive en localStorage (lo lee el cliente HTTP), pero el middleware
// corre en el edge y solo ve cookies. Se guarda una copia aquí para que pueda
// distinguir «con sesión» de «sin sesión» y no mande a un anónimo a la encuesta.
export const AUTH_COOKIE = "univita8_auth"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  setAuthCookie(token)
}

/** Cookie legible por el middleware. No es httpOnly a propósito: lleva el mismo
 *  access token que ya está en localStorage y en cada cabecera Authorization,
 *  así que no añade superficie; solo permite al middleware ver que hay sesión. */
export function setAuthCookie(token: string) {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=2592000; samesite=lax`
}

export function setSurveyDone(done: boolean) {
  document.cookie = done
    ? `${SURVEY_COOKIE}=true; path=/; max-age=31536000`
    : `${SURVEY_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

/** Borra tokens y cookie de encuesta. El middleware lee la cookie, así que
 *  dejarla puesta al salir permitiría volver al dashboard escribiendo la URL. */
export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  setSurveyDone(false)
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

/** Rol leído del payload del JWT (base64, índice 1). */
export function getRoleFromToken(token: string): string | null {
  try {
    return JSON.parse(atob(token.split(".")[1])).role ?? null
  } catch {
    return null
  }
}
