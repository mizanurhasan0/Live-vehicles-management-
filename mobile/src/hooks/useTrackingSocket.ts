import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getWsBaseUrl } from '@/lib/env';
import { useAuthStore } from '@/stores/auth.store';
import type { LocationUpdate } from '@/types/api.types';

export function useTrackingSocket(onUpdate: (data: LocationUpdate) => void) {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!token) return;
    const socket: Socket = io(`${getWsBaseUrl()}/tracking`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.on('vehicle:location', onUpdate);
    return () => {
      socket.off('vehicle:location', onUpdate);
      socket.disconnect();
    };
  }, [token, onUpdate]);
}
