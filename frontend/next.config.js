/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This rewrite will proxy API requests to the backend server in development
  // to avoid CORS issues.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
};

module.exports = nextConfig;
