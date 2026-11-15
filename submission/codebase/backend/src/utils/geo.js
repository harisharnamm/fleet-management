/**
 * Geodesic Distance Utilities
 * Calculates accurate great-circle distance between two GPS coordinates in metres
 * Using standard WGS84 spherical radius (6,371,000 m), mirroring PostGIS ST_Distance(geography, geography)
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in metres
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Validates latitude and longitude boundaries
 */
export function isValidCoordinate(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    longitude >= -180 &&
    longitude <= 180
  );
}
