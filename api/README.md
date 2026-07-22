# Madrasa Transport API

NestJS backend for live vehicle tracking, transport management, and bKash payments.

See [docs/API.md](docs/API.md) for full setup and endpoint documentation.

## Quick Start

```bash
docker compose up -d
cp .env.example .env
pnpm install
pnpm exec prisma migrate deploy
pnpm run db:seed
pnpm run start:dev
```

Swagger: http://localhost:3001/api/docs
