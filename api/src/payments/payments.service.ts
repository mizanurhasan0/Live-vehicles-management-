import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Role } from '@prisma/client';
import { paginate } from '../common/dto/pagination.dto';
import { AuthUser } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { BkashService } from './bkash.service';
import { InitiatePaymentDto, PaymentQueryDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private bkash: BkashService,
  ) {}

  async initiate(user: AuthUser, dto: InitiatePaymentDto) {
    if (user.role !== Role.GUARDIAN || !user.guardianId) {
      throw new ForbiddenException('Guardian only');
    }
    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        guardianId: user.guardianId,
        madrasaId: user.madrasaId,
        isActive: true,
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.prisma.payment.findFirst({
      where: {
        studentId: dto.studentId,
        month: dto.month,
        status: PaymentStatus.COMPLETED,
      },
    });
    if (existing) throw new BadRequestException('Already paid for this month');

    const pending = await this.prisma.payment.findFirst({
      where: {
        studentId: dto.studentId,
        month: dto.month,
        status: PaymentStatus.PENDING,
      },
    });
    if (pending?.bkashPaymentId) {
      return {
        payment: pending,
        bkash: {
          paymentID: pending.bkashPaymentId,
          bkashURL: null,
        },
      };
    }

    const amount = Number(student.monthlyFee);
    const payment = await this.prisma.payment.create({
      data: {
        madrasaId: user.madrasaId,
        guardianId: user.guardianId,
        studentId: student.id,
        amount,
        month: dto.month,
      },
    });

    const bkash = await this.bkash.createPayment(amount, payment.invoiceNo);
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { bkashPaymentId: bkash.paymentID },
    });
    return {
      payment: { ...payment, bkashPaymentId: bkash.paymentID },
      bkash: { paymentID: bkash.paymentID, bkashURL: bkash.bkashURL },
    };
  }

  async execute(user: AuthUser, paymentId: string) {
    const payment = await this.findOwnedPayment(user, paymentId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment not pending');
    }
    const bkashId = payment.bkashPaymentId;
    if (!bkashId) throw new BadRequestException('Missing bKash payment ID');

    const result = await this.bkash.executePayment(bkashId);
    return this.finalizePayment(payment.id, result);
  }

  async callback(body: {
    paymentID?: string;
    trxID?: string;
    status?: string;
  }) {
    if (!body.paymentID) throw new BadRequestException('paymentID required');
    const payment = await this.prisma.payment.findFirst({
      where: { bkashPaymentId: body.paymentID },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.COMPLETED) return payment;

    const result = body.trxID
      ? { transactionStatus: 'Completed', trxID: body.trxID }
      : await this.bkash.queryPayment(body.paymentID);
    return this.finalizePayment(payment.id, result);
  }

  async findAll(user: AuthUser, query: PaymentQueryDto) {
    const where = {
      madrasaId: user.madrasaId,
      ...(user.role === Role.GUARDIAN ? { guardianId: user.guardianId } : {}),
      ...(query.month ? { month: query.month } : {}),
    };
    const { skip, take } = paginate(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        include: { student: true, guardian: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async invoice(user: AuthUser, id: string) {
    const payment = await this.findOwnedPayment(user, id);
    return {
      invoiceNo: payment.invoiceNo,
      amount: payment.amount,
      month: payment.month,
      status: payment.status,
      paidAt: payment.paidAt,
      bkashTrxId: payment.bkashTrxId,
      student: await this.prisma.student.findUnique({
        where: { id: payment.studentId },
      }),
    };
  }

  private async findOwnedPayment(user: AuthUser, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        madrasaId: user.madrasaId,
        ...(user.role === Role.GUARDIAN ? { guardianId: user.guardianId } : {}),
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  private async finalizePayment(id: string, result: Record<string, string>) {
    const completed =
      result.transactionStatus === 'Completed' ||
      result.statusCode === '0000' ||
      result.statusMessage === 'Successful' ||
      !!result.trxID;

    if (!completed && result.statusCode && result.statusCode !== '0000') {
      throw new BadRequestException(
        result.statusMessage ?? 'bKash payment not completed',
      );
    }

    return this.prisma.payment.update({
      where: { id },
      data: completed
        ? {
            status: PaymentStatus.COMPLETED,
            bkashTrxId: result.trxID,
            paidAt: new Date(),
          }
        : { status: PaymentStatus.FAILED },
      include: { student: true },
    });
  }
}
