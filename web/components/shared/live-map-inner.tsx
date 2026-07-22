'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { LocationUpdate } from '@/types/api.types';
import { autoIcon } from './map-icons';
import { MapRecenter } from './map-recenter';

export default function LiveMapInner({
  locations,
  center,
  fallbackCenter,
  fallbackLabel,
  recenter = true,
}: {
  locations: LocationUpdate[];
  center: [number, number];
  fallbackCenter?: [number, number];
  fallbackLabel?: string;
  recenter?: boolean;
}) {
  const hasLive = locations.length > 0;
  const mapCenter = hasLive ? [locations[0].lat, locations[0].lng] as [number, number] : center;

  return (
    <MapContainer center={mapCenter} zoom={13} className="h-[400px] w-full rounded-xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {recenter && hasLive && (
        <MapRecenter center={[locations[0].lat, locations[0].lng]} />
      )}
      {locations.map((loc) => (
        <Marker key={loc.vehicleId} position={[loc.lat, loc.lng]} icon={autoIcon}>
          <Popup>
            Vehicle: {loc.vehicleId}
            {loc.speed != null && <div>Speed: {loc.speed} km/h</div>}
          </Popup>
        </Marker>
      ))}
      {!hasLive && fallbackCenter && (
        <Marker position={fallbackCenter} icon={autoIcon}>
          <Popup>{fallbackLabel ?? 'Pickup point'}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
