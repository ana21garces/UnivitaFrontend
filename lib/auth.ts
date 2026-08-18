export const ACCESS_TOKEN_KEY = "access_token"
export const REFRESH_TOKEN_KEY = "refresh_token"
export const SURVEY_COOKIE = "univita8_survey_done"

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
}

/** Rol leído del payload del JWT (base64, índice 1). */
export function getRoleFromToken(token: string): string | null {
  try {
    return JSON.parse(atob(token.split(".")[1])).role ?? null
  } catch {
    return null
  }
}
