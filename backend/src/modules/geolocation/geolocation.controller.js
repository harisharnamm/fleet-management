import { geolocationService } from './geolocation.service.js';
import { successResponse } from '../../utils/response.js';

export async function findNearbyController(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;
    const vehicles = await geolocationService.findVehiclesWithinRadius(lat, lng, radius);
    return successResponse(
      res,
      {
        center: { latitude: lat, longitude: lng },
        radius_meters: radius,
        count: vehicles.length,
        vehicles
      },
      200,
      'Nearby vehicles retrieved'
    );
  } catch (err) {
    next(err);
  }
}

export async function getPositionsController(req, res, next) {
  try {
    const positions = await geolocationService.getAllPositions();
    return successResponse(res, positions, 200, 'Fleet positions retrieved');
  } catch (err) {
    next(err);
  }
}

export async function geocodeAddressController(req, res, next) {
  try {
    const { address } = req.query;
    const result = await geolocationService.geocodeAddress(address);
    return successResponse(res, result, 200, 'Address geocoded successfully');
  } catch (err) {
    next(err);
  }
}
