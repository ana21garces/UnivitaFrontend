/** @type {import('next').NextConfig} */

// En local NEXT_PUBLIC_BASE_PATH va vacío; en ubuntusrv vale '/~ana.garces/univita'
// (Apache publica el front bajo esa ruta). Se define en .env.local, no aquí,
// para que el archivo no cambie según la máquina.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  ...(basePath && { basePath, assetPrefix: `${basePath}/` }),

  images: {
    // sharp no funciona en el CPU de ubuntusrv (pre-x86-64-v2)
    unoptimized: true,
  },
}

export default nextConfig
