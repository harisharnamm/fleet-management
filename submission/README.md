# FleetFlow — Fleet Management System (SGA 2 Submission Package)

**Course:** Staff Graded Assignment 2 (SGA 2)  
**Project Name:** FleetFlow Enterprise Fleet Management System  
**Author:** Senior Full-Stack Software Engineer & Technical Architect  
**Evaluation Target:** Full SGA 2 Production Compliance  
**Repository:** [https://github.com/harisharnamm/fleet-management.git](https://github.com/harisharnamm/fleet-management.git)

---

## 1. Executive Summary

FleetFlow is a production-grade, enterprise-ready Fleet Management System designed and implemented to satisfy all requirements of Staff Graded Assignment 2. The system allows fleet administrators and dispatchers to register vehicles, monitor live GPS coordinates with OpenStreetMap, perform PostGIS-backed proximity radius queries, automatically trigger mock SMS notifications on critical vehicle events, enforce role-based access control (RBAC), and access all backend microservices through an Express API Gateway equipped with API key authentication and rate limiting.

### Core Architectural Pillars
- **Database:** Serverless Neon Lakebase PostgreSQL (`production` branch) with PostGIS geography extensions and spatial GiST indexing.
- **Backend:** Modular Monolith Express application (Node.js ESM) featuring JWT authentication, RBAC middleware, Zod schema validation, PostGIS query routines, and OpenAPI 3.0 documentation with Swagger UI.
- **API Gateway:** Dedicated Express gateway running on port 4000 featuring `http-proxy-middleware`, client API key validation, rate limiting (100 req/min), upstream error isolation (503 handling), and route proxying.
- **Frontend:** Single Page Application built with React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui components, OpenStreetMap (React Leaflet), Recharts, and Axios.
- **Testing:** Automated test suite with 25 comprehensive test cases using Mocha, Chai, and Supertest, executing all 7 required SGA 2 test flows directly against live Neon PostgreSQL.

---

## 2. Directory Structure of the Submission Package

```text
submission/
├── README.md                          # This document — evaluation guide & overview
├── SGA2_Final_Compliance_Matrix.md    # Authoritative requirement-by-requirement audit
├── 01_Project_Overview/
│   ├── Project_Summary.md             # Goals, architecture overview, tech stack
│   ├── System_Architecture.md         # Detailed modular design & tier separation
│   └── Architecture_Diagram.md        # Mermaid diagrams of system topology & data flows
├── 02_API_Documentation/
│   ├── OpenAPI_Specification.yaml     # Production OpenAPI 3.0 specification
│   ├── API_Endpoint_Reference.md      # Detailed markdown endpoint reference
│   └── Authentication_and_RBAC.md     # Auth lifecycle, JWT flow, roles & permissions
├── 03_API_Gateway/
│   ├── Gateway_Architecture.md        # Gateway topology, reverse proxying & resilience
│   ├── Routing_Reference.md           # Route proxying mapping table & header forwarding
│   └── Security_and_Rate_Limiting.md  # API key auth, window limits & error handling
├── 04_Database/
│   ├── Neon_Database_Architecture.md  # Serverless Neon setup, pooling & connection topology
│   ├── Database_Schema.md             # Complete DDL tables, constraints, foreign keys & triggers
│   └── PostGIS_Geolocation.md         # Spatial queries, ST_DWithin, GiST index & calculations
├── 05_Testing/
│   ├── Test_Plan.md                   # Test methodology, isolation & coverage objectives
│   ├── Test_Execution_Report.md       # Full execution report of all 25 passing test cases
│   └── Test_Coverage_Matrix.md        # Matrix mapping assignment requirements to tests
├── 06_Evidence/
│   ├── Dashboard/                     # Dashboard telemetry, KPIs & stats proofs
│   ├── Geolocation/                   # PostGIS spatial radius queries & distance calculations
│   ├── SMS_Notifications/             # Mock SMS receipts, critical alert logs & payloads
│   ├── API_Gateway/                   # Gateway authentication, rate-limiting & proxying proofs
│   ├── Swagger_UI/                    # Swagger UI accessibility & OpenAPI documentation
│   └── Test_Results/                  # Raw mocha console execution output
└── 07_Demonstration/
    ├── Demo_Script.md                 # Step-by-step evaluator testing guide
    └── Submission_Checklist.md        # Self-assessment against official evaluation rubric
```

---

## 3. Quick Start & Execution Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Active Internet connection (for live Neon PostgreSQL connectivity)

### Step 1: Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(Installs dependencies across root, gateway, backend, and frontend)*

### Step 2: Configure Environment Files
Pre-configured template files are available in each service directory:
- `backend/.env` (configured with live Neon PostgreSQL credentials and JWT secret)
- `gateway/.env` (configured with `BACKEND_URL=http://localhost:4001` and `API_KEY=dev-secret-key-12345`)
- `frontend/.env` (configured with `VITE_API_URL=http://localhost:4000/api` and `VITE_GATEWAY_API_KEY=dev-secret-key-12345`)

### Step 3: Run Automated Test Suite
Execute the automated test suite directly against Neon PostgreSQL:
```bash
npm test
```
**Expected Result:** `25 passing (27s)` covering all 7 SGA 2 test flows.

### Step 4: Start the Full Stack Concurrently
Start Gateway, Backend, and Frontend in a single command:
```bash
npm run dev
```

The system will start on the following ports:
- **API Gateway:** `http://localhost:4000`
- **Backend Service:** `http://localhost:4001`
- **Interactive Swagger UI:** `http://localhost:4001/api-docs`
- **Frontend Dashboard:** `http://localhost:5173`

---

## 4. Evaluator Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@fleetms.com` | `Password123!` | Full system access, vehicle deletion, user management |
| **Fleet Manager** | `manager@fleetms.com` | `Password123!` | Vehicle registration, telemetry submission, status updates |
| **Viewer** | `viewer@fleetms.com` | `Password123!` | Read-only access to inventory, live map, and notifications |

**Gateway API Key:** `dev-secret-key-12345` (supplied via header `x-api-key`)
