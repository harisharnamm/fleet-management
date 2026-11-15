import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

/**
 * Configure reverse proxy router to upstream backend service
 * Genuinely proxies all /api/* routes preserving exact path, HTTP verbs, headers, queries, and bodies.
 */
export function setupProxyRoutes(app) {
  const backendTarget = process.env.BACKEND_URL || 'http://localhost:4001';

  const proxyMiddleware = createProxyMiddleware({
    target: backendTarget,
    changeOrigin: true,
    ws: false,
    pathFilter: (pathname) => pathname.startsWith('/api/'),
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Forward client identification
        proxyReq.setHeader('x-forwarded-gateway', 'fleet-gateway-v1');
        // Fix body stream if body-parser has already parsed it
        fixRequestBody(proxyReq, req);
      },
      error: (err, req, res) => {
        console.error(`[GATEWAY PROXY ERROR] Failed to connect to ${backendTarget}${req.url}:`, err.message);

        // Structured 503 response when upstream backend is down
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            error: {
              message: 'Backend service is currently unavailable. Ensure the backend server is running on port 4001.',
              code: 'GATEWAY_BACKEND_UNAVAILABLE',
              target: backendTarget,
              path: req.originalUrl
            }
          });
        }
      }
    }
  });

  // Mount at root with pathFilter to preserve full /api/... path upstream
  app.use(proxyMiddleware);
}
