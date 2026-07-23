import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import type { LocationUpdate } from '@/types/api.types';

type Props = {
  location?: LocationUpdate | null;
  fallback?: { lat: number; lng: number };
  height?: number;
};

export function TripMap({ location, fallback, height = 280 }: Props) {
  const lat = location?.lat ?? fallback?.lat ?? 23.8103;
  const lng = location?.lng ?? fallback?.lng ?? 90.4125;
  const region: Region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={[styles.wrap, { height }]}>
      <MapView style={StyleSheet.absoluteFill} region={region}>
        {(location || fallback) && (
          <Marker coordinate={{ latitude: lat, longitude: lng }} title="Vehicle" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e4e4e7' },
});
