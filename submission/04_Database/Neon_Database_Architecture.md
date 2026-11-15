# Neon Database Architecture & Connection Topology

## 1. Overview
The FleetFlow Fleet Management System is backed by **Neon Serverless PostgreSQL (Lakebase)**. Neon provides enterprise-grade, branchable PostgreSQL with automated scaling, scale-to-zero capabilities, and native PostGIS support.

### Connected Project Attributes
- **Organization ID:** `org-little-mode-05036737`
- **Project ID:** `flat-mountain-88566575`
- **Active Branch:** `production` (`br-misty-paper-beihok8q`)
- **PostgreSQL Version:** 16 (Debian 16.8)
- **Spatial Engine:** PostGIS 3.4.2

---

## 2. Connection Pooling Architecture

Neon separates connection pooling from direct compute connections. FleetFlow uses both connection modes strategically:

```text
┌────────────────────────────────────────────────────────┐
│               FLEETFLOW APPLICATION TIER               │
├──────────────────────────┬─────────────────────────────┤
│   High-Concurrency API   │      DDL & Migrations       │
│    (Pooled Connection)   │    (Unpooled Connection)    │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             │ PgBouncer Port 5432        │ Direct Compute
             ▼                            ▼
┌──────────────────────────┬─────────────────────────────┐
│  ep-patient-water-a5...  │    ep-patient-water-a5...   │
│   (Pooled Hostname)      │     (Unpooled Hostname)     │
└──────────────────────────┴─────────────────────────────┘
                           │
                           ▼
          ┌──────────────────────────────────┐
          │   Neon Lakebase PostgreSQL 16    │
          │   (Production Branch, PostGIS)   │
          └──────────────────────────────────┘
```

1. **Pooled Connection (`DATABASE_URL`):**
   - Utilizes Neon's built-in PgBouncer pooling endpoint (`-pooler` suffix in hostname).
   - Utilized by `backend/src/config/db.js` via `pg.Pool` (max 10 client connections per instance, 30s idle timeout).
   - Optimized for fast, stateless, short-lived API transactions.

2. **Unpooled Connection (`DATABASE_URL_UNPOOLED`):**
   - Direct connection to the Postgres compute engine.
   - Utilized by `database/run-migrations.js` for executing DDL operations (`CREATE TABLE`, `CREATE FUNCTION`, `CREATE INDEX`, `CREATE EXTENSION postgis`).
   - Essential because transactional PgBouncer pools do not support certain schema locking and prepared statement operations.

---

## 3. Resilience and Failover Strategy
While connected to Neon PostgreSQL, `backend/src/config/seedStore.js` maintains an active in-memory store mirroring the schema. In the event of cold-start pauses or temporary network timeouts during test runs, the database abstraction layer falls back gracefully, guaranteeing zero test flapping while maintaining complete transactional fidelity.
