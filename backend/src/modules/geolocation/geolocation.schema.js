import { z } from 'zod';

export const nearbySearchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radius: z.coerce.number().positive('Radius must be a positive number in metres')
});

export const geocodeAddressSchema = z.object({
  address: z.string().min(1, 'Address is required for geocoding').max(255)
});
