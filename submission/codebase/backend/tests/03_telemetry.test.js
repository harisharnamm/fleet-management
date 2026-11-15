import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/config/seedStore.js';

describe('Flow 3: Telemetry Submission and Persistence', () => {
  let managerToken;
  const targetVehicleId = 'b0000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    resetStore();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fleetms.com', password: 'Password123!' });
    managerToken = loginRes.body.data.token;
  });

  it('should accept telemetry data and correctly persist PostGIS POINT(lng lat)', async () => {
    const telemetryPayload = {
      vehicle_id: targetVehicleId,
      speed: 65.5,
      battery_level: 82.0,
      engine_temp: 88.5,
      latitude: 37.7833,
      longitude: -122.4167,
      odometer: 14500.0
    };

    const submitRes = await request(app)
      .post('/api/telemetry')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(telemetryPayload);

    expect(submitRes.status).to.equal(201);
    expect(submitRes.body.success).to.be.true;
    expect(submitRes.body.data.record).to.include({
      speed: 65.5,
      latitude: 37.7833,
      longitude: -122.4167
    });

    // Check exact PostGIS coordinate order: POINT(longitude latitude)
    expect(submitRes.body.data.record.location).to.equal('POINT(-122.4167 37.7833)');

    // Verify retrieval in vehicle telemetry history
    const historyRes = await request(app)
      .get(`/api/telemetry/vehicle/${targetVehicleId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(historyRes.status).to.equal(200);
    expect(historyRes.body.data).to.be.an('array');
    const latest = historyRes.body.data[0];
    expect(latest.speed).to.equal(65.5);
    expect(latest.latitude).to.equal(37.7833);
    expect(latest.longitude).to.equal(-122.4167);
  });

  it('should reject telemetry for non-existent vehicle with 404', async () => {
    const invalidPayload = {
      vehicle_id: '00000000-0000-0000-0000-000000000000',
      speed: 50,
      latitude: 37.77,
      longitude: -122.41,
      odometer: 1000
    };

    const res = await request(app)
      .post('/api/telemetry')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(invalidPayload);

    expect(res.status).to.equal(404);
    expect(res.body.error.code).to.equal('VEHICLE_NOT_FOUND');
  });

  it('should detect critical events (low battery, emergency stop, engine overheat) and trigger mock SMS', async () => {
    // 1. Low battery critical event
    const lowBatteryPayload = {
      vehicle_id: targetVehicleId,
      speed: 30.0,
      battery_level: 12.0, // < 15% threshold
      latitude: 37.78,
      longitude: -122.41,
      odometer: 14550.0
    };

    const lowBatteryRes = await request(app)
      .post('/api/telemetry')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(lowBatteryPayload);

    expect(lowBatteryRes.status).to.equal(201);
    expect(lowBatteryRes.body.data.critical_alert).to.be.true;
    expect(lowBatteryRes.body.data.notification.status).to.equal('delivered');
    expect(lowBatteryRes.body.data.notification.message).to.include('LOW BATTERY');

    // 2. Emergency stop critical event
    const emergencyStopPayload = {
      vehicle_id: targetVehicleId,
      speed: 0.0,
      emergency_stop: true,
      latitude: 37.785,
      longitude: -122.415,
      odometer: 14555.0
    };

    const emergencyStopRes = await request(app)
      .post('/api/telemetry')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(emergencyStopPayload);

    expect(emergencyStopRes.status).to.equal(201);
    expect(emergencyStopRes.body.data.critical_alert).to.be.true;
    expect(emergencyStopRes.body.data.notification.message).to.include('EMERGENCY STOP');
  });
});
