'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import { getWsBaseUrl } from '@/lib/public-env';
import type { LocationUpdate } from '@/types/api.types';

export function useTrackingSocket(onUpdate: (data: LocationUpdate) => void) {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!token) return;
    const wsUrl = getWsBaseUrl();
    const socket: Socket = io(`${wsUrl}/tracking`, {
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
