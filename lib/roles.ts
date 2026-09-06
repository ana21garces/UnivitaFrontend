/**
 * Home de cada rol.
 *
 * Este mapa estaba copiado en `middleware.ts` y en `components/login-form.tsx`,
 * y además `lib/api.ts` mandaba cualquier 403 a `/dashboard/user` a pelo. Eso
 * dejaba a un profesional o al admin que entraba a una ruta ajena a su rol
 * rebotando a `/dashboard/user` → y de ahí el middleware, al no tener encuesta
 * hecha, lo empujaba a `/onboarding/survey`. Un profesional acababa viendo (y
 * pudiendo enviar) la encuesta de estudiante. Ver H-25.
 *
 * Las claves son el `role` del JWT que emite el backend.
 */
export const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard/admin",
  capellan: "/dashboard/capellan",
  actividad_fisica: "/dashboard/actividad-fisica",
  responsabilidad_salud: "/dashboard/responsabilidad-salud",
  relaciones_interpersonales: "/dashboard/relaciones-interpersonales",
  manejo_estres: "/dashboard/manejo-estres",
  nutricion: "/dashboard/nutricion",
}

/**
 * Panel al que pertenece un rol. Para los roles encuestables (student, o un
 * rol desconocido) es `/dashboard/user`; nunca `/onboarding/survey`.
 */
export function homePorRol(rol: string | null | undefined): string {
  return (rol && ROLE_HOME[rol]) || "/dashboard/user"
}
