import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupProxyRoutes } from './routes/proxy.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'api-key']
}));

// Request logging (omit in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limiting
app.use(rateLimiter);

// Gateway Health Check (bypasses API key validation)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fleet-management-api-gateway',
    port: process.env.PORT || 4000,
    upstream: process.env.BACKEND_URL || 'http://localhost:4001',
    timestamp: new Date().toISOString()
  });
});

// Enforce API key on all /api/* routes
app.use('/api', apiKeyMiddleware);

// Mount proxy routes to upstream backend
setupProxyRoutes(app);

// Gateway 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Gateway route not found: ${req.method} ${req.originalUrl}`,
      code: 'GATEWAY_ROUTE_NOT_FOUND'
    }
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
