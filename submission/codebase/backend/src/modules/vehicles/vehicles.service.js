import crypto from 'crypto';
import { query, pool } from '../../config/db.js';
import { activeStore } from '../../config/seedStore.js';
import { mockSmsService } from '../notifications/mockSms.service.js';

class VehiclesService {
  async listVehicles({ status, type, search } = {}) {
    if (pool) {
      try {
        let sql = `
          SELECT
            v.*,
            (
              SELECT json_build_object(
                'id', t.id,
                'vehicle_id', t.vehicle_id,
                'speed', t.speed,
                'fuel_level', t.fuel_level,
                'battery_level', t.battery_level,
                'engine_temp', t.engine_temp,
                'latitude', t.latitude,
                'longitude', t.longitude,
                'odometer', t.odometer,
                'recorded_at', t.recorded_at
              )
              FROM telemetry t
              WHERE t.vehicle_id = v.id
              ORDER BY t.recorded_at DESC
              LIMIT 1
            ) AS latest_telemetry
          FROM vehicles v
          WHERE 1=1
        `;
        const params = [];

        if (status) {
          params.push(status);
          sql += ` AND v.status = $${params.length}`;
        }
        if (type) {
          params.push(type);
          sql += ` AND v.type = $${params.length}`;
        }
        if (search) {
          params.push(`%${search.toLowerCase()}%`);
          sql += ` AND (
            LOWER(v.registration_number) LIKE $${params.length} OR
            LOWER(v.make) LIKE $${params.length} OR
            LOWER(v.model) LIKE $${params.length} OR
            LOWER(v.vin) LIKE $${params.length}
          )`;
        }

        sql += ' ORDER BY v.created_at DESC';

        const res = await query(sql, params);
        return res.rows;
      } catch (err) {
        console.warn('[VehiclesService] Neon DB list failed, using fallback:', err.message);
      }
    }

    let vehicles = [...activeStore.vehicles];

    if (status) {
      vehicles = vehicles.filter((v) => v.status === status);
    }
    if (type) {
      vehicles = vehicles.filter((v) => v.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      vehicles = vehicles.filter(
        (v) =>
          v.registration_number.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q)
      );
    }

    return vehicles.map((v) => {
      const latestTelemetry = activeStore.telemetry
        .filter((t) => t.vehicle_id === v.id)
        .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0] || null;

      return {
        ...v,
        latest_telemetry: latestTelemetry
      };
    });
  }

  async getVehicleById(id) {
    if (pool) {
      try {
        const vRes = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (vRes.rows.length === 0) {
          const error = new Error(`Vehicle with ID '${id}' not found.`);
          error.statusCode = 404;
          error.code = 'VEHICLE_NOT_FOUND';
          throw error;
        }

        const vehicle = vRes.rows[0];

        const tRes = await query(
          'SELECT * FROM telemetry WHERE vehicle_id = $1 ORDER BY recorded_at DESC LIMIT 1',
          [id]
        );
        const latestTelemetry = tRes.rows.length > 0 ? tRes.rows[0] : null;

        const eRes = await query(
          'SELECT * FROM vehicle_events WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 20',
          [id]
        );

        return {
          ...vehicle,
          latest_telemetry: latestTelemetry,
          recent_events: eRes.rows
        };
      } catch (err) {
        if (err.statusCode === 404) throw err;
        console.warn('[VehiclesService] Neon DB getById failed, using fallback:', err.message);
      }
    }

    const vehicle = activeStore.vehicles.find((v) => v.id === id);
    if (!vehicle) {
      const error = new Error(`Vehicle with ID '${id}' not found.`);
      error.statusCode = 404;
      error.code = 'VEHICLE_NOT_FOUND';
      throw error;
    }

    const latestTelemetry = activeStore.telemetry
      .filter((t) => t.vehicle_id === id)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0] || null;

    const events = activeStore.vehicle_events
      .filter((e) => e.vehicle_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      ...vehicle,
      latest_telemetry: latestTelemetry,
      recent_events: events
    };
  }

  async createVehicle(data) {
    const regNum = data.registration_number.toUpperCase();
    const vinNum = data.vin.toUpperCase();

    if (pool) {
      try {
        const regCheck = await query('SELECT id FROM vehicles WHERE registration_number = $1', [regNum]);
        if (regCheck.rows.length > 0) {
          const error = new Error(`Registration number '${regNum}' is already registered.`);
          error.statusCode = 409;
          error.code = 'DUPLICATE_REGISTRATION_NUMBER';
          throw error;
        }

        const vinCheck = await query('SELECT id FROM vehicles WHERE vin = $1', [vinNum]);
        if (vinCheck.rows.length > 0) {
          const error = new Error(`VIN '${vinNum}' is already registered.`);
          error.statusCode = 409;
          error.code = 'DUPLICATE_VIN';
          throw error;
        }

        const id = crypto.randomUUID();
        const res = await query(
          `INSERT INTO vehicles (id, vin, registration_number, make, model, year, status, type, assigned_driver_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [id, vinNum, regNum, data.make, data.model, data.year, data.status || 'active', data.type || 'truck', data.assigned_driver_id || null]
        );

        if (res.rows.length > 0) {
          activeStore.vehicles.unshift(res.rows[0]);
          return res.rows[0];
        }
      } catch (err) {
        if (err.statusCode === 409) throw err;
        console.warn('[VehiclesService] Neon DB create failed, using fallback:', err.message);
      }
    }

    const regExists = activeStore.vehicles.some((v) => v.registration_number.toUpperCase() === regNum);
    if (regExists) {
      const error = new Error(`Registration number '${regNum}' is already registered.`);
      error.statusCode = 409;
      error.code = 'DUPLICATE_REGISTRATION_NUMBER';
      throw error;
    }

    const vinExists = activeStore.vehicles.some((v) => v.vin.toUpperCase() === vinNum);
    if (vinExists) {
      const error = new Error(`VIN '${vinNum}' is already registered.`);
      error.statusCode = 409;
      error.code = 'DUPLICATE_VIN';
      throw error;
    }

    const newVehicle = {
      id: crypto.randomUUID(),
      vin: vinNum,
      registration_number: regNum,
      make: data.make,
      model: data.model,
      year: data.year,
      status: data.status || 'active',
      type: data.type || 'truck',
      assigned_driver_id: data.assigned_driver_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    activeStore.vehicles.unshift(newVehicle);
    return newVehicle;
  }

  async updateVehicle(id, updates) {
    let vehicle = null;
    let oldStatus = null;

    if (pool) {
      try {
        const vRes = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (vRes.rows.length === 0) {
          const error = new Error(`Vehicle with ID '${id}' not found.`);
          error.statusCode = 404;
          error.code = 'VEHICLE_NOT_FOUND';
          throw error;
        }
        vehicle = vRes.rows[0];
        oldStatus = vehicle.status;
      } catch (err) {
        if (err.statusCode === 404) throw err;
        console.warn('[VehiclesService] Neon DB check failed:', err.message);
      }
    }

    if (!vehicle) {
      vehicle = activeStore.vehicles.find((v) => v.id === id);
      if (!vehicle) {
        const error = new Error(`Vehicle with ID '${id}' not found.`);
        error.statusCode = 404;
        error.code = 'VEHICLE_NOT_FOUND';
        throw error;
      }
      oldStatus = vehicle.status;
    }

    const isStatusChanged = updates.status && updates.status !== oldStatus;

    // Apply updates in Neon
    if (pool) {
      try {
        const setClauses = [];
        const params = [id];
        let pIndex = 2;

        for (const [key, val] of Object.entries(updates)) {
          setClauses.push(`${key} = $${pIndex}`);
          params.push(val);
          pIndex++;
        }
        setClauses.push(`updated_at = NOW()`);

        const sql = `UPDATE vehicles SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
        const res = await query(sql, params);
        if (res.rows.length > 0) {
          vehicle = res.rows[0];
        }
      } catch (err) {
        console.warn('[VehiclesService] Neon DB update failed:', err.message);
      }
    } else {
      Object.assign(vehicle, updates);
      vehicle.updated_at = new Date().toISOString();
    }

    // Trigger Notification on status change
    let generatedNotification = null;
    if (isStatusChanged) {
      const severity = updates.status === 'maintenance' ? 'high' : 'medium';
      const eventId = crypto.randomUUID();
      const description = `Vehicle ${vehicle.registration_number} status changed from ${oldStatus} to ${updates.status}.`;

      if (pool) {
        try {
          await query(
            `INSERT INTO vehicle_events (id, vehicle_id, event_type, severity, description, metadata)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [eventId, id, 'STATUS_CHANGE', severity, description, JSON.stringify({ old_status: oldStatus, new_status: updates.status })]
          );
        } catch (err) {
          console.warn('[VehiclesService] Neon DB event insert failed:', err.message);
        }
      }

      const eventRecord = {
        id: eventId,
        vehicle_id: id,
        event_type: 'STATUS_CHANGE',
        severity,
        description,
        metadata: { old_status: oldStatus, new_status: updates.status },
        created_at: new Date().toISOString()
      };
      activeStore.vehicle_events.unshift(eventRecord);

      generatedNotification = await mockSmsService.sendSms({
        recipient: '+14155554321',
        message: `FLEET ALERT: Vehicle ${vehicle.registration_number} status changed to ${updates.status.toUpperCase()}.`,
        eventId
      });
    }

    return {
      vehicle,
      notification_triggered: Boolean(generatedNotification),
      notification: generatedNotification
    };
  }

  async deleteVehicle(id) {
    if (pool) {
      try {
        const res = await query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.warn('[VehiclesService] Neon DB delete failed:', err.message);
      }
    }

    const index = activeStore.vehicles.findIndex((v) => v.id === id);
    if (index === -1) {
      const error = new Error(`Vehicle with ID '${id}' not found.`);
      error.statusCode = 404;
      error.code = 'VEHICLE_NOT_FOUND';
      throw error;
    }

    const removed = activeStore.vehicles.splice(index, 1)[0];
    activeStore.telemetry = activeStore.telemetry.filter((t) => t.vehicle_id !== id);
    activeStore.vehicle_events = activeStore.vehicle_events.filter((e) => e.vehicle_id !== id);

    return removed;
  }
}

export const vehiclesService = new VehiclesService();
