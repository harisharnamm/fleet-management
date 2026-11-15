-- ============================================================================
-- 01_init_extensions.sql
-- Fleet Management System — SGA 2
-- Enables required PostgreSQL extensions: UUID generator and PostGIS
-- ============================================================================

-- Enable UUID extension for generating v4 UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS extension for geospatial types and queries
CREATE EXTENSION IF NOT EXISTS "postgis";
