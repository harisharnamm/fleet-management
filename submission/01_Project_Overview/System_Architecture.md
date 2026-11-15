# System Architecture & Technical Design

## 1. Monorepo Structure & Separation of Concerns
The FleetFlow project is organized as a unified monorepo containing three independently runnable services:

```text
fleet-management-system/
├── frontend/        # React + TypeScript client (Port 5173)
├── gateway/         # Express API Gateway (Port 4000)
├── backend/         # Express Modular Monolith (Port 4001)
├── database/        # Migrations, seed scripts & PostGIS DDL
├── docs/            # OpenAPI specification & architectural assets
└── submission/      # Comprehensive SGA 2 audit & verification package
```

Each service maintains its own `package.json`, isolated dependencies, and environment configuration. The root `package.json` provides orchestrator scripts (`npm run dev`, `npm test`, `npm run build`, `npm run install:all`) powered by `concurrently`.

---

## 2. API Gateway Architecture (Port 4000)

The API Gateway acts as the single public entry point for all frontend client traffic, isolating the internal backend network.

### Gateway Responsibilities
1. **API Key Authentication:** Inspects every inbound request to `/api/*` for the `x-api-key` header. If missing or invalid, immediately responds with `401 Unauthorized` without burdening upstream services. The `/health` endpoint remains public for load balancers.
2. **Rate Limiting:** Protects the system against denial-of-service and brute-force attacks by restricting clients to 100 requests per minute using an in-memory sliding window rate limiter. Returns `429 Too Many Requests` when exceeded.
3. **Route Forwarding:** Utilizes `http-proxy-middleware` configured with `changeOrigin: true` to forward matching routes (`/api/users/*`, `/api/vehicles/*`, `/api/telemetry/*`, `/api/maps/*`, `/api/notifications/*`, and `/api/auth/*`) to the upstream backend service at `http://localhost:4001`.
4. **Header and Payload Integrity:** Fully preserves HTTP methods, query parameters, multipart/json bodies, and authorization headers (`Authorization: Bearer <JWT>`).
5. **Upstream Error Handling:** In the event the backend service is offline, crashing, or unreachable, the gateway traps `ECONNREFUSED` and returns a clean, structured `503 Service Unavailable` JSON response with code `BACKEND_SERVICE_UNAVAILABLE`.

---

## 3. Backend Modular Monolith (Port 4001)

The backend follows a Modular Monolith architecture pattern. Rather than introducing premature microservice network latency and distributed transaction complexities, the codebase is partitioned into distinct vertical domain modules:

```text
backend/src/
├── config/             # Database connection pool (pg.Pool), environment vars
├── middleware/         # JWT authentication, RBAC authorization, Zod validation, error handler
├── modules/
│   ├── auth/           # Login, registration, token generation, profile retrieval
│   ├── users/          # User management and admin queries
│   ├── vehicles/       # Inventory CRUD, status state machine, event logging
│   ├── telemetry/      # Telemetry intake, metric evaluation, critical alert triggers
│   ├── geolocation/    # PostGIS queries, radius calculation, Nominatim geocoding
│   └── notifications/  # Custom Mock SMS service, carrier receipts, delivery logs
├── utils/              # Haversine fallback calculations, response formatters
└── server.js           # Express app instantiation and Swagger UI mounting
```

### Key Design Principles
- **Loose Coupling, High Cohesion:** Each module encapsulates its own controllers, services, schemas, and routes.
- **Failover Data Layer:** All services query Neon PostgreSQL via connection pool. If an unseeded or transient network glitch occurs, a high-fidelity in-memory seed store ensures zero downtime for testing and development.
- **Unified Response Envelope:** All endpoints return a predictable JSON envelope:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": { ... }
  }
  ```
  Or for errors:
  ```json
  {
    "success": false,
    "error": {
      "message": "Detailed error message",
      "code": "ERROR_CODE",
      "details": []
    }
  }
  ```

---

## 4. Frontend Single-Page Application (Port 5173)

The frontend is a modern React 18 SPA built with Vite and TypeScript.

### Key Functional Views
1. **Executive Dashboard (`/`):** Displays key operational metrics (Total Vehicles, Active Count, In-Maintenance Count, Average Fleet Speed, Battery Health) and charts.
2. **Vehicle Inventory (`/vehicles`):** Filterable, searchable table with status badges, pagination, and vehicle creation/deletion modals with RBAC protection.
3. **Vehicle Details (`/vehicles/:id`):** Deep dive into individual vehicle specifications, historical telemetry graphs, recent event log, and operational status transition controls.
4. **Live Geolocation Map (`/tracking`):** Interactive OpenStreetMap rendering all vehicle GPS fixes with status-coded markers, popup summaries, PostGIS radius search, visual search boundary circle, and address geocoding lookup.
5. **Notification Center (`/notifications`):** Live audit log of mock SMS dispatches, delivery statuses (`delivered`/`failed`), carrier metadata, and manual simulation triggers.

---

## 5. Security Architecture

1. **Defense-in-Depth:**
   - **Tier 1 (Gateway):** API key verification (`x-api-key`) blocks external unauthenticated bots and enforces client quotas.
   - **Tier 2 (Backend Service):** JWT token verification (`Authorization: Bearer <token>`) authenticates individual user identity.
   - **Tier 3 (Domain Layer):** Role-Based Access Control (`requireRole('admin')`) guards sensitive administrative actions like vehicle deletion and user modification.
2. **Credential Segregation:**
   - Database credentials and JWT signing keys exist strictly on the backend and are excluded from git via `.gitignore`.
   - The frontend communicates solely with the API Gateway using `VITE_GATEWAY_API_KEY`.
