# Live Vehicles Management

Madrasa Transport Management & Live Tracking System.

## Project Structure

```
├── api/          NestJS backend (REST + WebSocket + Swagger)
│   └── docs/     API documentation
└── web/          Next.js frontend (coming soon)
```

## Backend Quick Start

```bash
cd api
docker compose up -d
cp .env.example .env    # add bKash sandbox credentials
pnpm install
pnpm exec prisma migrate deploy
pnpm run db:seed
pnpm run start:dev
```

- **Swagger:** http://localhost:3001/api/docs
- **Full docs:** [api/docs/API.md](api/docs/API.md)

## Seed Credentials

Password for all accounts: `password123`

| Role | Phone |
|---|---|
| Admin | 01700000000 |
| Driver | 01700000001 / 01700000002 |
| Guardian | 01700000003 / 01700000004 |

## Tech Stack

- **Backend:** NestJS, PostgreSQL, Prisma, Redis, BullMQ, Socket.IO, JWT, bKash, OSRM (free ETA/routing)
- **Frontend (planned):** Next.js, Tailwind, Shadcn UI
