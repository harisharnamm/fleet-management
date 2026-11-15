# Security and Rate Limiting at the API Gateway

## 1. Perimeter API Key Validation

All requests targeting `/api/*` routes are subject to pre-routing validation by the `apiKeyAuth` middleware located in `gateway/src/middleware/apiKey.js`.

### Validation Mechanism
1. The middleware inspects `req.headers['x-api-key']`.
2. If the header is missing, or does not match the configured `GATEWAY_API_KEY`, the request is immediately terminated with an HTTP `401 Unauthorized`:
   ```json
   {
     "success": false,
     "error": {
       "message": "Unauthorized: Invalid or missing API key. Provide a valid x-api-key header.",
       "code": "GATEWAY_UNAUTHORIZED"
     }
   }
   ```
3. Public routes (such as `GET /health`) bypass this check to facilitate health probes by load balancers and orchestrators.

---

## 2. Rate Limiting Configuration

The gateway uses `express-rate-limit` to safeguard the backend against abusive traffic, denial of service, and credential brute-forcing.

### Configuration Parameters
- **Window Size:** 1 minute (`60,000` ms)
- **Max Requests:** 100 requests per IP per window (standard runtime); configured to 5 requests in automated testing to verify 429 triggers.
- **Headers Exposed:** Standard rate limit headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) are attached to responses.
- **Excess Response (429 Too Many Requests):**
  ```json
  {
    "success": false,
    "error": {
      "message": "Too many requests from this client. Please slow down and retry in a minute.",
      "code": "GATEWAY_RATE_LIMIT_EXCEEDED"
    }
  }
  ```

---

## 3. Frontend Client Demonstration Notice
> [!NOTE]
> The frontend single-page application injects `VITE_GATEWAY_API_KEY` into Axios requests. While storing API keys in frontend bundles is standard for public API keys (e.g., Google Maps API keys, Mapbox tokens), in enterprise production deployments, client-facing applications typically authenticate using session cookies or OAuth tokens, and API keys are reserved for server-to-server or B2B developer integrations. This mechanism is implemented here to satisfy the SGA 2 academic course requirement for an API Gateway simulation.
