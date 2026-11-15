import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { fleetService } from '../services/fleetService';
import { Vehicle, VehicleStatus, VehicleType } from '../types/fleet';

export function VehiclesPage() {
  const { isAdmin, isFleetManager } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Register Dialog State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active' as VehicleStatus,
    type: 'truck' as VehicleType
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fleetService.getVehicles({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined
      });
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch vehicles from Gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      await fleetService.createVehicle(formData);
      setShowAddModal(false);
      setFormData({
        registration_number: '',
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'active',
        type: 'truck'
      });
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to register vehicle.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string, reg: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete vehicle ${reg}?`)) {
      return;
    }
    try {
      await fleetService.deleteVehicle(id);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete vehicle.');
    }
  };

  return (
    <DashboardLayout title="Vehicle Inventory Management">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Vehicle Registry</h2>
          <p className="text-sm text-slate-500">Manage vehicle records, hardware VINs, and live operational status</p>
        </div>
        {isFleetManager && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Register Vehicle</span>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" title="Error Loading Vehicles">
          {error}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by registration number, make, model, or VIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full md:w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Vehicle Types</option>
                <option value="truck">Heavy Truck</option>
                <option value="van">Cargo Van</option>
                <option value="electric">Electric Vehicle</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
              </Select>
            </div>
            <Button type="submit" variant="secondary" className="gap-2 shrink-0">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
                fetchVehicles();
              }}
              className="shrink-0"
            >
              Reset
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Registered Vehicles ({vehicles.length})</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchVehicles} disabled={isLoading} className="gap-1 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No vehicles found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or register a new vehicle.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Registration</th>
                    <th className="py-3 px-3">Make & Model</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Latest Speed</th>
                    <th className="py-3 px-3">Telemetry Location</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{v.registration_number}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {v.make} {v.model}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{v.year}</td>
                      <td className="py-3 px-3 capitalize text-slate-600">{v.type}</td>
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3 font-mono">
                        {v.latest_telemetry ? `${v.latest_telemetry.speed} km/h` : '0 km/h'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {v.latest_telemetry ? (
                          `${v.latest_telemetry.latitude.toFixed(4)}, ${v.latest_telemetry.longitude.toFixed(4)}`
                        ) : (
                          <span className="text-slate-400 italic">No GPS fix</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <Link to={`/vehicles/${v.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span>Details</span>
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVehicle(v.id, v.registration_number)}
                            className="h-7 text-xs px-2"
                            title="Delete vehicle (Admin only)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Register New Fleet Vehicle</CardTitle>
              <p className="text-xs text-slate-500">Adds vehicle to database registry. Requires unique VIN and license plate.</p>
            </CardHeader>
            <form onSubmit={handleCreateVehicle}>
              <CardContent className="space-y-3.5">
                {formError && (
                  <Alert variant="destructive">
                    {formError}
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Registration Number *</label>
                    <Input
                      required
                      placeholder="e.g. FLT-999-TX"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">VIN (11-17 chars) *</label>
                    <Input
                      required
                      placeholder="e.g. 1FTFW1ED..."
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Make *</label>
                    <Input
                      required
                      placeholder="e.g. Ford, Freightliner"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Model *</label>
                    <Input
                      required
                      placeholder="e.g. F-150 Lightning"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Year</label>
                    <Input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Type</label>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    >
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="electric">Electric</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Status</label>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white">
                  {formSubmitting ? 'Registering...' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
