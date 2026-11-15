# Project Summary — FleetFlow Fleet Management System

## 1. Project Background & Objective
FleetFlow is an enterprise web-based Fleet Management System built for **Staff Graded Assignment 2 (SGA 2)**. The primary objective is to deliver a robust, modular, and resilient full-stack application that enables fleet operators and administrators to:

1. **Register and manage vehicle inventory** throughout their operational lifecycle (active, maintenance, retired).
2. **Ingest high-frequency GPS telemetry** (speed, coordinates, battery level, fuel level, engine temperature, odometer).
3. **Execute spatial proximity searches** using PostGIS geospatial functions (`ST_DWithin` and `ST_Distance`) with radius defined in metres.
4. **Geocode addresses and depot terminals** to latitude/longitude coordinates via OpenStreetMap integration.
5. **Automatically dispatch simulated SMS notifications** upon critical vehicle events (engine faults, low battery, emergency stops, overspeed) and operational status changes.
6. **Secure external access via an Express API Gateway** enforcing API key verification, request rate limiting, and reverse proxying.
7. **Expose standardized OpenAPI 3.0 documentation** via an interactive Swagger UI.
8. **Enforce strict Role-Based Access Control (RBAC)** across Admin, Fleet Manager, and Viewer tiers.
9. **Validate all backend business logic** with an automated Mocha, Chai, and Supertest suite executing 7 required integration flows.

---

## 2. Technology Stack Breakdown

### Frontend Layer
- **Core Framework:** React 18 with TypeScript and Vite 5.
- **Styling & UI Kit:** Tailwind CSS with shadcn/ui component library, Lucide React icons.
- **Mapping & Geolocation:** React Leaflet with OpenStreetMap tiles and custom SVG vehicle status markers.
- **Data Visualization:** Recharts for vehicle telemetry and speed/battery distribution metrics.
- **Client Networking:** Axios client configured with automatic gateway API key headers and JWT Bearer token interception.
- **Routing:** React Router v6 with authenticated route guards and role-based views.

### Backend Application Layer
- **Runtime & Architecture:** Node.js (v18+) with Express.js using native ECMAScript Modules (ESM) organized into a Modular Monolith.
- **Modules:**
  - `auth`: User authentication, bcryptjs password hashing, JWT token issuance and profile retrieval.
  - `users`: User administration and RBAC management.
  - `vehicles`: Vehicle CRUD, status transitions, and lifecycle event logging.
  - `telemetry`: GPS coordinates ingestion, metric validation, and PostGIS geography point conversion.
  - `geolocation`: Spatial queries, radius search (`find_vehicles_within_radius`), and depot geocoding.
  - `notifications`: Custom Mock SMS dispatch, carrier receipt simulation, and persistent notification log.
- **Data Validation:** Zod schemas applied as Express middleware.
- **Security:** Helmet HTTP headers, CORS whitelisting, and constant-time API key comparisons.
- **API Documentation:** OpenAPI 3.0 specification served via `swagger-ui-express`.

### Database & Spatial Infrastructure
- **Provider:** Neon Lakebase Serverless PostgreSQL (`production` branch).
- **Driver:** Native `pg` Pool driver for pooled transactions and high-throughput API operations; unpooled direct connections for DDL migrations.
- **Spatial Engine:** PostGIS extension (`CREATE EXTENSION IF NOT EXISTS postgis`).
- **Spatial Indexing:** GiST index on `telemetry USING gist(location)`.
- **Coordinate Standard:** WGS 84 (SRID 4326), stored as `geography(Point, 4326)` using `ST_MakePoint(longitude, latitude)`.

### API Gateway Layer
- **Framework:** Express.js running on isolated port 4000.
- **Proxy Middleware:** `http-proxy-middleware` v3 preserving path, headers, query strings, and payload bodies.
- **Rate Limiting:** `express-rate-limit` configured to 100 requests per 1-minute window per IP.
- **Authentication:** Header-based API key validation (`x-api-key`).
- **Fault Tolerance:** Upstream health inspection and structured JSON 503 error handling when the backend is unavailable.

### Testing Layer
- **Frameworks:** Mocha test runner, Chai assertion library, and Supertest HTTP client.
- **Execution Mode:** Direct end-to-end integration testing against live Neon PostgreSQL database.
- **Test Flows:** 7 complete required flows covering 25 distinct test assertions.
