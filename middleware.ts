import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware to enforce onboarding survey completion.
 *
 * Logic:
 * - If the user navigates to /dashboard/* and has NOT completed the survey
 *   (cookie `univita8_survey_done` is absent), redirect to /onboarding/survey.
 * - If the user navigates to /onboarding/survey and HAS already completed it,
 *   redirect to /dashboard/user (skip the survey).
 *
 * In production this would check a DB-backed session; for the MVP we use a cookie
 * that the client sets after survey submission.
 */
// Rutas de dashboard que no requieren encuesta completada (roles sin encuesta)
const SURVEY_EXEMPT_PATHS = ["/dashboard/capellan"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const surveyDone = request.cookies.get("univita8_survey_done")?.value === "true"

  // Rutas exentas del requisito de encuesta
  if (SURVEY_EXEMPT_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Heading to dashboard without completing survey -> redirect to survey
  if (pathname.startsWith("/dashboard") && !surveyDone) {
    const url = request.nextUrl.clone()
    url.pathname = "/onboarding/survey"
    return NextResponse.redirect(url)
  }

  // Heading to survey but already completed -> skip to dashboard
  if (pathname.startsWith("/onboarding/survey") && surveyDone) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard/user"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/survey"],
}
