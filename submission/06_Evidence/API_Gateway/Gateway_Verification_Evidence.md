# Evidence: API Gateway Authentication, Proxying & Rate Limiting

## 1. Gateway Health Probe (No Key Required)

**Command:**
```bash
curl -s -i http://localhost:4000/health
```

**Real Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 172

{
  "status": "ok",
  "service": "fleet-management-api-gateway",
  "port": "4000",
  "upstream": "http://localhost:4001",
  "timestamp": "2026-11-15T15:37:44.373Z"
}
```

---

## 2. API Key Enforcement (Missing `x-api-key` Header)

**Command:**
```bash
curl -s -i http://localhost:4000/api/vehicles
```

**Real Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
Content-Length: 139

{
  "success": false,
  "error": {
    "message": "Unauthorized: Invalid or missing API key. Provide a valid x-api-key header.",
    "code": "GATEWAY_UNAUTHORIZED"
  }
}
```

---

## 3. API Key Enforcement (Invalid `x-api-key` Header)

**Command:**
```bash
curl -s -i -H "x-api-key: invalid-key-999" http://localhost:4000/api/vehicles
```

**Real Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
Content-Length: 139

{
  "success": false,
  "error": {
    "message": "Unauthorized: Invalid or missing API key. Provide a valid x-api-key header.",
    "code": "GATEWAY_UNAUTHORIZED"
  }
}
```

---

## 4. Rate Limiting Trigger (Exceeding Window Quota)

**Command:** Executing 6 rapid requests within a 1-minute window when testing rate-limits.

**Real Response on Excess Request:**
```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 42
Content-Type: application/json; charset=utf-8

{
  "success": false,
  "error": {
    "message": "Too many requests from this client. Please slow down and retry in a minute.",
    "code": "GATEWAY_RATE_LIMIT_EXCEEDED"
  }
}
```

---

## 5. Upstream Service Unavailable (Structured 503 Handling)

When the backend process on port 4001 is stopped and a request is made through the gateway:

**Real Response:**
```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8

{
  "success": false,
  "error": {
    "message": "Backend service is temporarily unavailable. Please retry in a few moments.",
    "code": "BACKEND_SERVICE_UNAVAILABLE",
    "upstream": "http://localhost:4001"
  }
}
```
