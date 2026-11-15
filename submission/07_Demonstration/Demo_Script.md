# Evaluator Demonstration Script — FleetFlow Fleet Management System

This script guides the academic evaluator through a structured, step-by-step demonstration verifying all aspects of Staff Graded Assignment 2.

---

## Part 1: Automated Test Verification (Mocha / Chai / Supertest)

1. Open your terminal at the project root:
   ```bash
   cd "Fleet Management Project SGA"
   ```
2. Run the automated test suite:
   ```bash
   npm test
   ```
3. **What to Observe:**
   - 25 automated tests pass cleanly across 7 distinct test flows.
   - Live Neon PostgreSQL connection established (`✓ Connected to Neon PostgreSQL (Branch: production)`).
   - PostGIS spatial assertions pass, distance calculations verify in metres, and gateway rate limiting triggers 429.

---

## Part 2: Starting the Full Stack Services

1. Launch Gateway, Backend, and Frontend concurrently:
   ```bash
   npm run dev
   ```
2. Confirm the services report ready:
   - Gateway listening on `http://localhost:4000`
   - Backend listening on `http://localhost:4001`
   - Frontend Vite dev server running on `http://localhost:5173`

---

## Part 3: Interactive Swagger UI Verification

1. In your browser, navigate to:
   [http://localhost:4001/api-docs](http://localhost:4001/api-docs)
2. **What to Observe:**
   - Interactive Swagger UI documentation with all 14 endpoints.
   - Click the green **Authorize** button:
     - Enter API Key `dev-secret-key-12345` for `ApiKeyAuth`.
     - Enter Bearer token after logging in for `BearerAuth`.
   - Test `GET /api/maps/nearby`:
     - Pass `lat: 37.7749`, `lng: -122.4194`, `radius: 5000`.
     - Click **Execute** and review the returned PostGIS distances.

---

## Part 4: API Gateway Security & Rate Limiting Verification

1. Open a new terminal tab.
2. Test Gateway Health:
   ```bash
   curl -i http://localhost:4000/health
   ```
   *Expected:* `200 OK` with JSON status.
3. Test Gateway API Key Enforcement:
   ```bash
   curl -i http://localhost:4000/api/vehicles
   ```
   *Expected:* `401 Unauthorized` (`GATEWAY_UNAUTHORIZED`).
4. Test Gateway Authorized Forwarding:
   ```bash
   curl -i -H "x-api-key: dev-secret-key-12345" http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@fleetms.com","password":"Password123!"}'
   ```
   *Expected:* `200 OK` with signed JWT token.

---

## Part 5: Web UI Walk-Through

1. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)
2. Log in using the administrator credentials:
   - **Email:** `admin@fleetms.com`
   - **Password:** `Password123!`
3. **Dashboard:**
   - Inspect the Fleet Overview KPI cards (Total Fleet, Active, Maintenance, Average Speed).
   - Review the speed distribution and battery health charts.
4. **Vehicles Inventory:**
   - Click **Vehicles** in the sidebar.
   - Filter by status (`active`, `maintenance`).
   - Click on any vehicle to view its Telemetry Details and recent event log.
5. **Live Tracking & OpenStreetMap:**
   - Click **Live Map** in the sidebar.
   - Observe OpenStreetMap tiles loading with color-coded vehicle markers (green = active, yellow = maintenance).
   - Enter an address in the geocoding search bar (e.g., `San Francisco Fleet Depot`) and click **Geocode & Center**.
   - Adjust the search radius slider/input (e.g. 5,000 metres) and click **Scan Radius**.
   - Notice the blue circular radius boundary rendered on the map and the filtered list of vehicles sorted by proximity.
6. **Notifications Center:**
   - Click **Notifications** in the sidebar.
   - Review persisted simulated SMS records with carrier names (`Verizon`, `AT&T`, `T-Mobile`), simulated latency, and delivery statuses.
   - Click **Send Test SMS** to dispatch a simulated carrier delivery.
