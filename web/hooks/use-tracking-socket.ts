'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import type { LocationUpdate } from '@/types/api.types';

const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

export function useTrackingSocket(onUpdate: (data: LocationUpdate) => void) {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!token) return;
    let socket: Socket;
    socket = io(`${wsUrl}/tracking`, { auth: { token } });
    socket.on('vehicle:location', onUpdate);
    return () => {
      socket.off('vehicle:location', onUpdate);
      socket.disconnect();
    };
  }, [token, onUpdate]);
}
