import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/config/seedStore.js';

describe('Flow 5: RBAC Rejection of Unauthorized Vehicle Deletion', () => {
  let adminToken;
  let managerToken;
  let viewerToken;
  const targetVehicleId = 'b0000000-0000-0000-0000-000000000005'; // FLT-505-IL

  beforeEach(async () => {
    resetStore();

    // Login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fleetms.com', password: 'Password123!' });
    adminToken = adminRes.body.data.token;

    // Login Manager
    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fleetms.com', password: 'Password123!' });
    managerToken = managerRes.body.data.token;

    // Login Viewer
    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@fleetms.com', password: 'Password123!' });
    viewerToken = viewerRes.body.data.token;
  });

  it('should reject vehicle deletion by viewer with 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${targetVehicleId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).to.equal(403);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('RBAC_ACCESS_DENIED');
  });

  it('should reject vehicle deletion by fleet_manager with 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${targetVehicleId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).to.equal(403);
    expect(res.body.success).to.be.false;
    expect(res.body.error.code).to.equal('RBAC_ACCESS_DENIED');
  });

  it('should allow vehicle deletion by admin (200)', async () => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vin: `1DELVIN00${uniqueSuffix}`, // 17 chars valid VIN
        registration_number: `DEL-${uniqueSuffix}`,
        make: 'Volvo',
        model: 'VNL Heavy',
        year: 2022,
        status: 'active',
        type: 'truck'
      });
    const vehicleToDeleteId = createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/vehicles/${vehicleToDeleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).to.equal(200);
    expect(deleteRes.body.success).to.be.true;

    // Verify subsequent lookup returns 404
    const getRes = await request(app)
      .get(`/api/vehicles/${vehicleToDeleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).to.equal(404);
  });
});
