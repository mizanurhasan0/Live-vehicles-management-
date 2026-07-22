import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async income(madrasaId: string, month: string) {
    const payments = await this.prisma.payment.findMany({
      where: { madrasaId, month, status: PaymentStatus.COMPLETED },
      include: { student: true },
    });
    const total = payments.reduce((s, p) => s + Number(p.amount), 0);
    return { month, total, count: payments.length, payments };
  }

  async pendingPayments(madrasaId: string, month: string) {
    const students = await this.prisma.student.findMany({
      where: { madrasaId, isActive: true },
      include: {
        guardian: { include: { user: true } },
        payments: { where: { month, status: PaymentStatus.COMPLETED } },
      },
    });
    return students
      .filter((s) => s.payments.length === 0)
      .map(({ payments: _, ...s }) => s);
  }

  async vehicleUsage(madrasaId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { madrasaId },
      include: { _count: { select: { trips: true, students: true } } },
    });
    return vehicles.map((v) => ({
      id: v.id,
      number: v.number,
      tripCount: v._count.trips,
      studentCount: v._count.students,
    }));
  }

  async driverActivity(madrasaId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { madrasaId },
      include: {
        user: { select: { name: true, phone: true } },
        _count: { select: { trips: true } },
        trips: {
          where: { status: 'COMPLETED' },
          orderBy: { endedAt: 'desc' },
          take: 1,
        },
      },
    });
    return drivers.map((d) => ({
      id: d.id,
      name: d.user.name,
      phone: d.user.phone,
      tripCount: d._count.trips,
      lastTripAt: d.trips[0]?.endedAt ?? null,
    }));
  }
}
