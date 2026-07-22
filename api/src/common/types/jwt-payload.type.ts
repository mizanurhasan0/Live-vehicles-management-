import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  role: Role;
  madrasaId: string;
};

export type AuthUser = JwtPayload & {
  driverId?: string;
  guardianId?: string;
};
