# Authentication and Role-Based Access Control (RBAC)

## 1. Authentication Flow
FleetFlow employs a stateless JSON Web Token (JWT) authentication strategy combined with bcrypt password hashing (10 salt rounds).

### Token Issuance Lifecycle
1. The client submits `email` and `password` to `POST /api/auth/login`.
2. The `AuthService` queries Neon PostgreSQL for a matching user record.
3. Password verification is performed using `bcrypt.compare()`.
4. If valid, a signed JWT is issued with:
   - `sub`: User UUID
   - `email`: User email address
   - `role`: Assigned role (`admin`, `fleet_manager`, `viewer`)
   - `exp`: 24 hours expiry
   - `iss`: `fleet-management-backend`
5. The client stores the JWT securely in browser memory / localStorage and includes it in the `Authorization: Bearer <TOKEN>` header for subsequent requests.

---

## 2. Role-Based Access Control (RBAC) Matrix

The system enforces three distinct user roles with hierarchical and specific operational privileges:

| Operation / Endpoint | Admin | Fleet Manager | Viewer | Required RBAC Middleware |
|---|:---:|:---:|:---:|---|
| **View Fleet Inventory (`GET /api/vehicles`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | `authenticateJWT` |
| **View Vehicle Details (`GET /api/vehicles/:id`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | `authenticateJWT` |
| **View Live Map & Nearby (`GET /api/maps/*`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | `authenticateJWT` |
| **Geocode Address (`GET /api/maps/geocode`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | `authenticateJWT` |
| **View Notifications (`GET /api/notifications`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | `authenticateJWT` |
| **Submit Telemetry (`POST /api/telemetry`)** | ✅ Allowed | ✅ Allowed | ❌ Forbidden (403) | `requireRole('admin', 'fleet_manager')` |
| **Register Vehicle (`POST /api/vehicles`)** | ✅ Allowed | ✅ Allowed | ❌ Forbidden (403) | `requireRole('admin', 'fleet_manager')` |
| **Update Vehicle Status (`PATCH /api/vehicles/:id`)** | ✅ Allowed | ✅ Allowed | ❌ Forbidden (403) | `requireRole('admin', 'fleet_manager')` |
| **Trigger Mock SMS (`POST /api/notifications/simulate`)** | ✅ Allowed | ✅ Allowed | ❌ Forbidden (403) | `requireRole('admin', 'fleet_manager')` |
| **Delete Vehicle (`DELETE /api/vehicles/:id`)** | ✅ Allowed | ❌ Forbidden (403) | ❌ Forbidden (403) | `requireRole('admin')` |
| **Manage Users (`GET /api/users`)** | ✅ Allowed | ❌ Forbidden (403) | ❌ Forbidden (403) | `requireRole('admin')` |

---

## 3. Pre-Seeded Evaluation Accounts

The database migrations automatically seed the following accounts for immediate evaluation:

| Email | Password | Role | Usage |
|---|---|---|---|
| `admin@fleetms.com` | `Password123!` | `admin` | Full administrator privileges (vehicle deletion, user view) |
| `manager@fleetms.com` | `Password123!` | `fleet_manager` | Operational dispatcher (vehicle updates, telemetry) |
| `viewer@fleetms.com` | `Password123!` | `viewer` | Read-only observer (testing 403 authorization blocks) |

---

## 4. Middleware Implementation Details

### `authenticateJWT` Middleware
Located in `backend/src/middleware/auth.js`:
- Extracts the token from `req.headers.authorization`.
- Validates the token against `JWT_SECRET`.
- Attaches the decoded payload to `req.user`.
- Rejects missing or malformed tokens with `401 Unauthorized` (`AUTH_NO_TOKEN` or `AUTH_INVALID_TOKEN`).

### `requireRole(...allowedRoles)` Middleware
Located in `backend/src/middleware/rbac.js`:
- Inspects `req.user.role`.
- Verifies membership in `allowedRoles`.
- Rejects unauthorized users with `403 Forbidden` (`FORBIDDEN_INSUFFICIENT_PERMISSIONS`) without executing the downstream controller.
