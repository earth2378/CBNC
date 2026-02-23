/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_ORIGIN || 'http://localhost:3001';
    return [
      {
        source: '/backend/:path*',
        destination: `${backend}/:path*`
      }
    ];
  }
};

export default nextConfig;
