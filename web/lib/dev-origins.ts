/** Hostnames allowed to load Next.js dev assets (/_next/*) via proxy/nginx/LAN. */

export function collectAllowedDevOrigins(): string[] {
  const hosts = new Set<string>();

  for (const entry of (process.env.ALLOWED_DEV_ORIGINS ?? '').split(',')) {
    const raw = entry.trim();
    if (!raw) continue;
    try {
      const url = raw.includes('://') ? raw : `http://${raw}`;
      hosts.add(new URL(url).hostname);
    } catch {
      hosts.add(raw.split(':')[0] ?? raw);
    }
  }

  for (const key of ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_NGINX_URL']) {
    const value = process.env[key];
    if (!value) continue;
    try {
      hosts.add(new URL(value).hostname);
    } catch {
      /* ignore */
    }
  }

  return [...hosts];
}

export function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}
