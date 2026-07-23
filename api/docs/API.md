# Madrasa Transport API Documentation

Backend API for live vehicle tracking, transport management, and bKash payments.

## Quick Start

### 1. Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Docker Desktop (for PostgreSQL + Redis)

### 2. Start Database

```bash
cd api
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432` (user: `madrasa`, password: `madrasa123`, db: `madrasa_transport`)
- **Redis** on port `6379`

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your bKash Sandbox credentials:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `BKASH_APP_KEY` | bKash sandbox app key |
| `BKASH_APP_SECRET` | bKash sandbox app secret |
| `BKASH_USERNAME` | bKash sandbox username |
| `BKASH_PASSWORD` | bKash sandbox password |
| `BKASH_BASE_URL` | `https://tokenized.sandbox.bka.sh/v1.2.0-beta` |
| `OSRM_BASE_URL` | Optional — OSRM routing server (default: `https://router.project-osrm.org`, free, no API key) |
| `PORT` | API port (default: `3001`) |

### 4. Install & Migrate

```bash
pnpm install
pnpm exec prisma migrate deploy
pnpm run db:seed
```

### 5. Run API

```bash
pnpm run start:dev
```

- **API Base:** `http://localhost:3001/api`
- **Swagger UI:** `http://localhost:3001/api/docs`

---

## Seed Login Credentials

All accounts use password: **`password123`**

| Role | Phone | Access |
|---|---|---|
| Admin | `01700000000` | Full dashboard access |
| Driver 1 | `01700000001` | Start/end trips, send GPS |
| Driver 2 | `01700000002` | Start/end trips, send GPS |
| Guardian 1 | `01700000003` | Own children's vehicle & payments |
| Guardian 2 | `01700000004` | Own children's vehicle & payments |

---

## Swagger Testing Flow

1. Open `http://localhost:3001/api/docs`
2. Call `POST /api/auth/login` with admin phone + password
3. Copy `accessToken` from response
4. Click **Authorize** (top right) → paste token → Authorize
5. Test any protected endpoint

---

## API Modules

### Auth (`/api/auth`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login with phone + password |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | All | Invalidate refresh token |
| GET | `/auth/me` | All | Current user profile |

**Login example:**
```json
{ "phone": "01700000000", "password": "password123" }
```

---

### Madrasas (`/api/madrasas`) — Admin

CRUD for madrasa (tenant) records. SaaS-ready with `madrasaId` on all entities.

---

### Vehicles (`/api/vehicles`) — Admin

| Method | Endpoint | Description |
|---|---|---|
| POST | `/vehicles` | Create vehicle |
| GET | `/vehicles` | List (paginated) |
| GET | `/vehicles/:id` | Details with driver, route, students |
| PATCH | `/vehicles/:id` | Update / assign driver |
| DELETE | `/vehicles/:id` | Soft-delete (status → INACTIVE) |

---

### Drivers (`/api/drivers`) — Admin

Creates driver user account + profile in one step.

---

### Guardians (`/api/guardians`) — Admin

Creates guardian user account + profile.

---

### Students (`/api/students`)

| Role | Access |
|---|---|
| Admin | Full CRUD |
| Guardian | Read own children only |

---

### Routes (`/api/routes`) — Admin

Create routes with ordered stops (lat/lng). Stops replace on update.

---

### Trips (`/api/trips`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/trips/start` | Driver | Start trip (vehicle → ON_TRIP) |
| POST | `/trips/:id/end` | Driver | End trip |
| GET | `/trips/active` | Driver | Current active trip |
| GET | `/trips` | Admin | Trip history |

**Driver flow:**
1. Login as driver
2. `POST /trips/start`
3. Send GPS via `POST /tracking/location` or WebSocket
4. `POST /trips/:id/end`

---

### Tracking (`/api/tracking`)

#### REST

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/tracking/location` | Driver | Send GPS during active trip |
| GET | `/tracking/vehicles` | Admin | All live vehicle positions |
| GET | `/tracking/vehicles/:id` | Admin, Guardian | Single vehicle live data |
| GET | `/tracking/vehicles/:id/eta` | Admin, Guardian | ETA to pickup |

**Location payload:**
```json
{ "lat": 23.8103, "lng": 90.4125, "speed": 30, "heading": 180 }
```

**ETA query:** `?studentId=<id>` for pickup ETA to a specific student.

ETA uses **OSRM** (free OpenStreetMap routing, no API key). If OSRM is unavailable, falls back to straight-line **Haversine** estimate (`source: "haversine"`).

**Example ETA response (OSRM):**
```json
{
  "distanceText": "3.2 km",
  "durationText": "8 mins",
  "durationMinutes": 8,
  "estimated": false,
  "source": "osrm"
}
```

#### WebSocket (namespace: `/tracking`)

Connect with JWT in handshake:

```javascript
const socket = io('http://localhost:3001/tracking', {
  auth: { token: '<accessToken>' }
});

