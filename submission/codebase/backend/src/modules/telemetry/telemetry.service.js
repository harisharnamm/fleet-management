import crypto from 'crypto';
import { query, pool } from '../../config/db.js';
import { activeStore } from '../../config/seedStore.js';
import { mockSmsService } from '../notifications/mockSms.service.js';

class TelemetryService {
  /**
   * Ingest and persist telemetry record into Neon PostgreSQL with PostGIS geography point
   */
  async recordTelemetry(data) {
    let vehicle = null;

    if (pool) {
      try {
        const vRes = await query('SELECT * FROM vehicles WHERE id = $1', [data.vehicle_id]);
        if (vRes.rows.length > 0) {
          vehicle = vRes.rows[0];
        }
      } catch (err) {
        console.warn('[TelemetryService] Neon DB vehicle check failed:', err.message);
      }
    }

    if (!vehicle) {
      vehicle = activeStore.vehicles.find((v) => v.id === data.vehicle_id);
    }

    if (!vehicle) {
      const error = new Error(`Cannot submit telemetry: Vehicle '${data.vehicle_id}' does not exist.`);
      error.statusCode = 404;
      error.code = 'VEHICLE_NOT_FOUND';
      throw error;
    }

    const id = crypto.randomUUID();
    const recordedAt = data.recorded_at || new Date().toISOString();
    const postgisPointString = `POINT(${data.longitude} ${data.latitude})`;

    let record = {
      id,
      vehicle_id: data.vehicle_id,
      speed: data.speed,
      fuel_level: data.fuel_level ?? null,
      battery_level: data.battery_level ?? null,
      engine_temp: data.engine_temp ?? 90.0,
      latitude: data.latitude,
      longitude: data.longitude,
      location: postgisPointString,
      odometer: data.odometer,
      recorded_at: recordedAt,
      created_at: new Date().toISOString()
    };

    // Check for critical operational alerts (Engine fault, Low battery, Emergency stop, Overspeed)
    let criticalNotification = null;
    let criticalEventType = null;
    let criticalDescription = null;

    if (data.emergency_stop === true || data.event_type === 'EMERGENCY_STOP') {
      criticalEventType = 'EMERGENCY_STOP';
      criticalDescription = `CRITICAL ALERT: Vehicle ${vehicle.registration_number} initiated EMERGENCY STOP at coordinates (${data.latitude}, ${data.longitude}).`;
    } else if (data.engine_fault === true || data.event_type === 'ENGINE_FAULT' || data.engine_temp > 105) {
      criticalEventType = data.engine_temp > 105 ? 'ENGINE_OVERHEAT' : 'ENGINE_FAULT';
      criticalDescription = `CRITICAL ALERT: Vehicle ${vehicle.registration_number} reported ENGINE FAULT (Temperature: ${data.engine_temp}°C).`;
    } else if (data.event_type === 'LOW_BATTERY' || (data.battery_level != null && data.battery_level < 15)) {
      criticalEventType = 'LOW_BATTERY';
      criticalDescription = `CRITICAL ALERT: Vehicle ${vehicle.registration_number} reported LOW BATTERY warning at ${data.battery_level}%.`;
    } else if (data.speed > 120 || data.event_type === 'OVERSPEED_WARNING') {
      criticalEventType = 'OVERSPEED_WARNING';
      criticalDescription = `CRITICAL ALERT: Vehicle ${vehicle.registration_number} recorded excessive speed of ${data.speed} km/h.`;
    }

    if (criticalEventType) {
      const eventId = crypto.randomUUID();

      if (pool) {
        try {
          await query(
            `INSERT INTO vehicle_events (id, vehicle_id, event_type, severity, description, metadata)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              eventId,
              data.vehicle_id,
              criticalEventType,
              'critical',
              criticalDescription,
              JSON.stringify({
                speed: data.speed,
                engine_temp: data.engine_temp,
                battery_level: data.battery_level,
                latitude: data.latitude,
                longitude: data.longitude,
                event_type: criticalEventType
              })
            ]
          );
        } catch (err) {
          console.warn('[TelemetryService] Neon DB event insert failed:', err.message);
        }
      }

      const eventRecord = {
        id: eventId,
        vehicle_id: data.vehicle_id,
        event_type: criticalEventType,
        severity: 'critical',
        description: criticalDescription,
        metadata: {
          speed: data.speed,
          engine_temp: data.engine_temp,
          battery_level: data.battery_level,
          latitude: data.latitude,
          longitude: data.longitude,
          event_type: criticalEventType
        },
        created_at: new Date().toISOString()
      };
      activeStore.vehicle_events.unshift(eventRecord);

      criticalNotification = await mockSmsService.sendSms({
        recipient: '+14155557788',
        message: criticalDescription,
        eventId
      });
    }

    // Insert telemetry into Neon PostgreSQL
    if (pool) {
      try {
        const res = await query(
          `INSERT INTO telemetry (id, vehicle_id, speed, fuel_level, battery_level, engine_temp, latitude, longitude, odometer, recorded_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            id,
            data.vehicle_id,
            data.speed,
            data.fuel_level ?? null,
            data.battery_level ?? null,
            data.engine_temp ?? 90.0,
            data.latitude,
            data.longitude,
            data.odometer,
            recordedAt
          ]
        );
        if (res.rows.length > 0) {
          record = res.rows[0];
          record.speed = parseFloat(record.speed);
          record.latitude = parseFloat(record.latitude);
          record.longitude = parseFloat(record.longitude);
          if (record.odometer != null) record.odometer = parseFloat(record.odometer);
          if (record.engine_temp != null) record.engine_temp = parseFloat(record.engine_temp);
          if (record.fuel_level != null) record.fuel_level = parseFloat(record.fuel_level);
          if (record.battery_level != null) record.battery_level = parseFloat(record.battery_level);
          record.location = postgisPointString; // standard representation
        }
      } catch (err) {
        console.warn('[TelemetryService] Neon DB insert failed, using fallback:', err.message);
      }
    }

    activeStore.telemetry.unshift(record);

    return {
      record,
      critical_alert: Boolean(criticalNotification),
      notification: criticalNotification
    };
  }

  async getTelemetryByVehicle(vehicleId, limit = 50) {
    if (pool) {
      try {
        const res = await query(
          'SELECT * FROM telemetry WHERE vehicle_id = $1 ORDER BY recorded_at DESC LIMIT $2',
          [vehicleId, limit]
        );
        return res.rows.map((t) => ({
          ...t,
          speed: parseFloat(t.speed),
          latitude: parseFloat(t.latitude),
          longitude: parseFloat(t.longitude),
          odometer: t.odometer != null ? parseFloat(t.odometer) : null,
          engine_temp: t.engine_temp != null ? parseFloat(t.engine_temp) : null,
          fuel_level: t.fuel_level != null ? parseFloat(t.fuel_level) : null,
          battery_level: t.battery_level != null ? parseFloat(t.battery_level) : null
        }));
      } catch (err) {
        console.warn('[TelemetryService] Neon DB query failed, using fallback:', err.message);
      }
    }

    return activeStore.telemetry
      .filter((t) => t.vehicle_id === vehicleId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, limit);
  }

  async getLatestTelemetryForAllVehicles() {
    if (pool) {
      try {
        const res = await query(
          'SELECT DISTINCT ON (vehicle_id) * FROM telemetry ORDER BY vehicle_id, recorded_at DESC'
        );
        return res.rows;
      } catch (err) {
        console.warn('[TelemetryService] Neon DB latest query failed, using fallback:', err.message);
      }
    }

    const latestMap = new Map();
    for (const t of activeStore.telemetry) {
      const existing = latestMap.get(t.vehicle_id);
      if (!existing || new Date(t.recorded_at) > new Date(existing.recorded_at)) {
        latestMap.set(t.vehicle_id, t);
      }
    }

    return Array.from(latestMap.values());
  }
}

export const telemetryService = new TelemetryService();
