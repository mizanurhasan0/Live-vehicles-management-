import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  bkash: {
    baseUrl: process.env.BKASH_BASE_URL,
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    callbackUrl:
      process.env.BKASH_CALLBACK_URL ??
      'http://localhost:3000/bn/guardian/payments/callback',
  },
  osrmBaseUrl: process.env.OSRM_BASE_URL ?? 'https://router.project-osrm.org',
  gpsTcp: {
    enabled: process.env.GPS_TCP_ENABLED !== 'false',
    port: parseInt(process.env.GPS_TCP_PORT ?? '5023', 10),
    bind: process.env.GPS_TCP_BIND ?? '0.0.0.0',
  },
}));
