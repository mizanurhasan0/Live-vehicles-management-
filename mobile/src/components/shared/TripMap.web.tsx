import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LocationUpdate } from '@/types/api.types';
import { colors } from '@/lib/theme';

type Props = {
  location?: LocationUpdate | null;
  fallback?: { lat: number; lng: number };
  height?: number;
};

/** Web fallback — react-native-maps is native-only. Use Expo Go on a device for maps. */
export function TripMap({ location, fallback, height = 280 }: Props) {
  const lat = location?.lat ?? fallback?.lat ?? 23.8103;
  const lng = location?.lng ?? fallback?.lng ?? 90.4125;
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <View style={[styles.wrap, { height }]}>
      <Text style={styles.title}>Map preview (web)</Text>
      <Text style={styles.coords}>
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </Text>
      <Text style={styles.hint}>Use Expo Go on iOS/Android for the in-app map.</Text>
      <Pressable onPress={() => void Linking.openURL(mapsUrl)} style={styles.link}>
        <Text style={styles.linkText}>Open in OpenStreetMap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ecfdf5',
    padding: 16,
    justifyContent: 'center',
    gap: 8,
  },
  title: { fontWeight: '700', fontSize: 16, color: colors.text },
  coords: { fontFamily: 'monospace', fontSize: 14, color: colors.primaryDark },
  hint: { fontSize: 13, color: colors.muted },
  link: { marginTop: 4 },
  linkText: { color: colors.primary, fontWeight: '600' },
});
