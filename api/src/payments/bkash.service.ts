import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

type BkashToken = { id_token: string; expires_in: number };

export type BkashCreateResponse = {
  paymentID: string;
  bkashURL: string;
  statusCode?: string;
  statusMessage?: string;
};

type BkashResult = Record<string, string>;

@Injectable()
export class BkashService {
  private readonly logger = new Logger(BkashService.name);
  private client: AxiosInstance;
  private token?: string;
  private tokenExpiry = 0;

  constructor(private config: ConfigService) {
    this.client = axios.create({
      baseURL: config.get<string>('app.bkash.baseUrl'),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private headers() {
    return {
      Authorization: this.token,
      'X-APP-Key': this.config.get<string>('app.bkash.appKey') ?? '',
    };
  }

  private assertOk(data: BkashResult, step: string) {
    if (data.statusCode && data.statusCode !== '0000') {
      throw new BadRequestException(
        `bKash ${step} failed: ${data.statusMessage ?? data.statusCode}`,
      );
    }
  }

  async getToken() {
    if (this.token && Date.now() < this.tokenExpiry) return this.token;
    const { data } = await this.client.post<BkashToken>(
      '/tokenized/checkout/token/grant',
      {
        app_key: this.config.get<string>('app.bkash.appKey') ?? '',
        app_secret: this.config.get<string>('app.bkash.appSecret') ?? '',
      },
      {
        headers: {
          username: this.config.get<string>('app.bkash.username') ?? '',
          password: this.config.get<string>('app.bkash.password') ?? '',
        },
      },
    );
    this.token = data.id_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.token;
  }

  async createPayment(amount: number, merchantInvoice: string) {
    await this.getToken();
    const callbackURL =
      this.config.get<string>('app.bkash.callbackUrl') ??
      'http://localhost:3000/bn/guardian/payments/callback';

    const { data } = await this.client.post<BkashCreateResponse>(
      '/tokenized/checkout/create',
      {
        mode: '0011',
        payerReference: merchantInvoice,
        amount: amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: merchantInvoice,
        callbackURL,
      },
      { headers: this.headers() },
    );

    this.assertOk(data, 'create');
    if (!data.paymentID || !data.bkashURL) {
      throw new BadRequestException(
        'bKash create: missing paymentID or bkashURL',
      );
    }
    return data;
  }

  async executePayment(paymentId: string) {
    await this.getToken();
    try {
      const { data } = await this.client.post<BkashResult>(
        '/tokenized/checkout/execute',
        { paymentID: paymentId },
        { headers: this.headers() },
      );
      return data;
    } catch {
      this.logger.warn(`Execute failed for ${paymentId}, trying query`);
      return this.queryPayment(paymentId);
    }
  }

  async queryPayment(paymentId: string) {
    await this.getToken();
    const { data } = await this.client.post<BkashResult>(
      '/tokenized/checkout/payment/status',
      { paymentID: paymentId },
      { headers: this.headers() },
    );
    return data;
  }
}
