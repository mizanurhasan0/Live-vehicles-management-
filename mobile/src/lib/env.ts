export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';
}

export function getWsBaseUrl() {
  return process.env.EXPO_PUBLIC_WS_URL ?? 'http://localhost:3001';
}

export function getMediaOrigin() {
  const api = getApiBaseUrl();
  return api.replace(/\/api\/?$/, '');
}
