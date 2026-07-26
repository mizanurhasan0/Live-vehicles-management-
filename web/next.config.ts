import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { collectAllowedDevOrigins } from './lib/dev-origins';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const allowedDevOrigins = collectAllowedDevOrigins();

const apiInternalUrl =
  process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  async rewrites() {
    // Proxy API + Socket.IO through Next.js (nginx / LAN / Docker — one public URL)
    return [
      {
        source: '/backend-api/:path*',
        destination: `${apiInternalUrl}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiInternalUrl}/socket.io/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
