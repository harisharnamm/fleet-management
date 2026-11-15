import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import yaml from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env.js';
import { getDatabaseStatus } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import vehiclesRoutes from './modules/vehicles/vehicles.routes.js';
import telemetryRoutes from './modules/telemetry/telemetry.routes.js';
import geolocationRoutes from './modules/geolocation/geolocation.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow Swagger UI inline assets
}));

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'api-key', 'x-forwarded-gateway']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Backend Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fleet-management-backend',
    version: '1.0.0',
    port: config.port,
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString()
  });
});

// Swagger UI Documentation
try {
  let openapiPath = path.resolve(process.cwd(), 'docs/openapi.yaml');
  if (!fs.existsSync(openapiPath)) {
    openapiPath = path.resolve(process.cwd(), '../docs/openapi.yaml');
  }

  if (fs.existsSync(openapiPath)) {
    const swaggerDocument = yaml.load(openapiPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
} catch (err) {
  console.warn('[SWAGGER WARNING] Could not load openapi.yaml:', err.message);
}

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/maps', geolocationRoutes);
app.use('/api/notifications', notificationsRoutes);

// Catch unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
