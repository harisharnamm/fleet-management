# API Endpoint Reference — FleetFlow Fleet Management System

All endpoints are accessible through the API Gateway at `http://localhost:4000/api` (and directly at `http://localhost:4001/api` for internal service-to-service routing).

Requests through the API Gateway must include the header:
```http
x-api-key: dev-secret-key-12345
```

Protected endpoints require a valid JWT Bearer token:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Description:** Authenticates a user with email and password, returning a signed JWT token and user profile.
- **Access:** Public (Requires `x-api-key` only)
- **Request Body:**
  ```json
  {
    "email": "admin@fleetms.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "a0000000-0000-0000-0000-000000000001",
        "email": "admin@fleetms.com",
        "full_name": "Fleet Administrator",
        "role": "admin"
      }
    }
  }
  ```

### `POST /api/auth/register`
- **Description:** Registers a new user account.
- **Access:** Public (Requires `x-api-key` only)
- **Request Body:**
  ```json
  {
    "email": "dispatcher@fleetms.com",
    "password": "Password123!",
    "full_name": "Fleet Dispatcher",
    "role": "fleet_manager"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "e4f8b21c-...",
      "email": "dispatcher@fleetms.com",
      "full_name": "Fleet Dispatcher",
      "role": "fleet_manager"
    }
  }
  ```

### `GET /api/auth/me`
- **Description:** Retrieves profile of the currently authenticated user.
- **Access:** Protected (Any valid authenticated role)

---

## 2. User Administration Endpoints

### `GET /api/users`
- **Description:** Lists all registered users.
- **Access:** Protected (`admin` role only)
- **Response (200 OK):** Array of user objects.

---

## 3. Vehicle Fleet Endpoints

### `GET /api/vehicles`
- **Description:** Lists fleet vehicles with optional query filtering.
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)
- **Query Parameters:**
  - `status` (`active` | `maintenance` | `retired`)
  - `type` (`truck` | `van` | `car`)
  - `search` (text search matching registration number, make, or model)
- **Response (200 OK):**
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
        "latest_telemetry": {
          "speed": 65.5,
          "latitude": 37.7792,
          "longitude": -122.4140,
          "battery_level": 82.0
        }
      }
    ]
  }
  ```

### `GET /api/vehicles/:id`
- **Description:** Retrieves detailed vehicle record including latest telemetry fix and recent operational event history.
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)

### `POST /api/vehicles`
- **Description:** Registers a new vehicle into the fleet registry.
- **Access:** Protected (`admin`, `fleet_manager`)
- **Request Body:**
  ```json
  {
    "vin": "1HD1KAE14KB123456",
    "registration_number": "FLT-303-NV",
    "make": "Freightliner",
    "model": "eCascadia",
    "year": 2024,
    "status": "active",
    "type": "truck"
  }
  ```

### `PATCH /api/vehicles/:id`
- **Description:** Updates vehicle metadata or status. Changing status automatically records a `STATUS_CHANGE` event and triggers a Mock SMS alert.
- **Access:** Protected (`admin`, `fleet_manager`)
- **Request Body:**
  ```json
  {
    "status": "maintenance"
  }
  ```

### `DELETE /api/vehicles/:id`
- **Description:** Permanently deletes a vehicle record and associated telemetry from Neon PostgreSQL.
- **Access:** Protected (`admin` role strictly required — returns `403 Forbidden` for other roles)

---

## 4. Telemetry Endpoints

### `POST /api/telemetry`
- **Description:** Ingests GPS and operational metrics, converting coordinates into a PostGIS `geography(Point, 4326)` object. Evaluates critical event thresholds (`battery_level < 15`, `emergency_stop: true`, `engine_fault: true`, `engine_temp > 105`, `speed > 120`).
- **Access:** Protected (`admin`, `fleet_manager`)
- **Request Body:**
  ```json
  {
    "vehicle_id": "b0000000-0000-0000-0000-000000000001",
    "speed": 62.0,
    "battery_level": 12.0,
    "engine_temp": 89.0,
    "latitude": 37.7749,
    "longitude": -122.4194,
    "odometer": 15420.5
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Telemetry record accepted and persisted",
    "data": {
      "record": {
        "id": "...",
        "vehicle_id": "b0000000-0000-0000-0000-000000000001",
        "speed": 62.0,
        "battery_level": 12.0,
        "location": "POINT(-122.4194 37.7749)",
        "recorded_at": "2026-11-15T15:37:45.947Z"
      },
      "critical_alert": true,
      "notification": {
        "recipient": "+14155557788",
        "message": "CRITICAL ALERT: Vehicle FLT-101-TX reported LOW BATTERY warning at 12%.",
        "status": "delivered"
      }
    }
  }
  ```

### `GET /api/telemetry/vehicle/:id`
- **Description:** Retrieves historical telemetry readings for a specific vehicle.
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)

---

## 5. Geolocation & Maps Endpoints

### `GET /api/maps/nearby`
- **Description:** Executes a PostGIS spatial query using `ST_DWithin` and `ST_Distance` returning vehicles within radius (in metres) ordered by proximity.
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)
- **Query Parameters:**
  - `lat` (required, float between -90 and 90)
  - `lng` (required, float between -180 and 180)
  - `radius` (required, positive number in metres)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Nearby vehicles retrieved",
    "data": {
      "center": { "latitude": 37.7749, "longitude": -122.4194 },
      "radius_meters": 5000,
      "count": 2,
      "vehicles": [
        {
          "vehicle_id": "b0000000-0000-0000-0000-000000000001",
          "registration_number": "FLT-101-TX",
          "make": "Ford",
          "model": "F-150 Lightning",
          "status": "active",
          "latitude": 37.7792,
          "longitude": -122.4140,
          "speed": 65.5,
          "distance_meters": 1186.14
        }
      ]
    }
  }
  ```

### `GET /api/maps/positions`
- **Description:** Retrieves the latest GPS fix for all vehicles in the fleet for display on OpenStreetMap.
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)

### `GET /api/maps/geocode`
- **Description:** Converts physical addresses, cities, or depot names into geographical coordinates (lat, lng).
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)
- **Query Parameters:**
  - `address` (required string, e.g. `San Francisco Fleet Depot`)
- **Response (200 OK):**
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

---

## 6. Notifications Endpoints

### `GET /api/notifications`
- **Description:** Retrieves historical notification audit logs from Neon PostgreSQL.
- **Access:** Protected (`admin`, `fleet_manager`, `viewer`)
- **Query Parameters:**
  - `status` (optional: `delivered` | `failed`)
  - `limit` (default: 50)

### `POST /api/notifications/simulate`
- **Description:** Manually dispatches a simulated SMS notification to test carrier receipts and delivery logging.
- **Access:** Protected (`admin`, `fleet_manager`)
- **Request Body:**
  ```json
  {
    "recipient": "+14155551234",
    "message": "Manual dispatch test",
    "simulateFailure": false
  }
  ```
