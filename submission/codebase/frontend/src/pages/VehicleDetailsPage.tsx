import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Gauge,
  BatteryCharging,
  Fuel,
  Thermometer,
  MapPin,
  Clock,
  ShieldAlert,
  Bell,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { fleetService } from '../services/fleetService';
import { Vehicle, VehicleStatus } from '../types/fleet';
import { formatDateTime } from '../lib/utils';

export function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isFleetManager } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status transition state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const fetchVehicleDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fleetService.getVehicleById(id);
      setVehicle(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load vehicle details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: VehicleStatus) => {
    if (!id || !vehicle || newStatus === vehicle.status) return;
    setUpdatingStatus(true);
    setStatusFeedback(null);

    try {
      const result = await fleetService.updateVehicle(id, { status: newStatus });
      setVehicle({ ...vehicle, status: newStatus });
      if (result.notification_triggered) {
        setStatusFeedback(`Vehicle status changed to ${newStatus.toUpperCase()}. Simulated SMS notification was automatically dispatched and recorded!`);
      } else {
        setStatusFeedback(`Vehicle status updated to ${newStatus}.`);
      }
      fetchVehicleDetails();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update vehicle status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DashboardLayout title="Vehicle Diagnostics & Telemetry">
      <div className="flex items-center justify-between">
        <Link to="/vehicles">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Inventory</span>
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={fetchVehicleDetails} disabled={isLoading} className="gap-1 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" title="Error Loading Vehicle">
          {error}
        </Alert>
      )}

      {statusFeedback && (
        <Alert variant="success" title="Operational Event Recorded">
          {statusFeedback}
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-28 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : !vehicle ? (
        <Card className="py-12 text-center">
          <p className="text-slate-500 text-sm">Vehicle details not available.</p>
        </Card>
      ) : (
        <>
          {/* Header Card */}
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Truck className="h-7 w-7 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                      {vehicle.registration_number}
                    </h2>
                    <Badge
                      variant={
                        vehicle.status === 'active'
                          ? 'success'
                          : vehicle.status === 'maintenance'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="capitalize text-xs font-semibold"
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {vehicle.make} {vehicle.model} • {vehicle.year} • <span className="capitalize">{vehicle.type}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">VIN: {vehicle.vin}</p>
                </div>
              </div>

              {/* Status Transition Control (triggers Notification) */}
              {isFleetManager && (
                <div className="w-full md:w-auto flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-medium text-slate-700 whitespace-nowrap">Change Status:</span>
                  <Select
                    value={vehicle.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as VehicleStatus)}
                    className="w-36 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance (Alert)</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Speed</p>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {vehicle.latest_telemetry ? `${vehicle.latest_telemetry.speed} km/h` : '0.0 km/h'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">GPS Doppler speed</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Gauge className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {vehicle.type === 'electric' ? 'Battery SoC' : 'Fuel Tank'}
                  </p>
                  <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                    {vehicle.latest_telemetry?.battery_level != null
                      ? `${vehicle.latest_telemetry.battery_level}%`
                      : vehicle.latest_telemetry?.fuel_level != null
                      ? `${vehicle.latest_telemetry.fuel_level}%`
                      : 'N/A'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Current energy level</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  {vehicle.type === 'electric' ? (
                    <BatteryCharging className="h-5 w-5" />
                  ) : (
                    <Fuel className="h-5 w-5" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Engine Temp</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${
                    (vehicle.latest_telemetry?.engine_temp || 0) > 100 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {vehicle.latest_telemetry ? `${vehicle.latest_telemetry.engine_temp}°C` : 'N/A'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Normal: 85°C - 95°C</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Thermometer className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Odometer</p>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {vehicle.latest_telemetry ? `${vehicle.latest_telemetry.odometer.toLocaleString()} km` : '0 km'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cumulative distance</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GPS Coordinates & Position */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Latest GPS Telemetry Fix</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.latest_telemetry ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">PostGIS Geography Point</p>
                      <p className="text-sm font-mono font-semibold text-slate-800">
                        {vehicle.latest_telemetry.latitude.toFixed(6)}, {vehicle.latest_telemetry.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Format Order</p>
                    <p className="text-xs font-mono text-slate-700">
                      POINT({vehicle.latest_telemetry.longitude.toFixed(4)} {vehicle.latest_telemetry.latitude.toFixed(4)})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Timestamp</p>
                    <p className="text-xs font-medium text-slate-700">
                      {formatDateTime(vehicle.latest_telemetry.recorded_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No GPS coordinates recorded yet for this vehicle.</p>
              )}
            </CardContent>
          </Card>

          {/* Incident and Event History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Incident & Status Event History</CardTitle>
            </CardHeader>
            <CardContent>
              {(!vehicle.recent_events || vehicle.recent_events.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">No incidents or critical events on record for this vehicle.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {vehicle.recent_events.map((evt) => (
                    <div key={evt.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 font-mono">{evt.event_type}</span>
                          <span className="text-[11px] text-slate-400">• {formatDateTime(evt.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-600">{evt.description}</p>
                      </div>
                      <Badge
                        variant={evt.severity === 'critical' ? 'destructive' : evt.severity === 'high' ? 'warning' : 'outline'}
                        className="uppercase text-[10px] shrink-0"
                      >
                        {evt.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
