/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.globalscoreagent.com' }],
        destination: 'https://globalscoreagent.com/:path*',
        permanent: true,
      },
      {
        source: '/certificaciones',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/#mission',
        permanent: false,
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
