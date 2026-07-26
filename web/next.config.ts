import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { collectAllowedDevOrigins } from './lib/dev-origins';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const allowedDevOrigins = collectAllowedDevOrigins();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  async rewrites() {
    // Proxy API + Socket.IO through Next.js :3000 (nginx / LAN — one public URL)
    return [
      {
        source: '/backend-api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3001/socket.io/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
