# Test Coverage Matrix — SGA 2 Requirements Mapping

This matrix maps each requirement specified in Staff Graded Assignment 2 directly to the corresponding automated test file, test description, and verified assertion.

| Requirement Area | Assignment Specification | Implementing Test File | Specific Test Assertion | Status |
|---|---|---|---|:---:|
| **Authentication** | Login and JWT token issuance | `backend/tests/01_auth.test.js` | `should authenticate valid user and return a signed JWT token` | ✅ Verified |
| **Authentication** | Protected endpoint validation with Bearer token | `backend/tests/01_auth.test.js` | `should allow accessing protected /api/auth/me with valid Bearer token` | ✅ Verified |
| **Authentication** | Reject unauthorized requests with 401 | `backend/tests/01_auth.test.js` | `should reject login with missing or invalid credentials (401)` | ✅ Verified |
| **Vehicle Mgmt** | Vehicle registration and UUID generation | `backend/tests/02_vehicles.test.js` | `should register a new vehicle and retrieve it by ID` | ✅ Verified |
| **Vehicle Mgmt** | Duplicate VIN / Registration rejection | `backend/tests/02_vehicles.test.js` | `should reject duplicate vehicle registration numbers with 409 Conflict` | ✅ Verified |
| **Vehicle Mgmt** | Status filtering and inventory query | `backend/tests/02_vehicles.test.js` | `should list all vehicles and support filtering by status` | ✅ Verified |
| **Telemetry & GPS** | Telemetry ingestion and PostGIS point persistence | `backend/tests/03_telemetry.test.js` | `should accept telemetry data and correctly persist PostGIS POINT(lng lat)` | ✅ Verified |
| **Telemetry & GPS** | Coordinate order validation: POINT(lng lat) | `backend/tests/03_telemetry.test.js` | `expect(location).to.equal('POINT(-122.4167 37.7833)')` | ✅ Verified |
| **Telemetry & GPS** | Telemetry rejection for non-existent vehicle | `backend/tests/03_telemetry.test.js` | `should reject telemetry for non-existent vehicle with 404` | ✅ Verified |
| **Notifications** | Critical event detection (low battery, emergency stop) | `backend/tests/03_telemetry.test.js` | `should detect critical events and trigger mock SMS` | ✅ Verified |
| **Notifications** | Status change trigger (`active` -> `maintenance`) | `backend/tests/04_notifications.test.js` | `should automatically trigger and persist a Mock SMS notification` | ✅ Verified |
| **Notifications** | Mock SMS carrier receipt and delivery persistence | `backend/tests/04_notifications.test.js` | `should allow manually triggering a simulated SMS alert` | ✅ Verified |
| **RBAC** | Viewer blocked from deleting vehicle (403) | `backend/tests/05_rbac.test.js` | `should reject vehicle deletion by viewer with 403 Forbidden` | ✅ Verified |
| **RBAC** | Fleet Manager blocked from deleting vehicle (403) | `backend/tests/05_rbac.test.js` | `should reject vehicle deletion by fleet_manager with 403 Forbidden` | ✅ Verified |
| **RBAC** | Admin permitted to delete vehicle (200) | `backend/tests/05_rbac.test.js` | `should allow vehicle deletion by admin (200)` | ✅ Verified |
| **Geolocation** | PostGIS radius search (ST_DWithin, distance in metres) | `backend/tests/06_geolocation.test.js` | `should find vehicles within a 3,000 metre radius and calculate distance` | ✅ Verified |
| **Geolocation** | Radius expansion verification (25 km vs 3 km) | `backend/tests/06_geolocation.test.js` | `should include more distant vehicles when radius is expanded to 25,000 metres` | ✅ Verified |
| **Geolocation** | Coordinate and radius validation error (400) | `backend/tests/06_geolocation.test.js` | `should reject invalid coordinates or radius with 400 Validation Error` | ✅ Verified |
| **Geolocation** | Address-to-coordinate geocoding | `backend/tests/06_geolocation.test.js` | `should geocode address to valid GPS coordinates (lat, lng)` | ✅ Verified |
| **API Gateway** | Public `/health` route access | `backend/tests/07_gateway.test.js` | `should allow /health on Gateway without an API key` | ✅ Verified |
| **API Gateway** | Missing `x-api-key` header rejection (401) | `backend/tests/07_gateway.test.js` | `should reject requests to /api/* when x-api-key header is missing with 401` | ✅ Verified |
| **API Gateway** | Invalid `x-api-key` header rejection (401) | `backend/tests/07_gateway.test.js` | `should reject requests with an invalid x-api-key with 401` | ✅ Verified |
| **API Gateway** | Valid API key proxy acceptance | `backend/tests/07_gateway.test.js` | `should accept requests when valid x-api-key is supplied` | ✅ Verified |
| **API Gateway** | Rate limiting enforcement (429) | `backend/tests/07_gateway.test.js` | `should enforce rate limiting and return 429 when threshold is exceeded` | ✅ Verified |
