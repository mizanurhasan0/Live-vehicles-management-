import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Button, Card } from '@/components/ui';
import { useLogout } from '@/hooks/useAppData';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/lib/theme';

export default function DriverProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const logout = useLogout();

  return (
    <Screen title={t('mobile.profile')}>
      <Card style={styles.gap}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.row}>{t('driver.phone')}: {user.phone}</Text>
        {user.driver?.licenseNo ? (
          <Text style={styles.row}>{t('driver.license')}: {user.driver.licenseNo}</Text>
        ) : null}
        {user.driver?.vehicle?.number ? (
          <Text style={styles.row}>
            {t('driver.assignedVehicle')}: {user.driver.vehicle.number}
          </Text>
        ) : null}
      </Card>
      <Button title={t('auth.logout')} variant="danger" loading={logout.isPending} onPress={() => logout.mutate()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 8 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  row: { color: colors.muted, fontSize: 15 },
});
