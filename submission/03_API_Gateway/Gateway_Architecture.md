# API Gateway Architecture & Resilience

## 1. Overview
The API Gateway is a dedicated Express service running on port 4000. It acts as the reverse proxy, rate limiter, and perimeter security boundary between the client web application (or external consumers) and the internal backend services (running on port 4001).

```text
[External Clients / Web Browser]
               │
               ▼ (Port 4000)
┌──────────────────────────────────────────────┐
│             EXPRESS API GATEWAY              │
│                                              │
│  1. Helmet & CORS Policies                   │
│  2. In-Memory Sliding Window Rate Limiter    │
│  3. Perimeter API Key Validator (x-api-key)  │
│  4. Route Filtering & Reverse Proxy          │
│  5. 503 Service Unavailable Error Trap       │
└──────────────────────────────────────────────┘
               │
               ▼ (Port 4001)
[Backend Modular Monolith (Express Services)]
```

---

## 2. Reverse Proxy Implementation
The gateway leverages `http-proxy-middleware` (v3). To guarantee that path structures remain intact and the `/api/` prefix is not stripped by Express router mounting, the proxy is configured with an explicit path filter and mounted at the root level:

```javascript
const proxyMiddleware = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathFilter: (pathname) => pathname.startsWith('/api/'),
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward request body for POST/PUT/PATCH methods
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    error: (err, req, res) => {
      // Structured 503 Service Unavailable trap
      res.status(503).json({
        success: false,
        error: {
          message: 'Backend service is temporarily unavailable. Please retry in a few moments.',
          code: 'BACKEND_SERVICE_UNAVAILABLE',
          upstream: BACKEND_URL
        }
      });
    }
  }
});

app.use(proxyMiddleware);
```

---

## 3. Resilience and Fault Isolation
When the backend service is stopped, restarting, or experiencing network partitions:
- The gateway catches `ECONNREFUSED` or connection timeouts in the `on.error` handler.
- Rather than hanging indefinitely or dumping a raw Node.js stack trace, the gateway returns an RFC-compliant `503 Service Unavailable` JSON response with a standardized error code `BACKEND_SERVICE_UNAVAILABLE`.
- Client applications can inspect this code and display an informative offline or reconnect banner to users.
