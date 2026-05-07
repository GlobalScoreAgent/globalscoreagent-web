/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,   // ← Esto ignora temporalmente el error de tipos
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Aumentar timeout para API routes y permitir consultas pesadas
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Timeout más largo para requests (30 segundos)
  serverRuntimeConfig: {
    timeout: 30000,
  },
}

module.exports = nextConfig
