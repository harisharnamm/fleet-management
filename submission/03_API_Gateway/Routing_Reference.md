# Gateway Routing Reference

## 1. Route Mapping Table

The API Gateway routes inbound traffic based on URL patterns to the corresponding backend modular monolith services:

| Inbound Gateway Route | HTTP Methods | Target Backend Route | Target Module | Authentication Required |
|---|---|---|---|:---:|
| `/health` | `GET` | *(Handled Locally by Gateway)* | Gateway Health | None |
| `/api/auth/login` | `POST` | `http://localhost:4001/api/auth/login` | Auth Module | API Key only |
| `/api/auth/register` | `POST` | `http://localhost:4001/api/auth/register` | Auth Module | API Key only |
| `/api/auth/me` | `GET` | `http://localhost:4001/api/auth/me` | Auth Module | API Key + JWT |
| `/api/users/*` | `GET` | `http://localhost:4001/api/users/*` | User Module | API Key + JWT (Admin) |
| `/api/vehicles` | `GET`, `POST` | `http://localhost:4001/api/vehicles` | Vehicle Module | API Key + JWT |
| `/api/vehicles/:id` | `GET`, `PATCH`, `DELETE` | `http://localhost:4001/api/vehicles/:id` | Vehicle Module | API Key + JWT |
| `/api/telemetry` | `POST` | `http://localhost:4001/api/telemetry` | Telemetry Module | API Key + JWT |
| `/api/telemetry/vehicle/:id` | `GET` | `http://localhost:4001/api/telemetry/vehicle/:id` | Telemetry Module | API Key + JWT |
| `/api/maps/nearby` | `GET` | `http://localhost:4001/api/maps/nearby` | Geolocation Module | API Key + JWT |
| `/api/maps/positions` | `GET` | `http://localhost:4001/api/maps/positions` | Geolocation Module | API Key + JWT |
| `/api/maps/geocode` | `GET` | `http://localhost:4001/api/maps/geocode` | Geolocation Module | API Key + JWT |
| `/api/notifications` | `GET` | `http://localhost:4001/api/notifications` | Notification Module | API Key + JWT |
| `/api/notifications/simulate` | `POST` | `http://localhost:4001/api/notifications/simulate` | Notification Module | API Key + JWT |

---

## 2. Header and Body Preservation
The reverse proxy maintains full protocol fidelity:
- **HTTP Methods:** All methods (`GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`) are forwarded without alteration.
- **Query Strings:** Complex query parameters (`lat=37.77&lng=-122.41&radius=5000&status=active`) are encoded and passed upstream verbatim.
- **Request Bodies:** JSON payloads parsed by Express body parser are re-serialized and piped to upstream sockets with accurate `Content-Length` headers.
- **Authorization Headers:** Inbound `Authorization: Bearer <JWT>` headers are forwarded directly to the backend for cryptographic signature verification.
