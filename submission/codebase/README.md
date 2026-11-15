# FleetFlow — Fleet Management System
**Staff Graded Assignment 2 (SGA 2)**

- **Name:** Harisharnam
- **Roll No:** 2023EBCS406
- **Live Deployed URL:** [https://fleet-management-jade-psi.vercel.app/login](https://fleet-management-jade-psi.vercel.app/login)
- **Database:** Neon Serverless PostgreSQL (`production` branch, PostGIS enabled)
- **GitHub Repository:** [https://github.com/harisharnamm/fleet-management.git](https://github.com/harisharnamm/fleet-management.git)

A production-minded, modular web application enabling fleet administrators to register vehicles, monitor real-time GPS telemetry, execute PostGIS radius searches, receive simulated SMS incident alerts, and manage operational lifecycles through an Express API Gateway.

---

## 1. System Architecture

The project follows a modular monorepo structure with three independently runnable services:

```
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│      Port 5173 | Vite + Tailwind + shadcn + Leaflet    │
└───────────────────────────┬────────────────────────────┘
                            │ x-api-key + Bearer JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│                   API Gateway                          │
│     Port 4000 | Rate Limiting + Key Auth + Proxy       │
└───────────────────────────┬────────────────────────────┘
                            │ Reverse Proxy (http-proxy-middleware)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend Monolith                     │
│    Port 4001 | Express + JWT/RBAC + Zod + Modules     │
│   ┌──────────┬──────────┬──────────┬────────────────┐  │
│   │   Auth   │  Users   │ Vehicles │   Telemetry    │  │
│   ├──────────┴──────────┼──────────┴────────────────┤  │
│   │    Geolocation      │       Notifications       │  │
│   └─────────────────────┴───────────────────────────┘  │
└───────────────┬────────────────────────┬───────────────┘
                │ PostGIS SQL            │ Simulated Carrier
                ▼                        ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│  Supabase PostgreSQL / PostGIS│ │   Mock SMS Service   │
│ ST_MakePoint(lng, lat)        │ │ Delivery receipts &  │
│ ST_DWithin radius search      │ │ status persistence   │
└───────────────────────────────┘ └──────────────────────┘
```

- **Frontend (`http://localhost:5173`)**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Recharts, React Leaflet (OpenStreetMap). Communicates exclusively through the API Gateway.
- **API Gateway (`http://localhost:4000`)**: Express reverse proxy using `http-proxy-middleware`, enforcing `x-api-key` validation and rate limiting (100 req/min) before forwarding to backend service routes.
- **Backend (`http://localhost:4001`)**: Modular Express monolith (ES modules) with JWT & RBAC authorization (`admin`, `fleet_manager`, `viewer`), Zod schema validation, PostGIS spatial radius queries, Mock SMS notification engine, and Swagger UI at `/api-docs`.

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui tokens, Lucide icons, Recharts, React Leaflet, OpenStreetMap, Axios.
- **Backend**: Node.js (v20+), Express.js (ES Modules), Neon PostgreSQL (`pg` connection pool with SSL), PostGIS, JWT (`jsonwebtoken`), `bcryptjs`, `zod`, `helmet`, `cors`, `swagger-ui-express`, `yamljs`.
- **API Gateway**: Express.js, `http-proxy-middleware`, `express-rate-limit`, `helmet`, `cors`.
- **Notifications**: Custom event-driven `MockSmsService` with delivery status persistence and carrier receipts.
- **Documentation**: OpenAPI 3.0 specification (`docs/openapi.yaml`), Swagger UI (`http://localhost:4001/api-docs`).
- **Testing**: Mocha, Chai, Supertest (7 automated end-to-end test flows).

---

## 3. Project Directory Structure

```
fleet-management-system/
│
├── frontend/                     # React 18 / Vite / TypeScript client (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Button, Card, Badge, Input, Select, Skeleton, Alert
│   │   │   └── layout/           # Sidebar, Header, DashboardLayout
│   │   ├── pages/                # Login, Dashboard, Vehicles, Details, Tracking, Notifications, Docs
│   │   ├── services/             # Axios client, fleetService
│   │   ├── contexts/             # AuthContext (JWT session management)
│   │   ├── types/                # TypeScript interfaces (Vehicle, Telemetry, Notification)
│   │   ├── lib/                  # Utility helpers (cn, formatDateTime)
│   │   ├── App.tsx               # Client routes & protected routes
│   │   └── main.tsx              # DOM entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                      # Modular Monolith Express API (Port 4001)
│   ├── src/
│   │   ├── config/               # env.js, db.js (Neon pool) & seedStore.js
│   │   ├── middleware/           # auth.js (JWT), rbac.js, validator.js, errorHandler.js
│   │   ├── modules/
│   │   │   ├── auth/             # Login, register, me (JWT)
│   │   │   ├── users/            # User administration (Admin role)
│   │   │   ├── vehicles/         # Vehicle inventory & status transitions
│   │   │   ├── telemetry/        # GPS & telemetry intake, PostGIS coordinates
│   │   │   ├── geolocation/      # Proximity radius search (ST_DWithin)
│   │   │   └── notifications/    # Mock SMS engine & status persistence
│   │   ├── utils/                # response.js, geo.js (Haversine formula)
│   │   ├── app.js                # Express app setup & Swagger mount
│   │   └── server.js             # Server bootstrap (Port 4001)
│   ├── tests/                    # 7 automated test flows (Mocha/Chai/Supertest)
│   ├── package.json
│   └── .env.example
│
├── gateway/                      # API Gateway (Port 4000)
│   ├── src/
│   │   ├── middleware/           # apiKey.js, rateLimiter.js, errorHandler.js
│   │   ├── routes/               # proxy.js (http-proxy-middleware)
│   │   ├── app.js                # Gateway Express setup
│   │   └── server.js             # Gateway bootstrap (Port 4000)
│   ├── package.json
│   └── .env.example
│
├── database/                     # SQL Migrations & Schema
│   ├── migrations/
│   │   ├── 01_init_extensions.sql
│   │   ├── 02_create_tables.sql
│   │   ├── 03_create_functions_and_indexes.sql
│   │   └── 04_seed_data.sql
│   └── README.md
│
├── docs/                         # Documentation
│   ├── openapi.yaml              # OpenAPI 3.0 specification
│   ├── architecture.md           # Network, PostGIS, and security architecture
│   └── screenshots/              # UI verification screenshots
│
├── scripts/
│   └── check-status.js           # Multi-service ping & status check
├── package.json                  # Root monorepo orchestrator (concurrently)
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

- **Node.js**: v20.x or higher (verified on Node v24.x).
- **npm**: v10.x or higher.
- *(Optional for cloud DB)*: Active [Supabase](https://supabase.com) PostgreSQL account with PostGIS extension.

---

## 5. Installation & Setup

### Step 1: Install Dependencies
Run from the root repository directory:
```bash
# Install root orchestrator dependencies
npm install

# Install dependencies for all three services
npm run install:all
```

Or install individually:
```bash
cd gateway && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env` in each service directory (already configured with local development defaults):

**Backend (`backend/.env`)**:
```env
PORT=4001
NODE_ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=super-secret-jwt-key-for-fleet-management-2026
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
GATEWAY_URL=http://localhost:4000
SMS_PROVIDER=mock
```

**Gateway (`gateway/.env`)**:
```env
PORT=4000
NODE_ENV=development
BACKEND_URL=http://localhost:4001
API_KEY=dev-secret-key-12345
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_URL=http://localhost:4000/api
VITE_GATEWAY_API_KEY=dev-secret-key-12345
```

> [!WARNING]
> **Credential Security**:
> All `VITE_*` environment variables are bundled into client-side JavaScript and are publicly readable in the browser. Never put database service-role keys or JWT signing secrets into `frontend/.env`.

---

## 6. Neon PostgreSQL & PostGIS Database Setup

The project is connected to **Neon PostgreSQL** on the `production` branch (`flat-mountain-88566575`).

### Database Migrations
To run or re-apply migrations against Neon:
```bash
node database/run-migrations.js
```
This executes:
1. `01_init_extensions.sql` (Enables `uuid-ossp` and `postgis`)
2. `02_create_tables.sql` (Creates `users`, `vehicles`, `telemetry`, `vehicle_events`, `notifications`, `api_keys`)
3. `03_create_functions_and_indexes.sql` (Creates GiST index and `find_vehicles_within_radius` function)
4. `04_seed_data.sql` (Inserts initial seed accounts, vehicles, and Bay Area telemetry points)

---

## 7. Running the Applications

### Run All Three Services Concurrently
From the root directory, run:
```bash
npm run dev
```
This starts:
- **API Gateway** on `http://localhost:4000`
- **Backend Monolith** on `http://localhost:4001`
- **React Frontend** on `http://localhost:5173`

### Run Services Individually
```bash
npm run dev:gateway    # Starts Gateway on Port 4000
npm run dev:backend    # Starts Backend on Port 4001
npm run dev:frontend   # Starts React Frontend on Port 5173
```

---

## 8. Application URLs & Default Credentials

| Service | URL | Notes |
|---|---|---|
| **Web Dashboard** | `http://localhost:5173` | React single-page app |
| **API Gateway** | `http://localhost:4000` | Health check: `http://localhost:4000/health` |
| **Backend API** | `http://localhost:4001` | Health check: `http://localhost:4001/health` |
| **Swagger UI** | `http://localhost:4001/api-docs` | Interactive OpenAPI documentation |

### Seed User Accounts
All seed accounts use the default password: **`Password123!`**

| Email | Role | Permissions |
|---|---|---|
| `admin@fleetms.com` | `admin` | Full CRUD, user role management, vehicle deletion |
| `manager@fleetms.com` | `fleet_manager` | Vehicle registration, status updates, telemetry intake, simulated SMS |
| `viewer@fleetms.com` | `viewer` | Read-only access to vehicles, telemetry, maps, notifications |

---

## 9. Automated Testing (SGA 2 Required Test Flows)

The test suite uses **Mocha**, **Chai**, and **Supertest** to verify all seven required test flows:

```bash
npm test
# or inside backend directory:
npm --prefix backend test
```

### Verified Test Flows:
1. **Flow 1 (`01_auth.test.js`)**: Login, invalid credential rejection (401), JWT signing, Bearer token authorization, expired token handling.
2. **Flow 2 (`02_vehicles.test.js`)**: Vehicle registration, duplicate registration validation (409), vehicle list filtering by status, vehicle lookup by ID.
3. **Flow 3 (`03_telemetry.test.js`)**: Telemetry submission, PostGIS `POINT(longitude latitude)` coordinate persistence, and vehicle telemetry history retrieval.
4. **Flow 4 (`04_notifications.test.js`)**: Vehicle status update automatically triggering a `vehicle_events` incident and a `MockSmsService` delivery receipt (`status: delivered`, carrier latency).
5. **Flow 5 (`05_rbac.test.js`)**: RBAC verification — unauthorized vehicle deletion rejected with 403 Forbidden for `viewer` and `fleet_manager`, permitted for `admin`.
6. **Flow 6 (`06_geolocation.test.js`)**: Proximity radius search with coordinates, computing distance in metres, returning ascending nearest vehicles, and excluding out-of-range vehicles.
7. **Flow 7 (`07_gateway.test.js`)**: Gateway API key verification (401 without key, 200 with key), rate limiting enforcement (429 on rapid burst), and reverse proxying to backend.

---

## 10. Troubleshooting

- **Gateway returns 401 Unauthorized**:
  Ensure the request includes the `x-api-key: dev-secret-key-12345` header.
- **Gateway returns 503 Backend Unavailable**:
  Ensure the backend server is running on port 4001 (`npm run dev:backend`).
- **PostGIS coordinates inverted**:
  PostGIS `ST_MakePoint` expects `(longitude, latitude)`. Latitude is Y (-90 to +90), Longitude is X (-180 to +180).
- **Port already in use**:
  Ensure ports 4000, 4001, and 5173 are free:
  ```bash
  lsof -ti :4000,4001,5173 | xargs kill -9
  ```
