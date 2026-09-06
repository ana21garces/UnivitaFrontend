/** @type {import('next').NextConfig} */

// En local NEXT_PUBLIC_BASE_PATH va vacío; en ubuntusrv vale '/~ana.garces/univita'
// (Apache publica el front bajo esa ruta). Se define en .env.local, no aquí,
// para que el archivo no cambie según la máquina.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

// Backend al que llega el servidor de Next (no el navegador) para servir
// /uploads (avatares). En local es el backend de desarrollo; en ubuntusrv,
// 127.0.0.1:8001. Se define en .env.local.
const backendInterno = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.BACKEND_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://localhost:8000'
).replace(/\/$/, '')

const nextConfig = {
  ...(basePath && { basePath, assetPrefix: `${basePath}/` }),

  images: {
    // sharp no funciona en el CPU de ubuntusrv (pre-x86-64-v2)
    unoptimized: true,
  },

  async rewrites() {
    // El front pide el avatar a su propio origen (/uploads/...) y Next lo
    // reenvía al backend. Evita exponer la URL interna del backend al navegador.
    return [
      { source: '/uploads/:path*', destination: `${backendInterno}/uploads/:path*` },
    ]
  },
}

export default nextConfig
