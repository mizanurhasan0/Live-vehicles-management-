import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#047857',
  primaryDark: '#065f46',
  bg: '#f4f4f5',
  card: '#ffffff',
  text: '#18181b',
  muted: '#71717a',
  border: '#e4e4e7',
  danger: '#dc2626',
  amber: '#d97706',
};

export const theme = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg } as ViewStyle,
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
  title: { fontSize: 20, fontWeight: '700', color: colors.text } as TextStyle,
  subtitle: { fontSize: 14, color: colors.muted } as TextStyle,
});
