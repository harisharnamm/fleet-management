# FleetFlow — Fleet Management System (SGA 2 Submission)

**Course:** Staff Graded Assignment 2 (SGA 2)  
**Project:** FleetFlow Enterprise Fleet Management System  
**Database:** Neon Serverless PostgreSQL (`production` branch, PostGIS enabled)  
**GitHub Repository:** [https://github.com/harisharnamm/fleet-management.git](https://github.com/harisharnamm/fleet-management.git)

---

## 1. Submission Package Overview

This submission package contains all deliverables, documentation, test evidence, and clean source code for Staff Graded Assignment 2:

```text
submission/
├── FleetFlow_SGA2_Report.pdf     # Complete project report with architecture, test tables & screenshots
├── README.md                     # This evaluator quick-start guide
│
├── screenshots/                  # High-resolution screenshots of the working system
│   ├── 01_geolocation_and_nearby_search.png      # Vehicle geolocation & PostGIS radius search (ST_DWithin)
│   ├── 02_sms_notification_status_change.png     # Mock SMS generation on status change & critical alerts
│   ├── 03_api_gateway_routing_and_auth.png       # Gateway routing, API key check (401) & rate limiting (429)
│   ├── 04_swagger_ui_documentation.png           # Interactive Swagger UI (OpenAPI 3.0) at port 4001
│   └── 05_fleet_dashboard_overview.png           # Executive fleet telemetry dashboard & analytics
│
├── codebase/                     # Clean, runnable application codebase
│   ├── backend/                  # Node.js ESM Express modular monolith with PostGIS
│   ├── frontend/                 # React 18 + Vite + TypeScript + Tailwind + shadcn/ui
│   ├── gateway/                  # Express API Gateway with rate limiting & API key auth
│   ├── database/                 # PostgreSQL migrations (PostGIS extensions, tables, triggers)
│   ├── package.json              # Monorepo root orchestrator script
│   └── package-lock.json
│
└── docs/                         # Technical documentation & reference material
    ├── Architecture_Diagram.md   # Mermaid system topology, auth & event flows
    ├── Architecture_Overview.md  # Detailed technical design & service breakdown
    ├── API_Reference.md          # Complete REST endpoint reference with sample payloads
    ├── Test_Results.md           # Mocha/Chai/Supertest execution report (25/25 passing)
    ├── Compliance_Matrix.md      # SGA 2 requirement-by-requirement audit matrix
    └── OpenAPI_Specification.yaml # OpenAPI 3.0 specification
```

---

## 2. Quick Start Guide for Evaluators

### Step 1: Install Dependencies
From the repository root or `codebase/`:
```bash
npm run install:all
```

### Step 2: Run Automated Tests
Execute the Mocha/Chai test suite directly against live Neon PostgreSQL:
```bash
npm test
```
*Expected output:* `25 passing (27s)` covering all 7 required SGA 2 test flows.

### Step 3: Start the Applications
Launch the API Gateway, Backend, and Frontend concurrently:
```bash
npm run dev
```

Service endpoints:
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **API Gateway:** `http://localhost:4000`
- **Backend API:** `http://localhost:4001`
- **Swagger Documentation:** [http://localhost:4001/api-docs](http://localhost:4001/api-docs)

---

## 3. Demo Login Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@fleetms.com` | `Password123!` | Full access, vehicle deletion, user management |
| **Fleet Manager** | `manager@fleetms.com` | `Password123!` | Vehicle registration, telemetry submission, status updates |
| **Viewer** | `viewer@fleetms.com` | `Password123!` | Read-only access to map, inventory, notifications |

**Gateway API Key:** `dev-secret-key-12345` (sent via `x-api-key` header)
