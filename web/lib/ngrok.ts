/** Headers / helpers for ngrok free-tier dev tunnels (HTTPS + skip browser warning). */

export function isNgrokHostName(host: string): boolean {
  return (
    host.endsWith('.ngrok-free.app') ||
    host.endsWith('.ngrok-free.dev') ||
    host.endsWith('.ngrok.app') ||
    host.endsWith('.ngrok.io')
  );
}

export function isNgrokUrl(url: string): boolean {
  try {
    return isNgrokHostName(new URL(url).hostname);
  } catch {
    return url.includes('ngrok');
  }
}

export const NGROK_SKIP_BROWSER_WARNING = {
  'ngrok-skip-browser-warning': '69420',
} as const;
