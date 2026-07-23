# Madrasa Transport — Mobile App

Expo (React Native) app for **Driver** and **Guardian** roles. Uses the same NestJS API as `../api/`.

## Setup

```bash
cd mobile
cp .env.example .env
npm install
```

Edit `.env` — set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` to your API host (LAN IP or VPS). **Do not use `localhost` on a physical phone.**

Ensure API is running:

```bash
cd ../api && pnpm start:dev
```

## Run

```bash
npm start
# then press i (iOS simulator) or a (Android) or scan QR with Expo Go
```

## Seed logins

Password: `password123`

| Role | Phone |
|------|-------|
| Driver | 01700000001 |
| Guardian | 01700000003 |

Admin accounts show a message — use the web app for admin.

## Structure

```
app/           Expo Router screens (auth, driver, guardian)
src/
  components/  UI + role-specific views
  hooks/       TanStack Query + GPS + socket
  services/    API wrappers
  stores/      Auth (Zustand)
  i18n/        bn + en
```

See [../docs/MOBILE.md](../docs/MOBILE.md) for device testing with ngrok/LAN.
