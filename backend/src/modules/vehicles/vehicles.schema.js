import { z } from 'zod';

export const createVehicleSchema = z.object({
  vin: z.string().min(11).max(17, 'VIN must be between 11 and 17 characters'),
  registration_number: z.string().min(3).max(50, 'Registration number must be 3-50 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
  type: z.enum(['truck', 'van', 'sedan', 'suv', 'electric']).default('truck'),
  assigned_driver_id: z.string().uuid().nullable().optional()
});

export const updateVehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  status: z.enum(['active', 'maintenance', 'inactive']).optional(),
  type: z.enum(['truck', 'van', 'sedan', 'suv', 'electric']).optional(),
  assigned_driver_id: z.string().uuid().nullable().optional()
});
