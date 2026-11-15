import { z } from 'zod';

export const telemetrySubmissionSchema = z.object({
  vehicle_id: z.string().uuid('Valid vehicle UUID required'),
  speed: z.number().min(0, 'Speed must be non-negative'),
  fuel_level: z.number().min(0).max(100).nullable().optional(),
  battery_level: z.number().min(0).max(100).nullable().optional(),
  engine_temp: z.number().default(90.0),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  odometer: z.number().min(0, 'Odometer must be non-negative'),
  recorded_at: z.string().datetime().optional(),
  event_type: z.enum(['NORMAL', 'ENGINE_FAULT', 'LOW_BATTERY', 'EMERGENCY_STOP', 'OVERSPEED_WARNING', 'ENGINE_OVERHEAT']).optional(),
  emergency_stop: z.boolean().optional(),
  engine_fault: z.boolean().optional()
});
