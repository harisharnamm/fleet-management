import app from './app.js';

const PORT = parseInt(process.env.PORT || '4000', 10);

const server = app.listen(PORT, () => {
  console.log(`🚀 Fleet API Gateway running on http://localhost:${PORT}`);
  console.log(`🔗 Upstream Backend URL: ${process.env.BACKEND_URL || 'http://localhost:4001'}`);
  console.log(`🛡️ Rate limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} req / ${process.env.RATE_LIMIT_WINDOW_MS || 60000} ms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing API Gateway server');
  server.close(() => {
    console.log('API Gateway closed');
  });
});
