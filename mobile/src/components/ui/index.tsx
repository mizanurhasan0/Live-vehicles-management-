import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import { colors } from '@/lib/theme';

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...props
}: Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  style?: PressableProps['style'];
}) {
  const bg =
    variant === 'danger' ? colors.danger : variant === 'secondary' ? '#e4e4e7' : colors.primary;
  const textColor = variant === 'secondary' ? colors.text : '#fff';
  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={(state) => [
        styles.btn,
        { backgroundColor: bg, opacity: state.pressed || disabled ? 0.85 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'success' | 'warn' | 'default' }) {
  const bg = tone === 'success' ? '#d1fae5' : tone === 'warn' ? '#fef3c7' : '#f4f4f5';
  const fg = tone === 'success' ? '#065f46' : tone === 'warn' ? '#92400e' : colors.text;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor={colors.muted} />;
}

export function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      {label ? <Text style={styles.loadingText}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.empty}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: colors.text,
  },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 8, color: colors.muted },
  empty: { color: colors.muted, textAlign: 'center' },
});
