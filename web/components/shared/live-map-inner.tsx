'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { LocationUpdate } from '@/types/api.types';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LiveMapInner({
  locations,
  center,
}: {
  locations: LocationUpdate[];
  center: [number, number];
}) {
  return (
    <MapContainer center={center} zoom={13} className="h-[400px] w-full rounded-xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc) => (
        <Marker key={loc.vehicleId} position={[loc.lat, loc.lng]} icon={icon}>
          <Popup>
            Vehicle: {loc.vehicleId}
            {loc.speed != null && <div>Speed: {loc.speed} km/h</div>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
