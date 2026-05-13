/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/~ana.garces/univita',
  assetPrefix: '/~ana.garces/univita/',

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
