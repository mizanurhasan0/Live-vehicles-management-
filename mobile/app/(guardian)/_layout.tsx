import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoleGate } from '@/components/layout/RoleGate';
import { colors } from '@/lib/theme';

export default function GuardianLayout() {
  const { t } = useTranslation('mobile');
  return (
    <RoleGate role="GUARDIAN">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tabs.Screen name="index" options={{ title: t('home') }} />
        <Tabs.Screen name="tracking" options={{ title: t('track') }} />
        <Tabs.Screen name="payments" options={{ title: t('pay') }} />
        <Tabs.Screen name="profile" options={{ title: t('profile') }} />
        <Tabs.Screen name="payments/callback" options={{ href: null }} />
      </Tabs>
    </RoleGate>
  );
}
