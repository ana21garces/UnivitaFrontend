# UnacHealth — Frontend

Plataforma de estilo de vida saludable para la UNAC. Aplica la encuesta **PEPS-II**
(52 ítems, 6 dimensiones) y muestra resultados y recomendaciones por rol.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript

## Arranque local

```bash
pnpm install
cp .env.example .env.local   # ajustar si el backend no está en :8000
pnpm dev
```

El backend (FastAPI, repo `vitalis-api`) debe estar corriendo aparte en `localhost:8000`.

## Variables de entorno

Ver `.env.example`. Las tres que importan:

| Variable | Local | Servidor |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api/proxy` | URL pública absoluta con `/api/v1` |
| `BACKEND_URL` | `http://localhost:8000/api/v1` | (sin uso) |
| `NEXT_PUBLIC_BASE_PATH` | vacío | `/~ana.garces/univita` |

En local el navegador llama a `/api/proxy/*` y la ruta
[`app/api/proxy/[...path]/route.ts`](app/api/proxy/[...path]/route.ts) reenvía al backend
(evita CORS). En el servidor se llama al backend directo y el proxy no se usa.

`NEXT_PUBLIC_BASE_PATH` alimenta el `basePath` de `next.config.mjs` **y** las rutas de
imágenes. Por eso no se define en el config: cambiar de máquina no debe ensuciar el diff.

## Rutas y roles

El rol se lee del JWT en el login y decide la vista de entrada (`ROLE_HOME` en
[`components/login-form.tsx`](components/login-form.tsx)).

| Rol (JWT) | Entra a |
|---|---|
| `admin` | `/dashboard/admin` |
| `capellan` | `/dashboard/capellan` |
| `actividad_fisica` | `/dashboard/actividad-fisica` |
| `responsabilidad_salud` | `/dashboard/responsabilidad-salud` |
| resto | encuesta → `/dashboard/user` |

[`middleware.ts`](middleware.ts) obliga a completar la encuesta antes de entrar a
`/dashboard/*`, salvo para las rutas de `SURVEY_EXEMPT_PATHS`. Se apoya en la cookie
`univita8_survey_done`, que se escribe **solo** desde `lib/auth.ts`.

Desde `/dashboard/user` se llega a las recomendaciones por dimensión: `plan-semanal`
(psicología positiva), `recomendaciones-af` y `recomendaciones/responsabilidad-salud`.

## Despliegue (ubuntusrv)

El CPU es anterior a x86-64-v2: **no soporta Turbopack ni sharp**. Hay que compilar con
webpack y no importar imágenes estáticamente (se sirven desde `public/`).

```bash
npx next build --webpack && npx next start -p 3001
```

## Scripts

- `pnpm dev` — desarrollo
- `pnpm build` / `pnpm start` — producción
- `pnpm typecheck` — `tsc --noEmit`
