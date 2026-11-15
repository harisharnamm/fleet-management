import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/config/seedStore.js';

describe('Flow 4: Vehicle Status Update Triggering a Notification', () => {
  let managerToken;
  const targetVehicleId = 'b0000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    resetStore();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fleetms.com', password: 'Password123!' });
    managerToken = loginRes.body.data.token;

    // Ensure target vehicle starts as active so transitioning to maintenance triggers an alert
    await request(app)
      .patch(`/api/vehicles/${targetVehicleId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'active' });
  });

  it('should automatically trigger and persist a Mock SMS notification when vehicle status changes to maintenance', async () => {
    // 1. Update vehicle status to maintenance
    const updateRes = await request(app)
      .patch(`/api/vehicles/${targetVehicleId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'maintenance' });

    expect(updateRes.status).to.equal(200);
    expect(updateRes.body.data.vehicle.status).to.equal('maintenance');
    expect(updateRes.body.data.notification_triggered).to.be.true;

    const notification = updateRes.body.data.notification;
    expect(notification).to.have.property('id');
    expect(notification.channel).to.equal('sms');
    expect(notification.status).to.equal('delivered');
    expect(notification.message).to.include('FLT-101-TX');
    expect(notification.provider_response).to.have.property('message_id');
    expect(notification.provider_response.status_code).to.equal('DELIVRD');

    // 2. Verify notification appears in the global notification log endpoint
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(listRes.status).to.equal(200);
    const persisted = listRes.body.data.find((n) => n.id === notification.id);
    expect(persisted).to.exist;
    expect(persisted.status).to.equal('delivered');
  });

  it('should allow manually triggering a simulated SMS alert with delivery status tracking', async () => {
    const simRes = await request(app)
      .post('/api/notifications/simulate')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        recipient: '+14155558899',
        message: 'TEST DISPATCH: Fleet depot gate clearance approved.',
        simulateFailure: false
      });

    expect(simRes.status).to.equal(201);
    expect(simRes.body.data.status).to.equal('delivered');
    expect(simRes.body.data.provider_response.status_code).to.equal('DELIVRD');
  });
});
