import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/config/seedStore.js';

describe('Flow 6: Nearby Vehicle Search with Mocked Geolocation', () => {
  let viewerToken;
  // Downtown San Francisco search reference point
  const centerLat = 37.7749;
  const centerLng = -122.4194;

  beforeEach(async () => {
    resetStore();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@fleetms.com', password: 'Password123!' });
    viewerToken = loginRes.body.data.token;
  });

  it('should find vehicles within a 3,000 metre radius and calculate distance in metres', async () => {
    const res = await request(app)
      .get(`/api/maps/nearby?lat=${centerLat}&lng=${centerLng}&radius=3000`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.vehicles).to.be.an('array');

    const vehicles = res.body.data.vehicles;
    expect(vehicles.length).to.be.greaterThan(0);

    // Verify all returned vehicles are within 3000 metres
    vehicles.forEach((v) => {
      expect(v.distance_meters).to.be.at.most(3000);
      expect(v).to.have.property('latitude');
      expect(v).to.have.property('longitude');
      expect(v).to.have.property('registration_number');
    });

    // Verify ascending order by distance_meters
    for (let i = 0; i < vehicles.length - 1; i++) {
      expect(vehicles[i].distance_meters).to.be.at.most(vehicles[i + 1].distance_meters);
    }

    // Vehicle 2 (in Oakland, ~13,000m away) must NOT be included in a 3,000m search
    const oaklandVehicle = vehicles.find((v) => v.registration_number === 'FLT-202-CA');
    expect(oaklandVehicle).to.be.undefined;
  });

  it('should include more distant vehicles when radius is expanded to 25,000 metres', async () => {
    const res = await request(app)
      .get(`/api/maps/nearby?lat=${centerLat}&lng=${centerLng}&radius=25000`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).to.equal(200);
    const vehicles = res.body.data.vehicles;
    expect(vehicles.length).to.be.greaterThanOrEqual(4);

    const oaklandVehicle = vehicles.find((v) => v.registration_number === 'FLT-202-CA');
    expect(oaklandVehicle).to.exist;
    expect(oaklandVehicle.distance_meters).to.be.greaterThan(10000);
  });

  it('should reject invalid coordinates or radius with 400 Validation Error', async () => {
    const res = await request(app)
      .get('/api/maps/nearby?lat=999&lng=-122.4&radius=-50')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.error.code).to.equal('VALIDATION_ERROR');
  });

  it('should geocode address to valid GPS coordinates (lat, lng)', async () => {
    const res = await request(app)
      .get('/api/maps/geocode?address=San%20Francisco%20Fleet%20Depot')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('latitude');
    expect(res.body.data).to.have.property('longitude');
    expect(res.body.data.latitude).to.be.closeTo(37.77, 0.5);
    expect(res.body.data.longitude).to.be.closeTo(-122.41, 0.5);
    expect(res.body.data).to.have.property('display_name');
  });
});
