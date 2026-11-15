# Database Schema & DDL Reference

The database schema is defined across four sequential migration scripts located in `database/migrations/`.

---

## 1. Extension Initialization (`01_init_extensions.sql`)
Enables cryptographic UUID generation and spatial queries:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

---

## 2. Table Definitions (`02_create_tables.sql`)

### A. Users Table (`users`)
Stores administrative and operational user credentials with role definitions.
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'fleet_manager', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### B. Vehicles Table (`vehicles`)
Stores fleet asset registry and current operational state.
```sql
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1990 AND year <= 2030),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    type VARCHAR(20) NOT NULL DEFAULT 'truck' CHECK (type IN ('truck', 'van', 'car')),
    assigned_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### C. Telemetry Table (`telemetry`)
Stores high-frequency sensor readings and PostGIS geography points.
```sql
CREATE TABLE IF NOT EXISTS telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    speed NUMERIC(5,2) NOT NULL CHECK (speed >= 0),
    fuel_level NUMERIC(5,2) CHECK (fuel_level >= 0 AND fuel_level <= 100),
    battery_level NUMERIC(5,2) CHECK (battery_level >= 0 AND battery_level <= 100),
    engine_temp NUMERIC(5,2) DEFAULT 90.0,
    latitude NUMERIC(10,7) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude NUMERIC(10,7) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    location GEOGRAPHY(Point, 4326),
    odometer NUMERIC(10,2) NOT NULL CHECK (odometer >= 0),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### D. Vehicle Events Table (`vehicle_events`)
Maintains an immutable audit log of operational and critical incidents.
```sql
CREATE TABLE IF NOT EXISTS vehicle_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### E. Notifications Table (`notifications`)
Stores simulated Mock SMS carrier delivery logs and status records.
```sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'sms',
    status VARCHAR(20) NOT NULL DEFAULT 'delivered' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
    event_id UUID REFERENCES vehicle_events(id) ON DELETE SET NULL,
    provider_response JSONB,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. PostGIS Functions & Triggers (`03_create_functions_and_indexes.sql`)

### Automatic Spatial Point Synchronization
Ensures that any insertion or update to `latitude` and `longitude` automatically populates the PostGIS `location` column in the correct `(longitude, latitude)` order:
```sql
CREATE OR REPLACE FUNCTION set_telemetry_geography()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_telemetry_geography
BEFORE INSERT OR UPDATE ON telemetry
FOR EACH ROW
EXECUTE FUNCTION set_telemetry_geography();
```

### Spatial and Relational Indexes
```sql
-- PostGIS GiST index for fast spatial radius queries
CREATE INDEX IF NOT EXISTS idx_telemetry_location ON telemetry USING GIST (location);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_time ON telemetry (vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_events_vehicle_id ON vehicle_events (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status);
```
