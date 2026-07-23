/** Resolve API/WS base URLs for localhost, ngrok, nginx, or LAN proxy access. */

import { isLocalDevHost } from '@/lib/dev-origins';

function browserOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.origin;
}

/** When not on localhost, API is proxied via Next.js /backend-api (see next.config rewrites). */
function sameOriginApiBase(): string | null {
  const origin = browserOrigin();
  if (!origin) return null;
  try {
    const { hostname } = new URL(origin);
    if (!isLocalDevHost(hostname)) {
      return `${origin}/backend-api`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getApiBaseUrl(): string {
  const proxied = sameOriginApiBase();
  if (proxied) return proxied;

  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env;

  return 'http://localhost:3001/api';
}

export function getWsBaseUrl(): string {
  const origin = browserOrigin();
  if (origin) {
    try {
      if (!isLocalDevHost(new URL(origin).hostname)) {
        return origin;
      }
    } catch {
      /* ignore */
    }
  }

  const env = process.env.NEXT_PUBLIC_WS_URL;
  if (env) return env;

  return 'http://localhost:3001';
}
