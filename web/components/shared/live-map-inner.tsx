'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { LocationUpdate } from '@/types/api.types';
import { MapRecenter } from './map-recenter';

const vehicleIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const pickupIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
        <Marker key={loc.vehicleId} position={[loc.lat, loc.lng]} icon={vehicleIcon}>
          <Popup>
            Vehicle: {loc.vehicleId}
            {loc.speed != null && <div>Speed: {loc.speed} km/h</div>}
          </Popup>
        </Marker>
      ))}
      {!hasLive && fallbackCenter && (
        <Marker position={fallbackCenter} icon={pickupIcon}>
          <Popup>{fallbackLabel ?? 'Pickup point'}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
