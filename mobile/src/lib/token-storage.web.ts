const ACCESS_KEY = 'madrasa_access_token';
const REFRESH_KEY = 'madrasa_refresh_token';

function storage() {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage;
}

export async function loadTokens() {
  const s = storage();
  if (!s) return { accessToken: null, refreshToken: null };
  return {
    accessToken: s.getItem(ACCESS_KEY),
    refreshToken: s.getItem(REFRESH_KEY),
  };
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  const s = storage();
  if (!s) return;
  s.setItem(ACCESS_KEY, accessToken);
  s.setItem(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  const s = storage();
  if (!s) return;
  s.removeItem(ACCESS_KEY);
  s.removeItem(REFRESH_KEY);
}
