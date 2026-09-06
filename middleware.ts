import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROLE_HOME } from "@/lib/roles"

/**
 * Middleware de acceso.
 *
 * Antes solo miraba la cookie `univita8_survey_done`, así que un usuario SIN
 * sesión que entraba a /dashboard terminaba viendo la encuesta completa en vez
 * de la pantalla de acceso. Ahora también mira `univita8_auth` (una copia del
 * access token que el cliente pone al iniciar sesión):
 *
 *  - Sin sesión + /dashboard o /onboarding/survey  → a la pantalla de acceso.
 *  - Con sesión + /                                → a su panel.
 *  - Con sesión + /dashboard sin encuesta hecha    → a la encuesta (salvo roles exentos).
 *  - Con sesión + /onboarding/survey ya hecha      → al panel.
 *
 * El token también está en localStorage y en cada cabecera Authorization; la
 * cookie no añade superficie, solo permite al middleware ver que hay sesión.
 */
const AUTH_COOKIE = "univita8_auth"
const SURVEY_COOKIE = "univita8_survey_done"

// Rutas de dashboard que no requieren encuesta completada (roles sin encuesta).
const SURVEY_EXEMPT_PATHS = [
  "/dashboard/admin",
  "/dashboard/capellan",
  "/dashboard/actividad-fisica",
  "/dashboard/responsabilidad-salud",
  "/dashboard/relaciones-interpersonales",
  "/dashboard/manejo-estres",
  "/dashboard/nutricion",
  "/dashboard/perfil",
]

/**
 * ¿Hay sesión? Devuelve el payload del JWT (para leer el rol) o `null` si no hay
 * cookie. No se rechaza por caducidad: de eso ya se encarga el cliente HTTP
 * (renueva con el refresh token, y si tampoco vale, limpia y manda a "/"). El
 * middleware solo distingue «hay cookie de sesión» de «no hay».
 */
function leerToken(token: string | undefined): { role?: string } | null {
  if (!token) return null
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    return JSON.parse(atob(relleno)) as { role?: string }
  } catch {
    return {} // cookie presente pero ilegible: se trata como «con sesión»
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const sesion = leerToken(request.cookies.get(AUTH_COOKIE)?.value)
  const surveyDone = request.cookies.get(SURVEY_COOKIE)?.value === "true"

  const irA = (destino: string) => {
    const url = request.nextUrl.clone()
    url.pathname = destino
    url.search = ""
    return NextResponse.redirect(url)
  }

  // Responder una medición de seguimiento con ?seguimiento=1 (quien ya hizo la
  // encuesta puede volver). Requiere sesión.
  if (pathname.startsWith("/onboarding/survey") && searchParams.has("seguimiento")) {
    return sesion ? NextResponse.next() : irA("/")
  }

  // ── Sin sesión ────────────────────────────────────────────────────────────
  if (!sesion) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding/survey")) {
      return irA("/")
    }
    return NextResponse.next() // "/" y demás públicas
  }

  // ── Con sesión ────────────────────────────────────────────────────────────

  // En la pantalla de acceso con sesión activa → a su panel.
  if (pathname === "/") {
    const home = sesion.role ? ROLE_HOME[sesion.role] : undefined
    return irA(home ?? (surveyDone ? "/dashboard/user" : "/onboarding/survey"))
  }

  // Rutas exentas del requisito de encuesta.
  if (SURVEY_EXEMPT_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // /dashboard sin haber hecho la encuesta → a la encuesta.
  if (pathname.startsWith("/dashboard") && !surveyDone) {
    return irA("/onboarding/survey")
  }

  // /onboarding/survey ya hecha → al panel.
  if (pathname.startsWith("/onboarding/survey") && surveyDone) {
    return irA("/dashboard/user")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/onboarding/survey"],
}
