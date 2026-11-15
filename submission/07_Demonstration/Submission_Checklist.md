# Submission Checklist & Self-Assessment

Evaluated against the official requirements of Staff Graded Assignment 2 (SGA 2).

---

## 1. Third-Party API Integrations

- [x] **OpenStreetMap Integration:** Integrated via React Leaflet with dynamic status pins and info popups.
- [x] **Address-to-Coordinate Geocoding:** Implemented via `/api/maps/geocode` with Nominatim API and local depot resolver.
- [x] **GPS Coordinate Storage:** Telemetry endpoint stores coordinates in WGS 84 format.
- [x] **PostGIS Point Storage:** Uses `GEOGRAPHY(Point, 4326)` populated via database triggers with `(longitude, latitude)` ordering.
- [x] **Radius Proximity Search:** Implemented using `ST_DWithin` and `ST_Distance` in stored procedure `find_vehicles_within_radius`.
- [x] **Distance in Metres:** Calculations return distance in metres rounded to 2 decimal places.
- [x] **Latest Telemetry Selection:** Query uses `DISTINCT ON (vehicle_id)` ordered by `recorded_at DESC`.
- [x] **Mock SMS Notification Service:** Simulated carrier engine generating message IDs, carrier names, and latency.
- [x] **Critical Event Alerts:** Automatically triggers on Engine Fault (`ENGINE_FAULT`, `engine_temp > 105`), Low Battery (`battery_level < 15`), Emergency Stop (`EMERGENCY_STOP`), and Overspeed.
- [x] **Status-Change Notifications:** Automatically dispatches SMS alerts when vehicle operational status changes.
- [x] **Notification Persistence in Database:** Notification records, statuses (`delivered`/`failed`), and provider receipts persisted in Neon PostgreSQL.

---

## 2. API Gateway Simulation

- [x] **Isolated Express Application:** Running on dedicated port 4000.
- [x] **Required Routes Proxied:**
  - [x] `/api/users/*`
  - [x] `/api/vehicles/*`
  - [x] `/api/telemetry/*`
  - [x] `/api/maps/*`
  - [x] `/api/notifications/*`
  - [x] `/api/auth/*`
- [x] **API Key Verification:** Middleware inspects `x-api-key` header and rejects invalid/missing keys with `401 Unauthorized`.
- [x] **Rate Limiting:** Sliding-window rate limiter enforcing quotas and returning `429 Too Many Requests`.
- [x] **Request / Response Integrity:** HTTP methods, bodies, query parameters, and headers preserved upstream.
- [x] **Structured 503 Handling:** Returns clean JSON error when backend service is unavailable.

---

## 3. API Documentation & OpenAPI Specification

- [x] **OpenAPI 3.0 Specification:** Comprehensive YAML document covering all endpoints, parameters, schemas, and error states.
- [x] **Interactive Swagger UI:** Accessible at `http://localhost:4001/api-docs`.
- [x] **Security Schemes:** Configured with `ApiKeyAuth` (`x-api-key`) and `BearerAuth` (`JWT`).

---

## 4. Frontend Application

- [x] **Tech Stack Compliance:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- [x] **Real Backend Data:** No hardcoded data; all screens wire directly to API Gateway endpoints.
- [x] **State Handling:** Loading skeletons, empty states, and error alerts implemented.
- [x] **Map Interface:** OpenStreetMap with vehicle pins, popup summaries, and radius search circle.

---

## 5. Security & Authentication

- [x] **JWT Authentication:** Cryptographically signed tokens with 24-hour expiration.
- [x] **Password Hashing:** Passwords hashed with bcrypt (10 rounds).
- [x] **Role-Based Access Control:** Strict RBAC enforced at service layer across Admin, Fleet Manager, and Viewer.
- [x] **Zero Secret Exposure:** Credentials and JWT secrets excluded from client code and git history.

---

## 6. Automated Testing

- [x] **Test Framework:** Mocha, Chai, Supertest.
- [x] **All 7 Required Flows Implemented:**
  - [x] Flow 1: Login and JWT authentication
  - [x] Flow 2: Vehicle registration and retrieval
  - [x] Flow 3: Telemetry submission and PostGIS persistence
  - [x] Flow 4: Vehicle status update triggering notification
  - [x] Flow 5: RBAC rejection of unauthorized deletion
  - [x] Flow 6: Nearby vehicle search with mocked geolocation
  - [x] Flow 7: Gateway API key verification and rate limiting
- [x] **100% Pass Rate:** 25 out of 25 tests passing against live Neon PostgreSQL.
