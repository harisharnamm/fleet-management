-- ============================================================================
-- 03_create_functions_and_indexes.sql
-- Fleet Management System — SGA 2
-- PostGIS Spatial Indexing and Geolocation Radius Search Functions
-- ============================================================================

-- Spatial index on geography column using GiST
CREATE INDEX IF NOT EXISTS idx_telemetry_location ON telemetry USING GIST (location);

-- Function to automatically set GEOGRAPHY point on telemetry row insert or update
-- PostGIS ST_MakePoint takes (longitude, latitude)
CREATE OR REPLACE FUNCTION set_telemetry_geography()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_telemetry_geography ON telemetry;
CREATE TRIGGER trigger_set_telemetry_geography
BEFORE INSERT OR UPDATE ON telemetry
FOR EACH ROW
EXECUTE FUNCTION set_telemetry_geography();

-- Function: find_vehicles_within_radius
-- Finds vehicles within specified radius (in metres) based on their latest known telemetry point
-- ST_MakePoint argument order: (center_lng, center_lat)
CREATE OR REPLACE FUNCTION find_vehicles_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
    vehicle_id UUID,
    registration_number VARCHAR,
    make VARCHAR,
    model VARCHAR,
    status VARCHAR,
    type VARCHAR,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    speed NUMERIC,
    fuel_level NUMERIC,
    battery_level NUMERIC,
    distance_meters DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_telemetry AS (
        SELECT DISTINCT ON (t.vehicle_id)
            t.vehicle_id,
            t.latitude,
            t.longitude,
            t.location,
            t.speed,
            t.fuel_level,
            t.battery_level,
            t.recorded_at
        FROM telemetry t
        ORDER BY t.vehicle_id, t.recorded_at DESC
    )
    SELECT
        v.id AS vehicle_id,
        v.registration_number,
        v.make,
        v.model,
        v.status,
        v.type,
        lt.latitude,
        lt.longitude,
        lt.speed,
        lt.fuel_level,
        lt.battery_level,
        ROUND(ST_Distance(
            lt.location,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        )::numeric, 2)::DOUBLE PRECISION AS distance_meters,
        lt.recorded_at
    FROM latest_telemetry lt
    JOIN vehicles v ON v.id = lt.vehicle_id
    WHERE ST_DWithin(
        lt.location,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
