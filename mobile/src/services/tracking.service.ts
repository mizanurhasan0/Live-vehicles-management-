import { apiGet, apiPost } from '@/lib/api-client';
import type {
  Eta,
  InitiatePaymentResponse,
  LocationUpdate,
  Paginated,
  Payment,
  Trip,
  Vehicle,
} from '@/types/api.types';

export const trackingService = {
  vehicleLive: (id: string) =>
    apiGet<{ vehicle: Vehicle; location: LocationUpdate | null }>(
      `/tracking/vehicles/${id}`,
    ),
  eta: (id: string, studentId?: string) =>
    apiGet<Eta>(`/tracking/vehicles/${id}/eta`, studentId ? { studentId } : {}),
  postLocation: (body: object) => apiPost('/tracking/location', body),
};

export const tripService = {
  active: () => apiGet<Trip | null>('/trips/active'),
  start: () => apiPost<Trip>('/trips/start'),
  end: (id: string) => apiPost<Trip>(`/trips/${id}/end`),
};

export const paymentService = {
  list: (page = 1, month?: string) =>
    apiGet<Paginated<Payment>>('/payments', { page, limit: 20, month }),
  initiate: (studentId: string, month: string) =>
    apiPost<InitiatePaymentResponse>('/payments/initiate', { studentId, month }),
  execute: (paymentId: string) => apiPost('/payments/execute', { paymentId }),
  callback: (body: { paymentID: string; trxID?: string; status?: string }) =>
    apiPost('/payments/callback', body),
};
