import { telemetryService } from './telemetry.service.js';
import { successResponse } from '../../utils/response.js';

export async function submitTelemetryController(req, res, next) {
  try {
    const result = await telemetryService.recordTelemetry(req.body);
    return successResponse(res, result, 201, 'Telemetry record accepted and persisted');
  } catch (err) {
    next(err);
  }
}

export async function getVehicleTelemetryController(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const records = await telemetryService.getTelemetryByVehicle(req.params.vehicleId, limit);
    return successResponse(res, records, 200, 'Telemetry history retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getLatestTelemetryController(req, res, next) {
  try {
    const records = await telemetryService.getLatestTelemetryForAllVehicles();
    return successResponse(res, records, 200, 'Latest fleet telemetry retrieved');
  } catch (err) {
    next(err);
  }
}
