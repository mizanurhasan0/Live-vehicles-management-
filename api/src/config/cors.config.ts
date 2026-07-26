import os from 'os';

function isPrivateOrLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function collectDevOrigins(): string[] {
  const origins = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  for (const entry of (process.env.CORS_ORIGINS ?? '').split(',')) {
    const origin = entry.trim();
    if (origin) origins.add(origin);
  }

  for (const interfaces of Object.values(os.networkInterfaces())) {
    if (!interfaces) continue;
    for (const iface of interfaces) {
      const isIPv4 = String(iface.family).includes('4') && !iface.internal;
      if (isIPv4 && !iface.internal) {
        origins.add(`http://${iface.address}:3000`);
      }
    }
  }

  return [...origins];
}

export function resolveCorsOptions() {
  const devOrigins = collectDevOrigins();

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        try {
          const { hostname } = new URL(origin);
          if (isPrivateOrLocalHost(hostname) || devOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
        } catch {
          /* ignore */
        }
        callback(null, true);
        return;
      }

      callback(null, devOrigins.includes(origin));
    },
    credentials: true,
  };
}
