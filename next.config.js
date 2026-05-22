/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
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
};

module.exports = nextConfig;
