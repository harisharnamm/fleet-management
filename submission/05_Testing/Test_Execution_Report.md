# Test Execution Report — Automated Test Suite Results

**Test Suite:** Mocha v10.8.2 / Chai v5.2.0 / Supertest v7.0.0  
**Target Environment:** Live Neon Serverless PostgreSQL (`production` branch)  
**Execution Timestamp:** 2026-11-15T21:07:04+05:30  
**Overall Status:** **PASSED (100% Success)**

---

## 1. Executive Summary

| Total Test Cases | Passing | Failing | Pending / Skipped | Total Execution Time |
|:---:|:---:|:---:|:---:|:---:|
| **25** | **25** | **0** | **0** | **27.4 seconds** |

---

## 2. Test Suite Breakdown by SGA 2 Flow

| Flow ID | Flow Description | Test Cases | Result | Duration |
|:---:|---|:---:|:---:|:---:|
| **Flow 1** | Login and JWT Authentication | 5 | ✅ 5 Passing | 5.0s |
| **Flow 2** | Vehicle Registration and Retrieval | 3 | ✅ 3 Passing | 3.0s |
| **Flow 3** | Telemetry Submission and Persistence | 3 | ✅ 3 Passing | 4.0s |
| **Flow 4** | Vehicle Status Update & Notification | 2 | ✅ 2 Passing | 1.9s |
| **Flow 5** | RBAC Rejection of Unauthorized Deletion | 3 | ✅ 3 Passing | 1.8s |
| **Flow 6** | Nearby Vehicle Search with Geolocation | 4 | ✅ 4 Passing | 1.0s |
| **Flow 7** | Gateway API Key & Rate Limiting | 5 | ✅ 5 Passing | 0.1s |
| **Total** | **All 7 Required SGA 2 Flows** | **25** | **✅ 25 Passing** | **27.4s** |

---

## 3. Detailed Results by Assertion

```text
  Flow 1: Login and JWT Authentication
✓ Connected to Neon PostgreSQL (Branch: production)
    ✔ should reject login with missing or invalid credentials (401) (3728ms)
    ✔ should reject login when payload fails validation (400)
    ✔ should authenticate valid user and return a signed JWT token (427ms)
    ✔ should allow accessing protected /api/auth/me with valid Bearer token (846ms)
    ✔ should reject protected route when Authorization token is missing or malformed

  Flow 2: Vehicle Registration and Retrieval
    ✔ should register a new vehicle and retrieve it by ID (2314ms)
    ✔ should reject duplicate vehicle registration numbers with 409 Conflict (321ms)
    ✔ should list all vehicles and support filtering by status (328ms)

  Flow 3: Telemetry Submission and Persistence
    ✔ should accept telemetry data and correctly persist PostGIS POINT(lng lat) (1042ms)
    ✔ should reject telemetry for non-existent vehicle with 404 (348ms)
    ✔ should detect critical events (low battery, emergency stop, engine overheat) and trigger mock SMS (2581ms)

  Flow 4: Vehicle Status Update Triggering a Notification
    ✔ should automatically trigger and persist a Mock SMS notification when vehicle status changes to maintenance (1633ms)
    ✔ should allow manually triggering a simulated SMS alert with delivery status tracking (298ms)

  Flow 5: RBAC Rejection of Unauthorized Vehicle Deletion
    ✔ should reject vehicle deletion by viewer with 403 Forbidden
    ✔ should reject vehicle deletion by fleet_manager with 403 Forbidden
    ✔ should allow vehicle deletion by admin (200) (1709ms)

  Flow 6: Nearby Vehicle Search with Mocked Geolocation
    ✔ should find vehicles within a 3,000 metre radius and calculate distance in metres (307ms)
    ✔ should include more distant vehicles when radius is expanded to 25,000 metres (296ms)
    ✔ should reject invalid coordinates or radius with 400 Validation Error
    ✔ should geocode address to valid GPS coordinates (lat, lng)

  Flow 7: Gateway API Key Verification and Rate Limiting
    ✔ should allow /health on Gateway without an API key
    ✔ should reject requests to /api/* when x-api-key header is missing with 401
    ✔ should reject requests with an invalid x-api-key with 401
    ✔ should accept requests when valid x-api-key is supplied
    ✔ should enforce rate limiting and return 429 when threshold is exceeded (54ms)

  25 passing (27s)
```
