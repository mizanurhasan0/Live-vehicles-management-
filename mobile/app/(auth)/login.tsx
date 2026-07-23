import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Button, Input, Label } from '@/components/ui';
import { useLogin } from '@/hooks/useAppData';
import { toggleLanguage } from '@/i18n';
import { colors } from '@/lib/theme';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const login = useLogin();
  const [phone, setPhone] = useState('01700000001');
  const [password, setPassword] = useState('password123');

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('app.title')}</Text>
          <Text style={styles.sub}>{t('app.subtitle')}</Text>
        </View>
        <Pressable onPress={() => toggleLanguage()} style={styles.lang}>
          <Text style={styles.langText}>{i18n.language === 'bn' ? 'EN' : 'BN'}</Text>
        </Pressable>
      </View>
      <Label>{t('auth.phone')}</Label>
      <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" />
      <Label>{t('auth.password')}</Label>
      <Input value={password} onChangeText={setPassword} secureTextEntry />
      <Button
        title={t('auth.login')}
        loading={login.isPending}
        onPress={() => login.mutate({ phone, password })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary },
  sub: { color: colors.muted, marginTop: 4 },
  lang: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  langText: { fontWeight: '600', color: colors.text },
});
