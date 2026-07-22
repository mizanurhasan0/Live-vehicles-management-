import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMadrasaDto, UpdateMadrasaDto } from './dto/madrasa.dto';

@Injectable()
export class MadrasasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMadrasaDto) {
    return this.prisma.madrasa.create({ data: dto });
  }

  findAll() {
    return this.prisma.madrasa.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.madrasa.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Madrasa not found');
    return item;
  }

  async update(id: string, dto: UpdateMadrasaDto) {
    await this.findOne(id);
    return this.prisma.madrasa.update({ where: { id }, data: dto });
  }
}
