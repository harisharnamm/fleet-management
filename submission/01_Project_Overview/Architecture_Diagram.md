# Architecture Diagrams & Data Flows

## 1. System Topology Overview

```mermaid
flowchart TD
    Client["React Frontend SPA<br>(Port 5173 - Vite / TS)"]
    Gateway["API Gateway<br>(Port 4000 - Express)"]
    Backend["Backend Modular Monolith<br>(Port 4001 - Express ESM)"]
    DB[("Neon Lakebase PostgreSQL<br>(PostGIS Enabled)")]
    MockSMS["Custom Mock SMS Engine<br>(Carrier Simulator)"]
    Nominatim["OpenStreetMap Nominatim<br>(Geocoding API)"]

    Client -->|"HTTP /api/* + x-api-key"| Gateway
    Gateway -->|"Reverse Proxy + Header Forwarding"| Backend
    Backend -->|"SQL Queries + Spatial Indexing"| DB
    Backend -->|"Trigger Critical Event Alerts"| MockSMS
    Backend -->|"Address to Lat/Lng Resolution"| Nominatim
```

---

## 2. Inbound Request & Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Fleet Administrator
    participant UI as React Frontend
    participant GW as API Gateway (Port 4000)
    participant BE as Backend Service (Port 4001)
    participant DB as Neon PostgreSQL

    Note over User,DB: Phase 1: Authentication & Token Issuance
    User->>UI: Submit credentials (admin@fleetms.com)
    UI->>GW: POST /api/auth/login [x-api-key: dev-secret-key-12345]
    GW->>GW: Verify x-api-key & rate limit
    GW->>BE: Forward POST /api/auth/login
    BE->>DB: Query user by email & verify bcrypt hash
    DB-->>BE: User record (role: 'admin')
    BE-->>GW: Signed JWT Token + User profile
    GW-->>UI: 200 OK (JWT stored in localStorage)

    Note over User,DB: Phase 2: Protected Resource Access
    User->>UI: Request Nearby Vehicle Radius Search
    UI->>GW: GET /api/maps/nearby?lat=37.77&lng=-122.41&radius=5000<br>[x-api-key + Bearer JWT]
    GW->>GW: Verify x-api-key & check rate limit window
    GW->>BE: Forward GET /api/maps/nearby
    BE->>BE: Verify JWT signature & extract user claims
    BE->>DB: Execute find_vehicles_within_radius(lat, lng, radius)
    DB-->>BE: PostGIS results with distance in metres
    BE-->>GW: JSON response { count: 2, vehicles: [...] }
    GW-->>UI: Forward response to client
    UI->>User: Render vehicles & radius circle on OpenStreetMap
```

---

## 3. Telemetry Ingestion & Critical Event Notification Flow

```mermaid
sequenceDiagram
    autonumber
    participant Vehicle as IoT Vehicle Beacon
    participant GW as API Gateway (Port 4000)
    participant BE as Backend Service (Port 4001)
    participant DB as Neon PostgreSQL
    participant SMS as Mock SMS Carrier Engine

    Vehicle->>GW: POST /api/telemetry [x-api-key, Bearer Token]<br>{ vehicle_id, speed: 45, battery_level: 11.5, lat, lng }
    GW->>BE: Proxies payload upstream
    BE->>BE: Validate Zod schema
    BE->>DB: Insert telemetry record with PostGIS POINT(lng lat)
    
    Note over BE,SMS: Critical Threshold Detected (battery_level < 15%)
    BE->>DB: Insert vehicle_events (type: 'LOW_BATTERY', severity: 'critical')
    BE->>SMS: Dispatch simulated SMS alert to fleet administrator
    SMS->>SMS: Generate Carrier Receipt (Verizon/AT&T, status: 'DELIVRD')
    SMS->>DB: Persist notification record (status: 'delivered')
    BE-->>GW: 201 Created { record, critical_alert: true, notification: {...} }
    GW-->>Vehicle: Return ingestion confirmation
```

---

## 4. Role-Based Access Control (RBAC) Enforcement Flow

```mermaid
flowchart TD
    Req["Inbound Request to /api/vehicles/:id (DELETE)"] --> GWAuth{"Gateway Check:<br>Valid x-api-key?"}
    GWAuth -- No --> Err401["401 Unauthorized<br>(Invalid or missing API key)"]
    GWAuth -- Yes --> RateCheck{"Within Rate Limit?<br>(< 100 req/min)"}
    RateCheck -- No --> Err429["429 Too Many Requests"]
    RateCheck -- Yes --> Forward["Forward to Backend Port 4001"]

    Forward --> JWTCheck{"Backend Check:<br>Valid Bearer JWT?"}
    JWTCheck -- No --> Err401JWT["401 Unauthorized<br>(Token missing or invalid)"]
    JWTCheck -- Yes --> RBACCheck{"Backend RBAC:<br>Role == 'admin'?"}
    RBACCheck -- No (viewer/manager) --> Err403["403 Forbidden<br>(Insufficient permissions)"]
    RBACCheck -- Yes (admin) --> DBDelete[("Execute DELETE on Neon PostgreSQL")]
    DBDelete --> Success200["200 OK<br>Vehicle Deleted Successfully"]
```
