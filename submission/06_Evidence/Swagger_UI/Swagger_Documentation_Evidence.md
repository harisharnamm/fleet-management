# Evidence: OpenAPI 3.0 & Swagger UI Documentation

## 1. Swagger UI Accessibility

The Swagger UI interactive documentation is served directly by the backend at:
`http://localhost:4001/api-docs`

**HTTP Probe Command:**
```bash
curl -s -I http://localhost:4001/api-docs/
```

**Response Header Verification:**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 1045
Date: Sun, 15 Nov 2026 15:37:47 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

---

## 2. Documented OpenAPI 3.0 Endpoints List

The OpenAPI schema defines 14 distinct operations across 6 tags:

```text
Authentication:
  POST /api/auth/login           - User login and JWT token issuance
  POST /api/auth/register        - New user account registration
  GET  /api/auth/me              - Profile of authenticated user

Users:
  GET  /api/users                - List registered users (Admin only)

Vehicles:
  GET    /api/vehicles           - List fleet inventory with status/type filter
  POST   /api/vehicles           - Register a new fleet vehicle
  GET    /api/vehicles/{id}      - Retrieve detailed vehicle record with events
  PATCH  /api/vehicles/{id}      - Update vehicle metadata / trigger status alert
  DELETE /api/vehicles/{id}      - Delete vehicle record (Admin only)

Telemetry:
  POST /api/telemetry            - Ingest GPS fixes, battery, speed & evaluate alerts
  GET  /api/telemetry/vehicle/{id} - Retrieve historical vehicle telemetry

Geolocation:
  GET /api/maps/nearby           - PostGIS radius search (ST_DWithin in metres)
  GET /api/maps/positions        - Real-time GPS fixes for fleet markers
  GET /api/maps/geocode          - Address to lat/lng geocoding resolution

Notifications:
  GET  /api/notifications        - Retrieve mock SMS dispatch logs
  POST /api/notifications/simulate - Manually trigger simulated SMS delivery
```

---

## 3. Security Schemes Configured in Swagger
1. `ApiKeyAuth`: HTTP Header `x-api-key`
2. `BearerAuth`: HTTP Header `Authorization: Bearer <JWT>`
