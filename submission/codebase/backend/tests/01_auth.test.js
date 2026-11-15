import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/config/seedStore.js';

describe('Flow 1: Login and JWT Authentication', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should reject login with missing or invalid credentials (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fleetms.com', password: 'WrongPassword!' });

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('AUTH_INVALID_CREDENTIALS');
  });

  it('should reject login when payload fails validation (400)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '123' });

    expect(res.status).to.equal(400);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('VALIDATION_ERROR');
  });

  it('should authenticate valid user and return a signed JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fleetms.com', password: 'Password123!' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('token');
    expect(res.body.data.user).to.include({
      email: 'admin@fleetms.com',
      role: 'admin'
    });
    expect(res.body.data.user).to.not.have.property('password_hash');
  });

  it('should allow accessing protected /api/auth/me with valid Bearer token', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fleetms.com', password: 'Password123!' });

    const token = loginRes.body.data.token;

    // 2. Fetch profile
    const profileRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.status).to.equal(200);
    expect(profileRes.body.success).to.be.true;
    expect(profileRes.body.data.user.email).to.equal('manager@fleetms.com');
    expect(profileRes.body.data.user.role).to.equal('fleet_manager');
  });

  it('should reject protected route when Authorization token is missing or malformed', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).to.equal(401);
    expect(res.body.error.code).to.equal('AUTH_TOKEN_MISSING');
  });
});
