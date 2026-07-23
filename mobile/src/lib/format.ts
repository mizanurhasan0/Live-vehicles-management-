export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `৳${n.toLocaleString('bn-BD')}`;
}

export function resolveMediaUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const origin = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ?? 'http://localhost:3001';
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
