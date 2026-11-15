import { expect } from 'chai';
import request from 'supertest';
import gatewayApp from '../../gateway/src/app.js';

describe('Flow 7: Gateway API Key Verification and Rate Limiting', () => {
  const validApiKey = 'dev-secret-key-12345';

  it('should allow /health on Gateway without an API key', async () => {
    const res = await request(gatewayApp).get('/health');
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('ok');
    expect(res.body.service).to.equal('fleet-management-api-gateway');
  });

  it('should reject requests to /api/* when x-api-key header is missing with 401', async () => {
    const res = await request(gatewayApp).get('/api/vehicles');

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('GATEWAY_UNAUTHORIZED');
  });

  it('should reject requests with an invalid x-api-key with 401', async () => {
    const res = await request(gatewayApp)
      .get('/api/vehicles')
      .set('x-api-key', 'invalid-fake-key');

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('GATEWAY_UNAUTHORIZED');
  });

  it('should accept requests when valid x-api-key is supplied', async () => {
    // With valid API key, gateway forwards to backend.
    // If backend isn't listening as a daemon in this isolated unit test, gateway responds with 503
    // or forwards the response if backend is running.
    // Either way, it successfully passes the Gateway API Key verification!
    const res = await request(gatewayApp)
      .get('/api/vehicles')
      .set('x-api-key', validApiKey);

    // It must NOT be 401 Unauthorized
    expect(res.status).to.not.equal(401);
    if (res.status === 503) {
      expect(res.body.error.code).to.equal('GATEWAY_BACKEND_UNAVAILABLE');
    } else {
      expect([200, 401]).to.include(res.status); // 401 would be backend JWT check if forwarded
    }
  });

  it('should enforce rate limiting and return 429 when threshold is exceeded', async () => {
    // Temporarily trigger rapid requests to test rate limiter
    let rateLimited = false;
    for (let i = 0; i < 110; i++) {
      const res = await request(gatewayApp)
        .get('/health'); // /health triggers rate limiter middleware
      if (res.status === 429) {
        rateLimited = true;
        expect(res.body.error.code).to.equal('RATE_LIMIT_EXCEEDED');
        break;
      }
    }
    expect(rateLimited).to.be.true;
  });
});
