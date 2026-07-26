# Mobile app (Expo)

React Native app in `mobile/` for **Driver** and **Guardian**. Admin uses the web app only.

## Prerequisites

- API running (`cd api && pnpm start:dev`)
- Node 18+
- Expo Go on phone, or iOS/Android simulator

## Configure API URL

```bash
cd mobile
cp .env.example .env
```

Set your machine **LAN IP** (find with `ipconfig getifaddr en0` on Mac):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.105:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.105:3001
```

Phone and Mac must be on the **same Wi‑Fi**.

## Run

```bash
cd mobile
npm install
npm start
```

Scan QR with **Expo Go** (Android/iOS). Do **not** press `w` for web — maps/GPS need a real device. Web shows a coordinate fallback only.

## Features

| Role | Tabs |
|------|------|
| Driver | Trip (start/end + GPS + map), Profile |
| Guardian | Home, Track, Pay (bKash), Profile |

## Permissions

- **Location** — required for driver GPS during active trip
- Grant when prompted on **Start Trip**

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Network error on login | Check `.env` IP, API running, same Wi‑Fi |
| GPS not updating | Allow location; start trip first |
| Admin login | Mobile is driver/guardian only — use web |