// Driver sends location
socket.emit('location:update', { lat: 23.81, lng: 90.41, speed: 25 });

// Admin/Guardian receives updates
socket.on('vehicle:location', (data) => console.log(data));
```

**Rooms:**
- Admin → `madrasa:{madrasaId}` (all vehicles)
- Guardian → `guardian:{guardianId}` (child's vehicle only)
- Driver → `driver:{driverId}`

#### TCP GPS (dev JSON lines)

Raw TCP server on port **5023** (configurable). One JSON object per line:

```json
{"imei":"867530012345678","lat":23.8103,"lng":90.4125,"speed":25,"heading":180}
```

- IMEI must match `Vehicle.deviceImei`
- Updates live map via Redis + WebSocket (no active trip required)
- Writes `LocationLog` only when vehicle has a `STARTED` trip
- Server replies: `OK\n` or `ERR …\n`

Full guide: [docs/TCP-GPS.md](../../docs/TCP-GPS.md)

Test:

```bash
node scripts/send-gps-tcp.mjs --host 127.0.0.1 --port 5023 --imei 867530012345678 --lat 23.81 --lng 90.41
```

---

### Payments (`/api/payments`) — bKash Sandbox

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/payments/initiate` | Guardian | Start payment for student monthly fee |
| POST | `/payments/execute` | Guardian | Execute bKash payment |
| POST | `/payments/callback` | Public | bKash webhook callback |
| GET | `/payments` | Admin, Guardian | Payment history |
| GET | `/payments/:id/invoice` | Admin, Guardian | Invoice/receipt data |

**Payment flow:**
1. Guardian: `POST /payments/initiate` → `{ studentId, month: "2026-07" }`
2. Response includes bKash `paymentID`
3. Complete payment in bKash sandbox app
4. `POST /payments/execute` with `{ paymentId: "<local-payment-id>" }`
5. Or bKash calls `POST /payments/callback`

---

### Notifications (`/api/notifications`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | User's notifications |
| PATCH | `/notifications/:id/read` | Mark as read |

Background jobs (BullMQ): trip started, near pickup, trip completed, payment reminder.

---

### Reports (`/api/reports`) — Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/income?month=2026-07` | Monthly collected fees |
| GET | `/reports/pending-payments?month=2026-07` | Unpaid students |
| GET | `/reports/vehicle-usage` | Trip counts per vehicle |
| GET | `/reports/driver-activity` | Trips per driver |

---

## Role Permission Matrix

| Feature | Admin | Guardian | Driver |
|---|---|---|---|
| Manage vehicles/drivers/students | Yes | No | No |
| View all vehicles live | Yes | No | No |
| View own child's vehicle | No | Yes | No |
| Start/end trip | No | No | Yes |
| Send GPS | No | No | Yes |
| Pay transport fee | No | Yes | No |
| View reports | Yes | No | No |

---

## Project Structure

```
api/src/
├── auth/           JWT login, refresh, guards
├── madrasas/       Tenant management
├── vehicles/       Vehicle CRUD
├── drivers/        Driver CRUD + user creation
├── guardians/      Guardian CRUD + user creation
├── students/       Student management
├── routes/         Routes with stops
├── trips/          Trip start/end lifecycle
├── tracking/       GPS REST + WebSocket gateway
├── payments/       bKash sandbox integration
├── notifications/  BullMQ notification queue
├── reports/        Admin analytics
├── common/         Guards, decorators, filters, DTOs
├── config/         Environment config
├── prisma/         Database service
└── redis/          Cache for live locations
```

---

## Common Commands

```bash
pnpm run start:dev      # Development with hot reload
pnpm run build          # Production build
pnpm run start:prod     # Run production build
pnpm run db:migrate     # Run migrations (dev)
pnpm run db:seed        # Seed test data
pnpm run lint           # ESLint
```

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["phone must be a string"]
}
```

---

## Next Steps (Phase 2)

- Self-hosted OSRM (for 100+ vehicles; public OSRM is fine for MVP)
- Binary GPS protocols (GT06, Teltonika) via TCP parsers
- Push notifications (FCM)
- QR/RFID attendance
- Multi-madrasa SaaS admin panel
