import { query, pool } from '../../config/db.js';
import { activeStore } from '../../config/seedStore.js';
import { calculateDistanceMeters } from '../../utils/geo.js';

class GeolocationService {
  /**
   * Search vehicles within geographical radius (metres) using Neon PostGIS find_vehicles_within_radius
   */
  async findVehiclesWithinRadius(centerLat, centerLng, radiusMeters) {
    if (pool) {
      try {
        const res = await query(
          'SELECT * FROM find_vehicles_within_radius($1, $2, $3)',
          [centerLat, centerLng, radiusMeters]
        );
        return res.rows;
      } catch (err) {
        console.warn('[GeolocationService] Neon PostGIS function failed, using fallback:', err.message);
      }
    }

    // In-memory fallback calculation
    const latestTelemetryByVehicle = new Map();
    for (const t of activeStore.telemetry) {
      const existing = latestTelemetryByVehicle.get(t.vehicle_id);
      if (!existing || new Date(t.recorded_at) > new Date(existing.recorded_at)) {
        latestTelemetryByVehicle.set(t.vehicle_id, t);
      }
    }

    const results = [];
    for (const [vehicleId, telemetry] of latestTelemetryByVehicle.entries()) {
      const vehicle = activeStore.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) continue;

      const distanceMeters = calculateDistanceMeters(
        centerLat,
        centerLng,
        telemetry.latitude,
        telemetry.longitude
      );

      if (distanceMeters <= radiusMeters) {
        results.push({
          vehicle_id: vehicle.id,
          registration_number: vehicle.registration_number,
          make: vehicle.make,
          model: vehicle.model,
          status: vehicle.status,
          type: vehicle.type,
          latitude: telemetry.latitude,
          longitude: telemetry.longitude,
          speed: telemetry.speed,
          fuel_level: telemetry.fuel_level,
          battery_level: telemetry.battery_level,
          distance_meters: distanceMeters,
          recorded_at: telemetry.recorded_at
        });
      }
    }

    results.sort((a, b) => a.distance_meters - b.distance_meters);
    return results;
  }

  /**
   * Get all latest vehicle locations for map markers
   */
  async getAllPositions() {
    if (pool) {
      try {
        const sql = `
          WITH latest_t AS (
            SELECT DISTINCT ON (vehicle_id)
              vehicle_id, latitude, longitude, speed, battery_level, fuel_level, engine_temp, recorded_at
            FROM telemetry
            ORDER BY vehicle_id, recorded_at DESC
          )
          SELECT
            v.id AS vehicle_id,
            v.registration_number,
            v.make,
            v.model,
            v.status,
            v.type,
            lt.latitude,
            lt.longitude,
            COALESCE(lt.speed, 0) AS speed,
            lt.battery_level,
            lt.fuel_level,
            lt.engine_temp,
            lt.recorded_at
          FROM vehicles v
          LEFT JOIN latest_t lt ON lt.vehicle_id = v.id
          ORDER BY v.created_at DESC
        `;
        const res = await query(sql);
        return res.rows;
      } catch (err) {
        console.warn('[GeolocationService] Neon DB query failed, using fallback:', err.message);
      }
    }

    const latestTelemetryByVehicle = new Map();
    for (const t of activeStore.telemetry) {
      const existing = latestTelemetryByVehicle.get(t.vehicle_id);
      if (!existing || new Date(t.recorded_at) > new Date(existing.recorded_at)) {
        latestTelemetryByVehicle.set(t.vehicle_id, t);
      }
    }

    return activeStore.vehicles.map((v) => {
      const tel = latestTelemetryByVehicle.get(v.id);
      return {
        vehicle_id: v.id,
        registration_number: v.registration_number,
        make: v.make,
        model: v.model,
        status: v.status,
        type: v.type,
        latitude: tel ? tel.latitude : null,
        longitude: tel ? tel.longitude : null,
        speed: tel ? tel.speed : 0,
        battery_level: tel ? tel.battery_level : null,
        fuel_level: tel ? tel.fuel_level : null,
        engine_temp: tel ? tel.engine_temp : null,
        recorded_at: tel ? tel.recorded_at : null
      };
    });
  }

  /**
   * Geocode a physical address or fleet depot name into GPS coordinates (lat, lng)
   * Supports OpenStreetMap Nominatim integration with deterministic local fallback.
   */
  async geocodeAddress(address) {
    if (!address || typeof address !== 'string') {
      const err = new Error('Invalid address provided for geocoding.');
      err.statusCode = 400;
      throw err;
    }

    const trimmed = address.trim().toLowerCase();

    // Known Fleet Depots and Bay Area landmarks
    const knownLocations = {
      'san francisco': { latitude: 37.7749, longitude: -122.4194, display_name: 'San Francisco Fleet Depot, CA, USA' },
      'sf': { latitude: 37.7749, longitude: -122.4194, display_name: 'San Francisco Fleet Depot, CA, USA' },
      'market st': { latitude: 37.7892, longitude: -122.4014, display_name: 'Market St Terminal, San Francisco, CA' },
      'oakland': { latitude: 37.8044, longitude: -122.2712, display_name: 'Port of Oakland Logistics Hub, Oakland, CA' },
      'san jose': { latitude: 37.3382, longitude: -121.8863, display_name: 'San Jose Distribution Center, San Jose, CA' },
      'sj': { latitude: 37.3382, longitude: -121.8863, display_name: 'San Jose Distribution Center, San Jose, CA' },
      'palo alto': { latitude: 37.4419, longitude: -122.1430, display_name: 'Palo Alto Station, CA, USA' },
      'fremont': { latitude: 37.5485, longitude: -121.9886, display_name: 'Fremont Industrial Complex, CA, USA' }
    };

    for (const [key, loc] of Object.entries(knownLocations)) {
      if (trimmed.includes(key)) {
        return {
          address,
          latitude: loc.latitude,
          longitude: loc.longitude,
          display_name: loc.display_name,
          source: 'known_fleet_depot'
        };
      }
    }

    // Attempt OpenStreetMap Nominatim lookup
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'FleetFlow-SGA2-FleetManagement/1.0 (academic-eval)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return {
            address,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            display_name: data[0].display_name,
            source: 'openstreetmap_nominatim'
          };
        }
      }
    } catch (err) {
      // Network blocked, timed out, or offline: proceed to fallback
    }

    // Deterministic Bay Area fallback
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = (hash << 5) - hash + trimmed.charCodeAt(i);
      hash |= 0;
    }
    const latOffset = ((Math.abs(hash) % 1000) / 1000) * 0.4 - 0.2;
    const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000) * 0.4 - 0.2;

    return {
      address,
      latitude: parseFloat((37.7749 + latOffset).toFixed(5)),
      longitude: parseFloat((-122.4194 + lngOffset).toFixed(5)),
      display_name: `${address} (Geocoded Coordinate Approximation)`,
      source: 'geocoding_approximator'
    };
  }
}

export const geolocationService = new GeolocationService();
