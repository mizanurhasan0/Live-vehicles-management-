import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoleGate } from '@/components/layout/RoleGate';
import { colors } from '@/lib/theme';

export default function DriverLayout() {
  const { t } = useTranslation('mobile');
  return (
    <RoleGate role="DRIVER">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tabs.Screen name="index" options={{ title: t('trip') }} />
        <Tabs.Screen name="profile" options={{ title: t('profile') }} />
      </Tabs>
    </RoleGate>
  );
}
