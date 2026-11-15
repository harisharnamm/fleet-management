# PostGIS Geolocation & Spatial Proximity Search

## 1. Spatial Coordinate Standard & Geometry vs. Geography

FleetFlow utilizes standard WGS 84 GPS coordinates (latitude, longitude) conforming to **EPSG:4326**.

In PostgreSQL PostGIS:
- `GEOGRAPHY(Point, 4326)` calculates great-circle distances directly on a spherical/ellipsoidal model of the Earth.
- Distance calculations are naturally computed in **metres**, eliminating the need for degree-to-distance Cartesian conversions or inaccurate flat-plane projections.

> [!IMPORTANT]
> **Coordinate Ordering:**  
> The OpenGIS and PostGIS standard dictates `ST_MakePoint(longitude, latitude)`, NOT `(latitude, longitude)`.  
> FleetFlow strictly adheres to this ordering:
> ```sql
> ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography
> ```

---

## 2. Stored Procedure: `find_vehicles_within_radius`

To satisfy SGA 2 requirements for retrieving vehicles within a specified radius while always using the latest telemetry record per vehicle, FleetFlow executes the optimized PostgreSQL function `find_vehicles_within_radius`:

```sql
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
    latitude NUMERIC,
    longitude NUMERIC,
    speed NUMERIC,
    fuel_level NUMERIC,
    battery_level NUMERIC,
    distance_meters DOUBLE PRECISION,
    recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    center_point GEOGRAPHY;
BEGIN
    center_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography;

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
        ROUND(ST_Distance(lt.location, center_point)::numeric, 2)::double precision AS distance_meters,
        lt.recorded_at
    FROM vehicles v
    JOIN latest_telemetry lt ON v.id = lt.vehicle_id
    WHERE ST_DWithin(lt.location, center_point, radius_meters)
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
```

### Why this is optimal:
1. **`DISTINCT ON (t.vehicle_id)`:** Guarantees that only the most recent GPS fix for each vehicle is evaluated, preventing old history records from polluting the search.
2. **`ST_DWithin`:** Leverages the GiST spatial index on `telemetry(location)` for sub-millisecond bounding-box filtering before computing precise distances.
3. **`ST_Distance`:** Calculates the exact great-circle distance in metres between the vehicle and search center.
4. **`ORDER BY distance_meters ASC`:** Directly outputs results sorted from nearest to furthest.
