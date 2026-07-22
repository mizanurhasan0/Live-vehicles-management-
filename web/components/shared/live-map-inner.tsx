'use client';

import { memo, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { DriverMarkerDetails } from './driver-marker-details';
import { autoIcon, createDriverMarkerIcon } from './map-icons';
import { MapRecenter } from './map-recenter';
import { MapFitBounds } from './map-fit-bounds';
import { MapInvalidateSize } from './map-invalidate-size';
import type { MapMarkerInfo } from '@/types/api.types';

const MapMarker = memo(function MapMarker({ marker }: { marker: MapMarkerInfo }) {
  const { location } = marker;
  const icon = useMemo(
    () => createDriverMarkerIcon(marker.driver?.photoUrl),
    [marker.driver?.photoUrl],
  );
  const hasDetails = !!(marker.driver?.name || marker.vehicle?.number);

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={icon}
      zIndexOffset={1000}
    >
      {hasDetails && (
        <>
          <Tooltip direction="top" offset={[0, -40]} opacity={1} className="driver-tooltip">
            <DriverMarkerDetails marker={marker} />
          </Tooltip>
          <Popup>
            <DriverMarkerDetails marker={marker} />
          </Popup>
        </>
      )}
      {!hasDetails && (
        <Popup>
          Vehicle: {location.vehicleId}
          {location.speed != null && (
            <div>Speed: {Math.round(location.speed * 3.6)} km/h</div>
          )}
        </Popup>
      )}
    </Marker>
  );
});

export default function LiveMapInner({
  markers,
  center,
  fallbackCenter,
  fallbackLabel,
  recenter = true,
  recenterMode = 'follow',
  mapClassName = 'h-[400px]',
}: {
  markers: MapMarkerInfo[];
  center: [number, number];
  fallbackCenter?: [number, number];
  fallbackLabel?: string;
  recenter?: boolean;
  recenterMode?: 'once' | 'follow' | 'off';
  mapClassName?: string;
}) {
  const hasLive = markers.length > 0;
  const markerPoints = markers.map(
    (m) => [m.location.lat, m.location.lng] as [number, number],
  );
  const mapCenter = hasLive ? markerPoints[0] : center;

  return (
    <MapContainer center={mapCenter} zoom={13} className={`w-full rounded-xl ${mapClassName}`}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapInvalidateSize />
      {recenter && hasLive && recenterMode === 'follow' && (
        <MapRecenter
          center={markerPoints[0]}
          mode={recenterMode}
        />
      )}
      {hasLive && recenterMode === 'once' && (
        <MapFitBounds points={markerPoints} />
      )}
      {markers.map((marker) => (
        <MapMarker
          key={`${marker.location.vehicleId}-${marker.driver?.photoUrl ?? 'auto'}`}
          marker={marker}
        />
      ))}
      {!hasLive && fallbackCenter && (
        <Marker position={fallbackCenter} icon={autoIcon}>
          <Popup>{fallbackLabel ?? 'Pickup point'}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
