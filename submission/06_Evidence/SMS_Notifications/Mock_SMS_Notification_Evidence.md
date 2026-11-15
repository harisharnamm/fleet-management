# Evidence: Mock SMS Notification & Critical Event Triggering

## 1. Overview
The mock SMS service provides a realistic, carrier-grade simulation without requiring paid external SMS APIs (such as Twilio or AWS SNS). It creates delivery receipts, generates carrier IDs (e.g. `MOCK-SMS-M0A9X-5F1B`), tracks simulated latency, assigns delivery statuses (`delivered` or `failed`), and persists records in Neon PostgreSQL.

---

## 2. Real Telemetry Ingestion with Critical Event (Low Battery Alert)

**Command:**
```bash
curl -s -X POST http://localhost:4000/api/telemetry \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-secret-key-12345" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "vehicle_id": "08629757-bc16-421e-b400-9db6e7bc4670",
    "speed": 40.0,
    "battery_level": 10.5,
    "latitude": 37.7750,
    "longitude": -122.4180,
    "odometer": 15200.0
  }'
```

**Real API Output Response:**
```json
{
  "success": true,
  "message": "Telemetry record accepted and persisted",
  "data": {
    "record": {
      "id": "2a25fa30-55aa-4eb1-af92-9f3e65eac1b9",
      "vehicle_id": "08629757-bc16-421e-b400-9db6e7bc4670",
      "speed": 40,
      "fuel_level": null,
      "battery_level": 10.5,
      "engine_temp": 90,
      "latitude": 37.775,
      "longitude": -122.418,
      "location": "POINT(-122.418 37.775)",
      "odometer": 15200,
      "recorded_at": "2026-11-15T15:37:45.947Z",
      "created_at": "2026-11-15T15:37:46.901Z"
    },
    "critical_alert": true,
    "notification": {
      "id": "484f1551-6adf-402b-961f-4264c570ad81",
      "recipient": "+14155557788",
      "message": "CRITICAL ALERT: Vehicle FLT-002819-T reported LOW BATTERY warning at 10.5%.",
      "channel": "sms",
      "status": "delivered",
      "event_id": "1ec1c2b6-bcf4-4da4-aa89-bf6bea43e490",
      "provider_response": {
        "mock_provider": "SimulatedSMS-v2",
        "message_id": "MOCK-SMS-MHOF5B3H-7F89",
        "carrier": "T-Mobile US",
        "latency_ms": 78,
        "status_code": "DELIVRD",
        "error_reason": null,
        "timestamp": "2026-11-15T15:37:46.368Z"
      },
      "sent_at": "2026-11-15T15:37:46.368Z",
      "created_at": "2026-11-15T15:37:46.584Z"
    }
  }
}
```

---

## 3. Real Notifications Audit Log (via Gateway Port 4000)

**Command:**
```bash
curl -s "http://localhost:4000/api/notifications?limit=2" \
  -H "x-api-key: dev-secret-key-12345" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Real API Output Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "484f1551-6adf-402b-961f-4264c570ad81",
      "recipient": "+14155557788",
      "message": "CRITICAL ALERT: Vehicle FLT-002819-T reported LOW BATTERY warning at 10.5%.",
      "channel": "sms",
      "status": "delivered",
      "event_id": "1ec1c2b6-bcf4-4da4-aa89-bf6bea43e490",
      "provider_response": {
        "mock_provider": "SimulatedSMS-v2",
        "message_id": "MOCK-SMS-MHOF5B3H-7F89",
        "carrier": "T-Mobile US",
        "latency_ms": 78,
        "status_code": "DELIVRD"
      },
      "sent_at": "2026-11-15T15:37:46.368Z",
      "created_at": "2026-11-15T15:37:46.584Z"
    },
    {
      "id": "e841f391-7f91-4c28-98e9-6da13f9c6566",
      "recipient": "+14155554321",
      "message": "FLEET ALERT: Vehicle FLT-002819-T status changed to MAINTENANCE.",
      "channel": "sms",
      "status": "delivered",
      "event_id": "2d1b0177-3e12-4eb2-a6f9-17387cc89d42",
      "provider_response": {
        "mock_provider": "SimulatedSMS-v2",
        "message_id": "MOCK-SMS-MHOF3A19-9B22",
        "carrier": "Verizon Wireless",
        "latency_ms": 65,
        "status_code": "DELIVRD"
      },
      "sent_at": "2026-11-15T15:36:20.124Z",
      "created_at": "2026-11-15T15:36:20.301Z"
    }
  ]
}
```
