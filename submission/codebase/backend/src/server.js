import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`🚗 Fleet Management Backend running on http://localhost:${config.port}`);
  console.log(`📖 Swagger API Documentation available at http://localhost:${config.port}/api-docs`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: gracefully shutting down backend server');
  server.close(() => {
    console.log('Backend server closed');
  });
});
