import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Activity,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { fleetService } from '../services/fleetService';
import { Vehicle, NotificationRecord } from '../types/fleet';
import { formatDateTime } from '../lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vehiclesData, notifsData] = await Promise.all([
        fleetService.getVehicles(),
        fleetService.getNotifications({ limit: 5 })
      ]);
      setVehicles(vehiclesData);
      setNotifications(notifsData);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Failed to connect to backend through API Gateway. Ensure services are running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute live KPI metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;
  const inactiveVehicles = vehicles.filter((v) => v.status === 'inactive').length;

  // Chart data
  const statusChartData = [
    { name: 'Active', value: activeVehicles, color: '#10b981' },
    { name: 'Maintenance', value: maintenanceVehicles, color: '#f59e0b' },
    { name: 'Inactive', value: inactiveVehicles, color: '#64748b' }
  ];

  return (
    <DashboardLayout title="Fleet Overview & Live Metrics">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Fleet Telemetry</h2>
          <p className="text-sm text-slate-500">Live operational status and simulated SMS event dispatch</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={isLoading}
          className="gap-2 bg-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Error state alert */}
      {error && (
        <Alert variant="destructive" title="Connection Error">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={loadDashboardData} className="bg-white">
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Fleet</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalVehicles}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Registered vehicles</p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active In-Service</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{activeVehicles}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {totalVehicles > 0 ? `${Math.round((activeVehicles / totalVehicles) * 100)}% operational` : '0%'}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Maintenance</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{maintenanceVehicles}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Undergoing service</p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">SMS Dispatches</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{notifications.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Logged mock deliveries</p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Charts & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Fleet Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent SMS Notifications Feed */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Simulated SMS Dispatches</CardTitle>
                  <p className="text-xs text-slate-500">Persisted notification receipts and delivery states</p>
                </div>
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600">
                    <span>View All</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No notifications recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-900 leading-snug">{n.message}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>To: {n.recipient}</span>
                            <span>•</span>
                            <span>{formatDateTime(n.created_at)}</span>
                            {n.provider_response?.carrier && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-500">{n.provider_response.carrier}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={n.status === 'delivered' ? 'success' : n.status === 'failed' ? 'destructive' : 'warning'}
                          className="capitalize text-[10px] shrink-0"
                        >
                          {n.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Vehicle Inventory Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Fleet Vehicles In Transit</CardTitle>
                <p className="text-xs text-slate-500">Live coordinates and speed from latest telemetry intake</p>
              </div>
              <Link to="/vehicles">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <span>Manage Fleet</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Reg. Number</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Speed</th>
                      <th className="py-2.5 px-3">Battery / Fuel</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.slice(0, 5).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {v.make} {v.model} ({v.year})
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {v.registration_number}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-600">{v.type}</td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={
                              v.status === 'active'
                                ? 'success'
                                : v.status === 'maintenance'
                                ? 'warning'
                                : 'secondary'
                            }
                            className="capitalize text-[10px]"
                          >
                            {v.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {v.latest_telemetry ? `${v.latest_telemetry.speed} km/h` : '0 km/h'}
                        </td>
                        <td className="py-2.5 px-3">
                          {v.latest_telemetry?.battery_level != null ? (
                            <span className="text-emerald-600 font-medium">{v.latest_telemetry.battery_level}% Battery</span>
                          ) : v.latest_telemetry?.fuel_level != null ? (
                            <span className="text-blue-600 font-medium">{v.latest_telemetry.fuel_level}% Fuel</span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link to={`/vehicles/${v.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
