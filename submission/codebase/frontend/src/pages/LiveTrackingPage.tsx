import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Radar,
  RefreshCw,
  Compass,
  AlertCircle,
  Truck
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { fleetService } from '../services/fleetService';
import { NearbyVehicle } from '../types/fleet';

// Custom clean Leaflet SVG icons for map pins
const createCustomIcon = (status: string) => {
  const color = status === 'active' ? '#10b981' : status === 'maintenance' ? '#f59e0b' : '#64748b';
  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export function LiveTrackingPage() {
  const [positions, setPositions] = useState<NearbyVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proximity Radius Search controls
  const [centerLat, setCenterLat] = useState<number>(37.7749);
  const [centerLng, setCenterLng] = useState<number>(-122.4194);
  const [radiusMeters, setRadiusMeters] = useState<number>(5000);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [nearbyVehicles, setNearbyVehicles] = useState<NearbyVehicle[] | null>(null);

  // Address Geocoding controls
  const [addressInput, setAddressInput] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodedLabel, setGeocodedLabel] = useState<string | null>(null);

  const fetchPositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fleetService.getFleetPositions();
      setPositions(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load vehicle GPS coordinates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleGeocode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    setIsGeocoding(true);
    setError(null);
    try {
      const res = await fleetService.geocodeAddress(addressInput);
      setCenterLat(res.latitude);
      setCenterLng(res.longitude);
      setGeocodedLabel(res.display_name);
      const nearbyRes = await fleetService.getNearbyVehicles(res.latitude, res.longitude, radiusMeters);
      setNearbyVehicles(nearbyRes.vehicles);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to geocode address.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearchNearby = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingNearby(true);
    setError(null);

    try {
      const res = await fleetService.getNearbyVehicles(centerLat, centerLng, radiusMeters);
      setNearbyVehicles(res.vehicles);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to execute radius search.');
    } finally {
      setIsSearchingNearby(false);
    }
  };

  const handleResetSearch = () => {
    setNearbyVehicles(null);
    setRadiusMeters(5000);
    setGeocodedLabel(null);
    setAddressInput('');
  };

  return (
    <DashboardLayout title="Live Fleet Telemetry & Geolocation">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Geospatial Operations Map</h2>
          <p className="text-sm text-slate-500">
            OpenStreetMap live vehicle tracking with PostGIS ST_DWithin radius filtering
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPositions} disabled={isLoading} className="gap-2 bg-white">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh GPS Fixes</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" title="Map Service Error">
          {error}
        </Alert>
      )}

      {/* Proximity Radius Search Control Box */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base font-semibold">PostGIS Proximity Radius Search</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Executes geospatial search on the backend using ST_DWithin and ST_Distance, returning distances in metres.
          </p>
        </CardHeader>
        <CardContent>
          {/* Address Geocoding Search */}
          <form onSubmit={handleGeocode} className="mb-4 pb-4 border-b border-slate-100 flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Geocode depot address or city (e.g., 'San Francisco Fleet Depot', 'Port of Oakland', 'Market St Terminal')"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isGeocoding || !addressInput.trim()}
              className="gap-1.5 whitespace-nowrap"
            >
              <Compass className={`h-3.5 w-3.5 ${isGeocoding ? 'animate-spin' : ''}`} />
              <span>{isGeocoding ? 'Geocoding...' : 'Geocode & Center'}</span>
            </Button>
          </form>

          {geocodedLabel && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center justify-between">
              <span><strong>Geocoded:</strong> {geocodedLabel}</span>
              <span className="font-mono text-[11px] text-blue-600">({centerLat.toFixed(4)}, {centerLng.toFixed(4)})</span>
            </div>
          )}

          <form onSubmit={handleSearchNearby} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-slate-700">Center Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={centerLat}
                onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Center Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={centerLng}
                onChange={(e) => setCenterLng(parseFloat(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Radius (metres)</label>
              <Input
                type="number"
                min="100"
                max="100000"
                step="500"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSearchingNearby} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white gap-1.5">
                <Search className="h-4 w-4" />
                <span>{isSearchingNearby ? 'Searching...' : 'Scan Radius'}</span>
              </Button>
              {nearbyVehicles !== null && (
                <Button type="button" variant="outline" onClick={handleResetSearch}>
                  Reset
                </Button>
              )}
            </div>
            <div className="text-xs text-slate-500 pb-2">
              {nearbyVehicles !== null ? (
                <span className="font-semibold text-emerald-600">
                  {nearbyVehicles.length} vehicle(s) within {(radiusMeters / 1000).toFixed(1)} km
                </span>
              ) : (
                <span>Map displays all active fleet beacons</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border-slate-200">
          <div className="h-[520px] w-full relative z-0">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <MapContainer
                center={[centerLat, centerLng]}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Visual Circle showing PostGIS search boundary */}
                {nearbyVehicles !== null && (
                  <Circle
                    center={[centerLat, centerLng]}
                    radius={radiusMeters}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.15,
                      weight: 2,
                      dashArray: '4, 6'
                    }}
                  />
                )}

                {/* Vehicle Markers */}
                {positions.map((v) => {
                  if (v.latitude == null || v.longitude == null) return null;
                  return (
                    <Marker
                      key={v.vehicle_id}
                      position={[v.latitude, v.longitude]}
                      icon={createCustomIcon(v.status)}
                    >
                      <Popup>
                        <div className="p-1 space-y-1 text-xs">
                          <p className="font-bold text-sm text-slate-900 font-mono">{v.registration_number}</p>
                          <p className="text-slate-600 font-medium">{v.make} {v.model}</p>
                          <p className="text-slate-500">Status: <span className="font-semibold capitalize">{v.status}</span></p>
                          <p className="text-slate-500">Speed: <span className="font-mono font-semibold">{v.speed} km/h</span></p>
                          <p className="text-slate-400 font-mono text-[10px]">
                            {v.latitude.toFixed(5)}, {v.longitude.toFixed(5)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </Card>

        {/* Nearby Vehicles List Panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold">
              {nearbyVehicles !== null ? 'Radius Search Results' : 'Fleet Status Summary'}
            </CardTitle>
            <p className="text-xs text-slate-500">
              {nearbyVehicles !== null
                ? `Sorted closest to (${centerLat}, ${centerLng})`
                : 'Current fleet positions'}
            </p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[460px]">
            {nearbyVehicles !== null ? (
              nearbyVehicles.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No vehicles detected within {radiusMeters} metres.
                </div>
              ) : (
                nearbyVehicles.map((v) => (
                  <div
                    key={v.vehicle_id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-slate-900">{v.registration_number}</span>
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                        {v.distance_meters.toLocaleString()} m away
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{v.make} {v.model}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Speed: {v.speed} km/h</span>
                      <span className="capitalize">{v.status}</span>
                    </div>
                  </div>
                ))
              )
            ) : (
              positions.map((v) => (
                <div
                  key={v.vehicle_id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-slate-900">{v.registration_number}</span>
                    <Badge
                      variant={v.status === 'active' ? 'success' : v.status === 'maintenance' ? 'warning' : 'secondary'}
                      className="text-[10px] capitalize"
                    >
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{v.make} {v.model}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {v.latitude != null ? `${v.latitude.toFixed(4)}, ${v.longitude?.toFixed(4)}` : 'No fix'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
