import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/config/seedStore.js';

describe('Flow 2: Vehicle Registration and Retrieval', () => {
  let adminToken;

  beforeEach(async () => {
    resetStore();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fleetms.com', password: 'Password123!' });
    adminToken = loginRes.body.data.token;
  });

  it('should register a new vehicle and retrieve it by ID', async () => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const newVehicleData = {
      vin: `1HGCR2F${uniqueSuffix}`,
      registration_number: `FLT-${uniqueSuffix}-T`,
      make: 'Honda',
      model: 'Accord Fleet',
      year: 2023,
      status: 'active',
      type: 'sedan'
    };

    // 1. Create vehicle
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newVehicleData);

    expect(createRes.status).to.equal(201);
    expect(createRes.body.success).to.be.true;
    expect(createRes.body.data.registration_number).to.equal(`FLT-${uniqueSuffix}-T`);
    const createdId = createRes.body.data.id;

    // 2. Retrieve vehicle by ID
    const getRes = await request(app)
      .get(`/api/vehicles/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).to.equal(200);
    expect(getRes.body.data.id).to.equal(createdId);
    expect(getRes.body.data.make).to.equal('Honda');
    expect(getRes.body.data.model).to.equal('Accord Fleet');
  });

  it('should reject duplicate vehicle registration numbers with 409 Conflict', async () => {
    const duplicateData = {
      vin: '1HGCR2F83HA999999',
      registration_number: 'FLT-101-TX', // Already exists in seed data
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      status: 'active',
      type: 'truck'
    };

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(duplicateData);

    expect(res.status).to.equal(409);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('DUPLICATE_REGISTRATION_NUMBER');
  });

  it('should list all vehicles and support filtering by status', async () => {
    const listRes = await request(app)
      .get('/api/vehicles?status=active')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).to.equal(200);
    expect(listRes.body.success).to.be.true;
    expect(listRes.body.data).to.be.an('array');
    listRes.body.data.forEach((v) => {
      expect(v.status).to.equal('active');
    });
  });
});
