import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Button, Card } from '@/components/ui';
import { useLogout } from '@/hooks/useAppData';
import { useAuthStore } from '@/stores/auth.store';
import { toggleLanguage } from '@/i18n';
import { colors } from '@/lib/theme';

export default function GuardianProfileScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const logout = useLogout();

  return (
    <Screen title={t('mobile.profile')}>
      <Card style={styles.gap}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.row}>{user.phone}</Text>
        {user.guardian?.id ? (
          <Text style={styles.row}>ID: {user.guardian.id.slice(0, 8)}…</Text>
        ) : null}
      </Card>
      <Button
        title={`${t('common.language')}: ${i18n.language === 'bn' ? 'English' : 'বাংলা'}`}
        variant="secondary"
        onPress={() => toggleLanguage()}
      />
      <Button title={t('auth.logout')} variant="danger" loading={logout.isPending} onPress={() => logout.mutate()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 8 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  row: { color: colors.muted, fontSize: 15 },
});
