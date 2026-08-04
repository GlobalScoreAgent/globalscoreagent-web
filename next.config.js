/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/certificaciones',
        destination: '/',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Dashboard API routes: allow heavier agent queries
  serverRuntimeConfig: {
    timeout: 30000,
  },
};

module.exports = nextConfig;
