# Automated Test Plan — FleetFlow Fleet Management System

## 1. Testing Philosophy & Objectives
The automated testing suite for FleetFlow is built with **Mocha**, **Chai**, and **Supertest** to validate end-to-end correctness, security boundaries, spatial algorithms, and resilience without reliance on mocked database stubs. Tests execute directly against a live Neon Lakebase PostgreSQL instance.

### Primary Testing Goals
1. **Flow Independence & Idempotency:** Each test scenario generates unique dynamic identifiers (e.g. registration numbers, VINs) so the suite can be re-run continuously without database constraint collisions (`409 Conflict`).
2. **Deterministic Data Cleanliness:** Read and query operations use existing seed benchmarks, while write tests clean up or maintain unique entities.
3. **Comprehensive Coverage:** Validate positive paths, negative edge cases, validation rejections (Zod 400), authentication failures (401), authorization boundaries (403), and rate limit enforcement (429).

---

## 2. Test Suites (The 7 Required SGA 2 Flows)

### Flow 1: Login and JWT Authentication (`tests/01_auth.test.js`)
- Rejection of missing/invalid credentials (401).
- Validation failure handling for malformed email/passwords (400).
- Successful authentication of valid credentials and verification of signed JWT payload structure.
- Verification of protected route access (`/api/auth/me`) using Bearer tokens.
- Rejection of requests with missing, expired, or malformed tokens.

### Flow 2: Vehicle Registration and Retrieval (`tests/02_vehicles.test.js`)
- Registration of a new vehicle with VIN, registration number, make, model, year.
- Immediate retrieval of the created vehicle by its UUID.
- Conflict rejection (409) when attempting to register duplicate registration numbers.
- Listing of fleet vehicles with status filtering (`?status=active`).

### Flow 3: Telemetry Submission and Persistence (`tests/03_telemetry.test.js`)
- Ingestion of telemetry payloads with GPS coordinates, speed, battery level, fuel level, and odometer.
- Verification that PostGIS `location` is correctly stored as `POINT(lng lat)`.
- Rejection of telemetry for non-existent vehicle UUIDs (404).
- Detection of critical events (low battery < 15%, emergency stop, engine overheat) and automatic dispatch of Mock SMS notifications.

### Flow 4: Vehicle Status Update Triggering a Notification (`tests/04_notifications.test.js`)
- Status update transition (`active` -> `maintenance`) triggering an automated Mock SMS alert.
- Verification of persisted notification record in Neon PostgreSQL with carrier response.
- Manual simulation endpoint test (`POST /api/notifications/simulate`) verifying delivered and failed delivery states.

### Flow 5: RBAC Rejection of Unauthorized Vehicle Deletion (`tests/05_rbac.test.js`)
- Attempted vehicle deletion by a `viewer` user resulting in `403 Forbidden`.
- Attempted vehicle deletion by a `fleet_manager` user resulting in `403 Forbidden`.
- Successful vehicle deletion by an `admin` user (200 OK) and verification of cascading record removal.

### Flow 6: Nearby Vehicle Search with Mocked Geolocation (`tests/06_geolocation.test.js`)
- Execution of PostGIS proximity search (`GET /api/maps/nearby`) with radius = 3,000 metres.
- Verification that all returned vehicles are within 3,000 metres and sorted in ascending order of `distance_meters`.
- Verification that distant vehicles (e.g. in Oakland, ~13 km away) are excluded from the 3,000m search but included when the radius is expanded to 25,000 metres.
- Validation error handling for out-of-range coordinates.
- Verification of address-to-coordinate geocoding (`GET /api/maps/geocode`).

### Flow 7: Gateway API Key Verification and Rate Limiting (`tests/07_gateway.test.js`)
- Direct invocation of the Gateway Express application.
- Public `/health` endpoint accessible without an API key.
- Rejection of `/api/*` routes with 401 when `x-api-key` is missing or invalid.
- Acceptance of requests when a valid `x-api-key` is supplied.
- Enforcement of sliding-window rate limiting returning `429 Too Many Requests`.
