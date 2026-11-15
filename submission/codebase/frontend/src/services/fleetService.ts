import { apiClient } from './api';
import { Vehicle, NotificationRecord, NearbyVehicle, User } from '../types/fleet';

export const fleetService = {
  // Auth
  async login(email: string, password: string):Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  // Vehicles
  async getVehicles(params?: { status?: string; type?: string; search?: string }): Promise<Vehicle[]> {
    const res = await apiClient.get('/vehicles', { params });
    return res.data.data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const res = await apiClient.get(`/vehicles/${id}`);
    return res.data.data;
  },

  async createVehicle(payload: Partial<Vehicle>): Promise<Vehicle> {
    const res = await apiClient.post('/vehicles', payload);
    return res.data.data;
  },

  async updateVehicle(id: string, payload: Partial<Vehicle>): Promise<{ vehicle: Vehicle; notification_triggered: boolean }> {
    const res = await apiClient.patch(`/vehicles/${id}`, payload);
    return res.data.data;
  },

  async deleteVehicle(id: string): Promise<Vehicle> {
    const res = await apiClient.delete(`/vehicles/${id}`);
    return res.data.data;
  },

  // Geolocation & Maps
  async getNearbyVehicles(lat: number, lng: number, radius: number): Promise<{ count: number; vehicles: NearbyVehicle[] }> {
    const res = await apiClient.get('/maps/nearby', {
      params: { lat, lng, radius }
    });
    return res.data.data;
  },

  async getFleetPositions(): Promise<NearbyVehicle[]> {
    const res = await apiClient.get('/maps/positions');
    return res.data.data;
  },

  async geocodeAddress(address: string): Promise<{ address: string; latitude: number; longitude: number; display_name: string; source: string }> {
    const res = await apiClient.get('/maps/geocode', {
      params: { address }
    });
    return res.data.data;
  },

  // Notifications
  async getNotifications(params?: { limit?: number; status?: string }): Promise<NotificationRecord[]> {
    const res = await apiClient.get('/notifications', { params });
    return res.data.data;
  },

  async simulateSms(payload: { recipient: string; message: string; simulateFailure?: boolean }): Promise<NotificationRecord> {
    const res = await apiClient.post('/notifications/simulate', payload);
    return res.data.data;
  }
};
