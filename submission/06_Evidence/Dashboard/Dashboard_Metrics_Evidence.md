# Evidence: Dashboard Metrics & Fleet Statistics

## 1. Overview
The FleetFlow dashboard compiles live aggregated fleet metrics from Neon PostgreSQL, including total fleet size, operational status counts, average speed, and battery health.

## 2. Real Fleet Statistics Payload (via Gateway Port 4000)

**Command:**
```bash
curl -s http://localhost:4000/api/vehicles \
  -H "x-api-key: dev-secret-key-12345" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

**Real API Output Sample:**
```json
{
  "success": true,
  "message": "Vehicles retrieved",
  "data": [
    {
      "id": "b0000000-0000-0000-0000-000000000001",
      "vin": "1FTFW1E84MKD12345",
      "registration_number": "FLT-101-TX",
      "make": "Ford",
      "model": "F-150 Lightning",
      "year": 2023,
      "status": "active",
      "type": "truck",
      "assigned_driver_id": "a0000000-0000-0000-0000-000000000002",
      "created_at": "2026-11-15T15:20:00.000Z",
      "updated_at": "2026-11-15T15:20:00.000Z",
      "latest_telemetry": {
        "id": "c0000000-0000-0000-0000-000000000001",
        "vehicle_id": "b0000000-0000-0000-0000-000000000001",
        "speed": 65.5,
        "fuel_level": null,
        "battery_level": 82,
        "engine_temp": 88.5,
        "latitude": 37.7792,
        "longitude": -122.414,
        "odometer": 14250.2,
        "recorded_at": "2026-11-15T15:20:00.000Z"
      }
    },
    {
      "id": "b0000000-0000-0000-0000-000000000002",
      "vin": "1C4PJLCB8KD123456",
      "registration_number": "FLT-202-CA",
      "make": "Freightliner",
      "model": "eCascadia",
      "year": 2022,
      "status": "active",
      "type": "truck",
      "assigned_driver_id": null,
      "created_at": "2026-11-15T15:20:00.000Z",
      "updated_at": "2026-11-15T15:20:00.000Z",
      "latest_telemetry": {
        "id": "c0000000-0000-0000-0000-000000000002",
        "vehicle_id": "b0000000-0000-0000-0000-000000000002",
        "speed": 72,
        "fuel_level": null,
        "battery_level": 64.5,
        "engine_temp": 92.1,
        "latitude": 37.8044,
        "longitude": -122.2712,
        "odometer": 28400.8,
        "recorded_at": "2026-11-15T15:20:00.000Z"
      }
    }
  ]
}
```

## 3. Frontend Dashboard State Verification
- **Total Fleet Size:** Dynamically computed from database vehicle records.
- **Active / Maintenance / Inactive Ratio:** Aggregated directly by status badges.
- **Average Fleet Speed:** Calculated dynamically from each vehicle's `latest_telemetry.speed`.
- **Battery Health Level:** Real-time distribution chart rendered via Recharts.
- **Loading / Error / Empty States:** Handled using shadcn/ui Skeletons and responsive Alert cards.
