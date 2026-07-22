import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

type BkashToken = { id_token: string; expires_in: number };

@Injectable()
export class BkashService {
  private readonly logger = new Logger(BkashService.name);
  private client: AxiosInstance;
  private token?: string;
  private tokenExpiry = 0;

  constructor(private config: ConfigService) {
    const baseURL = config.get<string>('app.bkash.baseUrl');
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private headers() {
    return {
      Authorization: this.token,
      'X-APP-Key': this.config.get('app.bkash.appKey'),
    };
  }

  async getToken() {
    if (this.token && Date.now() < this.tokenExpiry) return this.token;
    const { data } = await this.client.post<BkashToken>(
      '/tokenized/checkout/token/grant',
      {
        app_key: this.config.get('app.bkash.appKey'),
        app_secret: this.config.get('app.bkash.appSecret'),
      },
      {
        headers: {
          username: this.config.get('app.bkash.username'),
          password: this.config.get('app.bkash.password'),
        },
      },
    );
    this.token = data.id_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.token;
  }

  async createPayment(amount: number, merchantInvoice: string) {
    await this.getToken();
    const { data } = await this.client.post(
      '/tokenized/checkout/create',
      {
        mode: '0011',
        payerReference: merchantInvoice,
        amount: amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: merchantInvoice,
      },
      { headers: this.headers() },
    );
    return data;
  }

  async executePayment(paymentId: string) {
    await this.getToken();
    const { data } = await this.client.post(
      '/tokenized/checkout/execute',
      { paymentID: paymentId },
      { headers: this.headers() },
    );
    return data;
  }

  async queryPayment(paymentId: string) {
    await this.getToken();
    const { data } = await this.client.post(
      '/tokenized/checkout/payment/status',
      { paymentID: paymentId },
      { headers: this.headers() },
    );
    return data;
  }
}
