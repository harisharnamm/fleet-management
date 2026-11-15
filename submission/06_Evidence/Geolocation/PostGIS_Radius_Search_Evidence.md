# Evidence: PostGIS Proximity Radius Search & Geocoding

## 1. PostGIS Proximity Radius Query Execution

**Endpoint:** `GET /api/maps/nearby`  
**Search Center:** San Francisco Civic Center (`37.7749`, `-122.4194`)  
**Search Radius:** 5,000 metres (5 km)

**Command:**
```bash
curl -s "http://localhost:4000/api/maps/nearby?lat=37.7749&lng=-122.4194&radius=5000" \
  -H "x-api-key: dev-secret-key-12345" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Real API Output Response:**
```json
{
  "success": true,
  "message": "Nearby vehicles retrieved",
  "data": {
    "center": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "radius_meters": 5000,
    "count": 2,
    "vehicles": [
      {
        "vehicle_id": "b0000000-0000-0000-0000-000000000001",
        "registration_number": "FLT-101-TX",
        "make": "Ford",
        "model": "F-150 Lightning",
        "status": "active",
        "type": "truck",
        "latitude": 37.7792,
        "longitude": -122.414,
        "speed": 65.5,
        "fuel_level": null,
        "battery_level": 82,
        "distance_meters": 1186.14,
        "recorded_at": "2026-11-15T15:20:00.000Z"
      },
      {
        "vehicle_id": "08629757-bc16-421e-b400-9db6e7bc4670",
        "registration_number": "FLT-002819-T",
        "make": "Tesla",
        "model": "Semi",
        "status": "active",
        "type": "truck",
        "latitude": 37.775,
        "longitude": -122.418,
        "speed": 40,
        "fuel_level": null,
        "battery_level": 10.5,
        "distance_meters": 123.46,
        "recorded_at": "2026-11-15T15:37:45.947Z"
      }
    ]
  }
}
```

### Verification Observations:
1. `FLT-002819-T` is closest to center (`123.46` metres away) and appears first.
2. `FLT-101-TX` is `1,186.14` metres away and appears second.
3. Distant vehicle `FLT-202-CA` (stationed in Oakland at `-122.2712, 37.8044`, ~13,000 metres away) is excluded from this 5,000m query.

---

## 2. Address Geocoding Execution

**Endpoint:** `GET /api/maps/geocode?address=San+Francisco+Fleet+Depot`

**Command:**
```bash
curl -s "http://localhost:4000/api/maps/geocode?address=San+Francisco+Fleet+Depot" \
  -H "x-api-key: dev-secret-key-12345" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Real API Output Response:**
```json
{
  "success": true,
  "message": "Address geocoded successfully",
  "data": {
    "address": "San Francisco Fleet Depot",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "display_name": "San Francisco Fleet Depot, CA, USA",
    "source": "known_fleet_depot"
  }
}
```

### Verification Observations:
The system accurately resolves the address/terminal name to GPS coordinates `(37.7749, -122.4194)`, which can be immediately used by the frontend map to re-center the PostGIS radius search.
