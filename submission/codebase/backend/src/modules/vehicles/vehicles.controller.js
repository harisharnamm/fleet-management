import { vehiclesService } from './vehicles.service.js';
import { successResponse } from '../../utils/response.js';

export async function listVehiclesController(req, res, next) {
  try {
    const { status, type, search } = req.query;
    const vehicles = await vehiclesService.listVehicles({ status, type, search });
    return successResponse(res, vehicles, 200, 'Vehicles retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getVehicleController(req, res, next) {
  try {
    const vehicle = await vehiclesService.getVehicleById(req.params.id);
    return successResponse(res, vehicle, 200, 'Vehicle details retrieved');
  } catch (err) {
    next(err);
  }
}

export async function createVehicleController(req, res, next) {
  try {
    const newVehicle = await vehiclesService.createVehicle(req.body);
    return successResponse(res, newVehicle, 201, 'Vehicle registered successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleController(req, res, next) {
  try {
    const result = await vehiclesService.updateVehicle(req.params.id, req.body);
    return successResponse(res, result, 200, 'Vehicle updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleController(req, res, next) {
  try {
    const deleted = await vehiclesService.deleteVehicle(req.params.id);
    return successResponse(res, deleted, 200, 'Vehicle deleted successfully');
  } catch (err) {
    next(err);
  }
}
