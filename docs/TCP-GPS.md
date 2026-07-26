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

## Architecture

```
TCP client → :5023 (TcpGpsServer)
          → DeviceGpsSource → Redis (live map)
          → LocationBroadcastService → Socket.IO
          → LocationLog (only if vehicle has STARTED trip)
```

Phone GPS (`POST /tracking/location`) is unchanged.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ERR unknown or inactive IMEI` | Set `deviceImei` on vehicle; re-seed or admin UI |
| Connection refused | API running? `GPS_TCP_ENABLED=true`? |
| Map empty | Redis TTL 5 min — send again; refresh admin tracking |
| `ERR invalid JSON` | One JSON object per line, ending with `\n` |

See also: [api/docs/API.md](../api/docs/API.md).
