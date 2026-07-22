export type VehicleLocation = {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  vehicleId: string;
  tripId?: string;
  madrasaId?: string;
  driverId?: string;
  source?: string;
  updatedAt?: string;
  timestamp?: string;
};

export function isVehicleLocation(value: unknown): value is VehicleLocation {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.lat === 'number' &&
    typeof record.lng === 'number' &&
    typeof record.vehicleId === 'string'
  );
}

export function parseCachedLocation(raw: string): VehicleLocation | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isVehicleLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
