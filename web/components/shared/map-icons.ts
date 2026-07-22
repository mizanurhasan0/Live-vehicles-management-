import L from 'leaflet';
import { resolveMediaUrl } from '@/lib/media-url';

export const autoIcon = L.icon({
  iconUrl: '/icons/auto.png',
  iconRetinaUrl: '/icons/auto@2x.png',
  iconSize: [48, 48],
  iconAnchor: [24, 36],
  popupAnchor: [0, -36],
});

export function createDriverMarkerIcon(photoUrl?: string | null) {
  const url = resolveMediaUrl(photoUrl);
  if (!url) return autoIcon;

  return L.icon({
    iconUrl: url,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
    className: 'driver-photo-marker',
  });
}
