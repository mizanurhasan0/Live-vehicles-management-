# Madrasa Transport Web

Next.js frontend integrated with the NestJS API.

## Stack

- Next.js 16, Tailwind 4, TanStack Query, Zustand, next-intl (bn/en)
- Leaflet + OpenStreetMap (free live map)
- Service + hook pattern

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

API must run on `http://localhost:3001` (`cd ../api && pnpm run start:dev`).

## URLs

| URL | Description |
|---|---|
| http://localhost:3000/bn/login | Login (Bangla) |
| http://localhost:3000/en/login | Login (English) |
| `/bn/admin` | Admin panel |
| `/bn/guardian` | Guardian panel |
| `/bn/driver` | Driver panel |

## Seed logins (password: `password123`)

| Role | Phone |
|---|---|
| Admin | 01700000000 |
| Driver | 01700000001 |
| Guardian | 01700000003 |

## Project structure

```
components/ui/     Shared UI (Button, Input, Card, Table, Modal)
components/layout/ PanelLayout, RoleGuard, LangSwitcher
components/shared/ DataTable, LiveMap, PageHeader
hooks/             TanStack Query hooks
services/          API service layer
stores/            Zustand auth store
messages/          bn.json, en.json
```
