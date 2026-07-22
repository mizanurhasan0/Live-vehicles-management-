export type LocationPayload = {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  source?: string;
  vehicleId: string;
  tripId: string;
  madrasaId: string;
  driverId?: string;
};

export interface TrackingSource {
  ingest(payload: LocationPayload): Promise<void>;
}
