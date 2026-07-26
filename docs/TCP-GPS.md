# TCP GPS (GT06 + JSON)

Hardware GPS ingest over **raw TCP** on port **5023** (default). Supports:

- **GT06 binary** — real GPS trackers (auto-detected by default)
- **JSON lines** — dev/testing (`scripts/send-gps-tcp.mjs`)

Locations appear on the admin live map **without requiring an active trip** when the IMEI is linked to a vehicle.

## GT06 hardware tracker

### Configure device (SMS to tracker SIM)

```
SZCS#SERVIP=YOUR_VPS_IP#SERVPORT=5023
SZCS#APN=internet
SZCS#USER=YOUR_PHONE
CXZT
```

Restart device after changing server (`CQ` SMS) if needed.

### Env

| Variable | Default | Description |
|----------|---------|-------------|
| `GPS_TCP_ENABLED` | `true` | Enable TCP server |
| `GPS_TCP_PORT` | `5023` | Listen port |
| `GPS_TCP_BIND` | `0.0.0.0` | Bind address |
| `GPS_TCP_MODE` | `auto` | `auto` \| `gt06` \| `json` |

`auto` detects GT06 binary (`0x78 0x78` header) vs JSON text.

### Link IMEI

Set **Device IMEI** on the vehicle in admin (e.g. `869343040629929` from `CXZT` status).

Server logs: `GT06 login IMEI=...` then location updates on live map.

---

## JSON protocol (dev)

Send **one JSON object per line**, terminated with `\n`:

```json
{"imei":"869343040629929","lat":23.8103,"lng":90.4125,"speed":25,"heading":180}
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

Default listen: **`0.0.0.0:5023`** (env: `GPS_TCP_PORT`, `GPS_TCP_ENABLED`, `GPS_TCP_BIND`, `GPS_TCP_MODE`).

## 1. Run API

```bash
cd api
pnpm start:dev
```

Log should show: `GPS TCP listening on 0.0.0.0:5023`

Apply migration if needed:

```bash
pnpm exec prisma migrate deploy
pnpm run db:seed   # DHK-1001 gets IMEI 869343040629929
```

## 2. Link IMEI to vehicle

Seed vehicle **DHK-1001** already has IMEI `869343040629929`.

In admin UI (**Vehicles → create/edit**), set **Device IMEI**, or PATCH `/api/vehicles/:id` with `{ "deviceImei": "..." }`.

## 3. Test locally

```bash
node scripts/send-gps-tcp.mjs \
  --host 127.0.0.1 --port 5023 \
  --imei 869343040629929 --lat 23.81 --lng 90.41
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
| `ERR invalid JSON` | One JSON object per line, ending with `\n` (JSON mode only) |
| GT06 no map update | IMEI linked to vehicle? VPS firewall open on TCP port? |

See also: [api/docs/API.md](../api/docs/API.md).
