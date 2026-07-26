# nginx + phone access

If you open the app via **nginx** (or LAN IP) and only see **Loading...**, Next.js dev is blocking JavaScript bundles.

## Root cause

Next.js 16 dev blocks `/_next/*` when the browser Host is not `localhost`. Without JS, React never hydrates → stuck on **Loading...**.

## Fix

### 1. Add your nginx/LAN host to `web/.env.local`

```env
# Your nginx server_name or Mac LAN IP (no http://)
ALLOWED_DEV_ORIGINS=192.168.1.105
NEXT_PUBLIC_APP_URL=http://192.168.1.105
```

For HTTPS nginx, use `https://your-domain.com` in `NEXT_PUBLIC_APP_URL` and the hostname in `ALLOWED_DEV_ORIGINS`.

Restart web dev after editing:

```bash
cd web && pnpm dev
```

### 2. Run API + web

```bash
cd api && pnpm start:dev
cd web && pnpm dev
```

### 3. Sample nginx config

Proxy everything to Next.js (`:3000`). API is proxied again by Next to NestJS (`:3001`) via `/backend-api`.

```nginx
server {
    listen 80;
    server_name 192.168.1.105;   # or your domain

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload nginx: `sudo nginx -s reload`

### 4. Open on phone

```
http://192.168.1.105/bn/login
```

> **GPS on phone:** HTTP LAN IP may block geolocation in Chrome. Use **HTTPS nginx** for driver GPS.

## Verify

1. Browser devtools → Network → scripts from `/_next/` should be **200**, not blocked  
2. API calls go to `/backend-api/...` on the **same host** as the page  
3. Terminal should **not** show `Blocked cross-origin request to Next.js dev resource`

## Multiple hosts

Comma-separate:

```env
ALLOWED_DEV_ORIGINS=192.168.1.105,mymadrasa.local
```
