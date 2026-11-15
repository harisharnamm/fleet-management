export type UserRole = 'admin' | 'fleet_manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type VehicleStatus = 'active' | 'maintenance' | 'inactive';
export type VehicleType = 'truck' | 'van' | 'sedan' | 'suv' | 'electric';

export interface Telemetry {
  id: string;
  vehicle_id: string;
  speed: number;
  fuel_level?: number | null;
  battery_level?: number | null;
  engine_temp: number;
  latitude: number;
  longitude: number;
  location?: string;
  odometer: number;
  recorded_at: string;
}

export interface VehicleEvent {
  id: string;
  vehicle_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  type: VehicleType;
  assigned_driver_id?: string | null;
  created_at: string;
  updated_at: string;
  latest_telemetry?: Telemetry | null;
  recent_events?: VehicleEvent[];
}

export interface NotificationRecord {
  id: string;
  recipient: string;
  message: string;
  channel: 'sms' | 'email' | 'webhook';
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  event_id?: string | null;
  provider_response?: {
    mock_provider?: string;
    message_id?: string;
    carrier?: string;
    latency_ms?: number;
    status_code?: string;
    error_reason?: string | null;
  };
  sent_at?: string | null;
  created_at: string;
}

export interface NearbyVehicle {
  vehicle_id: string;
  registration_number: string;
  make: string;
  model: string;
  status: VehicleStatus;
  type: VehicleType;
  latitude: number;
  longitude: number;
  speed: number;
  fuel_level?: number | null;
  battery_level?: number | null;
  distance_meters: number;
  recorded_at: string;
}
