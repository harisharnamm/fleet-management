# Fleet Management System — Neon PostgreSQL Database Setup & Migrations
**Staff Graded Assignment 2 (SGA 2)**

This database foundation is built for **Neon Lakebase PostgreSQL** with PostGIS on branch `production` (`flat-mountain-88566575`).

---

## 1. Migration Execution Order

Execute the SQL scripts in `database/migrations/` in sequential order:

1. **`01_init_extensions.sql`**
   - Enables `uuid-ossp` and `postgis`.
2. **`02_create_tables.sql`**
   - Creates the 6 core tables: `users`, `vehicles`, `telemetry`, `vehicle_events`, `notifications`, `api_keys`.
   - Creates relational foreign keys, constraints, and performance indexes.
3. **`03_create_functions_and_indexes.sql`**
   - Creates GiST spatial index on `telemetry(location)`.
   - Attaches `set_telemetry_geography()` trigger for automatic geography POINT sync.
   - Defines `find_vehicles_within_radius(...)` utilizing `ST_DWithin` and `ST_Distance`.
4. **`04_seed_data.sql`**
   - Seeds 3 users (`admin@fleetms.com`, `manager@fleetms.com`, `viewer@fleetms.com`).
   - Seeds 5 realistic fleet vehicles.
   - Seeds telemetry with PostGIS points in the San Francisco Bay Area.
   - Seeds vehicle events and mock SMS delivery logs.

---

## 2. Automated Neon Migration Execution

All migrations can be run automatically against your Neon database branch using:

```bash
node database/run-migrations.js
```

This runner uses `DATABASE_URL_UNPOOLED` directly from `.env.local` or `.env`, connecting directly to Neon's primary compute endpoint for safe DDL execution.

---

## 3. PostGIS Coordinate System Notes

> [!IMPORTANT]
> PostGIS coordinates require **(Longitude, Latitude)** order for `ST_MakePoint`:
> `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography`
>
> Longitude corresponds to the X axis (-180 to +180), and Latitude corresponds to the Y axis (-90 to +90).
> The `find_vehicles_within_radius` function expects `(center_lat, center_lng, radius_meters)` and internally converts it into `ST_MakePoint(center_lng, center_lat)`.

---

## 4. Default Seed User Credentials

All seed accounts use the default password: **`Password123!`**

| Email | Role | Permissions |
|---|---|---|
| `admin@fleetms.com` | `admin` | Full CRUD across all endpoints, user management, vehicle deletion |
| `manager@fleetms.com` | `fleet_manager` | Vehicle creation, updates, telemetry intake, notifications |
| `viewer@fleetms.com` | `viewer` | Read-only access to vehicles, telemetry, maps, notifications |

---

## 5. Connection Pooling Architecture

- **Pooled Endpoint (`DATABASE_URL`, port 5432 / pooler host)**: Used by `pg.Pool` in `backend/src/config/db.js` for web application query traffic.
- **Direct Endpoint (`DATABASE_URL_UNPOOLED`)**: Used by `database/run-migrations.js` for non-pooled schema migrations and DDL execution.
