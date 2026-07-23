# TCP GPS (dev JSON protocol)

Hardware-style GPS ingest over **raw TCP**. Each line is one JSON object. Locations appear on the admin live map **without requiring an active trip** when the IMEI is linked to a vehicle.

## Protocol

Send **one JSON object per line**, terminated with `\n`:

```json
{"imei":"867530012345678","lat":23.8103,"lng":90.4125,"speed":25,"heading":180}
```

| Field | Required | Description |
|-------|----------|-------------|
| `imei` | yes | Device IMEI — must match `Vehicle.deviceImei` |
| `lat` | yes | Latitude (-90 … 90) |
| `lng` | yes | Longitude (-180 … 180) |
| `speed` | no | km/h |
| `heading` | no | degrees |

**Server replies:**

- `OK\n` — accepted, live map updated
- `ERR …\n` — invalid JSON, unknown IMEI, etc.

Default listen: **`0.0.0.0:5023`** (env: `GPS_TCP_PORT`, `GPS_TCP_ENABLED`, `GPS_TCP_BIND`).

## 1. Run API

```bash
cd api
pnpm start:dev
```

Log should show: `GPS TCP listening on 0.0.0.0:5023`

Apply migration if needed:

```bash
pnpm exec prisma migrate deploy
pnpm run db:seed   # DHK-1001 gets IMEI 867530012345678
```

## 2. Link IMEI to vehicle

Seed vehicle **DHK-1001** already has IMEI `867530012345678`.

In admin UI (**Vehicles → create/edit**), set **Device IMEI**, or PATCH `/api/vehicles/:id` with `{ "deviceImei": "..." }`.

## 3. Test locally

```bash
node scripts/send-gps-tcp.mjs \
  --host 127.0.0.1 --port 5023 \
  --imei 867530012345678 --lat 23.81 --lng 90.41
```

Expected: `Server: OK`

Open admin **Live Tracking** — marker for DHK-1001 should appear (no trip required).

## 4. Test via ngrok TCP (optional)

Requires **card verification** on ngrok free (`ERR_NGROK_8013` without it). For most dev, **local test (section 3) is enough**.

```bash
NGROK_TCP=1 ./scripts/start-ngrok.sh   # web + gps-tcp
node scripts/sync-ngrok-env.mjs
```

Example output:

```
GPS TCP: 0.tcp.ngrok.io:17123
```

Send through the tunnel:

```bash
node scripts/send-gps-tcp.mjs \
  --host 0.tcp.ngrok.io --port 17123 \
  --imei 867530012345678 --lat 23.81 --lng 90.41
```

Web app still uses the **HTTPS** ngrok URL from `sync-ngrok-env.mjs` (unchanged).

## Architecture

```
TCP client → :5023 (TcpGpsServer)
          → DeviceGpsSource → Redis (live map)
          → LocationBroadcastService → Socket.IO
          → LocationLog (only if vehicle has STARTED trip)
```

Phone GPS (`POST /tracking/location`) is unchanged.

## ngrok free tier

| Command | Tunnels |
|---------|---------|
| `./scripts/start-ngrok.sh` | **web only** (phone HTTPS — default) |
| `NGROK_TCP=1 ./scripts/start-ngrok.sh` | web + gps-tcp (**card required** on free) |

If TCP fails with `ERR_NGROK_8013`, use web-only ngrok for the app and test TCP locally on `127.0.0.1:5023`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ERR unknown or inactive IMEI` | Set `deviceImei` on vehicle; re-seed or admin UI |
| Connection refused | API running? `GPS_TCP_ENABLED=true`? |
| ngrok TCP missing | `./scripts/start-ngrok.sh` must start `web gps-tcp` |
| Map empty | Redis TTL 5 min — send again; refresh admin tracking |
| `ERR invalid JSON` | One JSON object per line, ending with `\n` |

See also: [NGROK.md](./NGROK.md), [api/docs/API.md](../api/docs/API.md).
