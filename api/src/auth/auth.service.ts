import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { AuthUser, JwtPayload } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_BYTES = 2 * 1024 * 1024;

const userProfileSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  photoUrl: true,
  role: true,
  madrasaId: true,
  driver: {
    select: {
      id: true,
      licenseNo: true,
      address: true,
      vehicle: {
        select: {
          id: true,
          number: true,
          capacity: true,
          route: { select: { name: true } },
        },
      },
    },
  },
  guardian: { select: { id: true } },
} as const;

type UploadedPhoto = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async login(phone: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { driver: true, guardian: true },
    });
    if (!user?.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const blacklisted = await this.redis.client.get(
      this.redis.refreshBlacklistKey(refreshToken),
    );
    if (blacklisted) throw new UnauthorizedException('Token revoked');

    let payload: JwtPayload;
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('app.jwtRefreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { driver: true, guardian: true },
    });
    if (!user?.isActive || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user);
  }

  async logout(userId: string, refreshToken?: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    if (refreshToken) {
      const ttl = 7 * 24 * 60 * 60;
      await this.redis.client.setex(
        this.redis.refreshBlacklistKey(refreshToken),
        ttl,
        '1',
      );
    }
    return { message: 'Logged out' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userProfileSelect,
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async uploadPhoto(userId: string, file: UploadedPhoto) {
    if (!file) throw new BadRequestException('Photo file required');
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Photo must be under 2MB');
    }
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new BadRequestException('Only JPG, PNG, or WebP allowed');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const dir = join(process.cwd(), 'uploads', 'avatars');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const filename = `${userId}${ext}`;
    const diskPath = join(dir, filename);
    writeFileSync(diskPath, file.buffer);

    const photoUrl = `/uploads/avatars/${filename}`;
    if (user.photoUrl && user.photoUrl !== photoUrl) {
      const oldPath = join(process.cwd(), user.photoUrl.replace(/^\//, ''));
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { photoUrl },
      select: userProfileSelect,
    });
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { driver: true, guardian: true },
    });
    if (!user?.isActive) throw new UnauthorizedException();
    return {
      sub: user.id,
      role: user.role,
      madrasaId: user.madrasaId,
      driverId: user.driver?.id,
      guardianId: user.guardian?.id,
    };
  }

  private async issueTokens(user: {
    id: string;
    name: string;
    phone: string;
    role: Role;
    madrasaId: string;
    driver?: { id: string } | null;
    guardian?: { id: string } | null;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      madrasaId: user.madrasaId,
    };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('app.jwtSecret'),
      expiresIn: this.config.get('app.jwtExpiresIn'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('app.jwtRefreshSecret'),
      expiresIn: this.config.get('app.jwtRefreshExpiresIn'),
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        madrasaId: user.madrasaId,
        driverId: user.driver?.id,
        guardianId: user.guardian?.id,
      },
    };
  }
}
