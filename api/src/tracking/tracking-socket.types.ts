import type { Socket } from 'socket.io';
import type { AuthUser } from '../common/types/jwt-payload.type';

export type TrackingSocketData = {
  user?: AuthUser;
};

export function getHandshakeToken(client: {
  handshake: {
    auth?: { token?: unknown };
    headers: { authorization?: string | string[] };
  };
}): string | undefined {
  const authToken = client.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.length > 0) {
    return authToken;
  }

  const header = client.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }

  return undefined;
}

export function getTrackingSocketData(client: Socket): TrackingSocketData {
  return client.data as TrackingSocketData;
}

export function setTrackingSocketUser(client: Socket, user: AuthUser): void {
  const data = getTrackingSocketData(client);
  data.user = user;
}
