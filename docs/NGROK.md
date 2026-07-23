# Ngrok — test from any phone (HTTPS + GPS)

Use ngrok to open the app on **Poco F1 / any device** over **HTTPS** so browser GPS works.

## 1. Install & authenticate

```bash
brew install ngrok/ngrok/ngrok
ngrok config add-authtoken YOUR_TOKEN   # https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config check
```

## 2. Start backend + frontend

```bash
# Terminal 1 — API
cd api && pnpm start:dev

# Terminal 2 — Web
cd web && pnpm dev
```

## 3. Start ngrok (separate terminal)

**Important:** ngrok blocks the terminal. Run it in **Terminal 3** — not the same line as `pnpm dev`.

```bash
chmod +x scripts/start-ngrok.sh   # once
./scripts/start-ngrok.sh
```

Leave it running. Then in **Terminal 4**:

```bash
node scripts/sync-ngrok-env.mjs
cd web && pnpm dev
```

| Path | Proxied to |
|------|------------|
| `https://xxx.ngrok-free.dev/` | Next.js `:3000` |
| `https://xxx.ngrok-free.dev/backend-api/*` | NestJS `:3001/api/*` |
| `https://xxx.ngrok-free.dev/socket.io/*` | Socket.IO `:3001` |
| `tcp://0.tcp.ngrok.io:PORT` | GPS TCP `:5023` — only with `NGROK_TCP=1 ./scripts/start-ngrok.sh` |

> **Default** `./scripts/start-ngrok.sh` starts **web only** (phone app). TCP needs `NGROK_TCP=1 ./scripts/start-ngrok.sh`.

> **Do not** start separate `web` + `api` HTTP tunnels on free ngrok — both fight for the same domain → `ERR_NGROK_334`.

> **Do not** run `ngrok start --config ngrok.yml` alone — missing authtoken → `ERR_NGROK_4018`. Use `./scripts/start-ngrok.sh`.

## 4. Sync URLs (optional)

```bash
node scripts/sync-ngrok-env.mjs
```

When you open the app via **ngrok HTTPS**, API calls auto-use `/backend-api` even if `.env.local` still says `localhost`.

Restart web dev after sync if you changed `.env.local`:

```bash
cd web && pnpm dev
```

## 5. Open on phone

```
https://xxxx.ngrok-free.dev/bn/login
```

| Role | Phone | Password |
|------|-------|----------|
| Driver | 01700000001 | password123 |
| Admin | 01700000000 | password123 |

Driver: **Start Trip** → **Enable GPS** → allow location.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ERR_NGROK_8013` TCP needs card | Use `./scripts/start-ngrok.sh` (web only), or add card at ngrok dashboard, then `NGROK_TCP=1 ./scripts/start-ngrok.sh`. Local TCP test needs no ngrok: `node scripts/send-gps-tcp.mjs --host 127.0.0.1 --port 5023 ...` |
| `ERR_NGROK_4018` | `ngrok config add-authtoken TOKEN` + use `./scripts/start-ngrok.sh` |
| `ERR_NGROK_334` endpoint already online | Ctrl+C old ngrok, or run `./scripts/start-ngrok.sh` |
| Stuck on **Loading...** (ngrok/nginx/LAN) | Add host to `ALLOWED_DEV_ORIGINS` in `web/.env.local`, restart `pnpm dev`. See [NGINX.md](./NGINX.md) |
| GPS blocked | Use **https** ngrok URL only |
| API / login fails | Re-run `sync-ngrok-env.mjs`, restart `pnpm dev` in `web/` |
| Live map stuck | Same ngrok URL for WS — restart web after sync |
| TCP GPS test | See [TCP-GPS.md](./TCP-GPS.md) — `node scripts/send-gps-tcp.mjs` |

Inspect: http://127.0.0.1:4040
