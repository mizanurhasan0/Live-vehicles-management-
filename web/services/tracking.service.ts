import { apiGet, apiPost } from '@/lib/api-client';
import type { Eta, LiveVehicle, LocationUpdate, Paginated, Trip } from '@/types/api.types';

export const trackingService = {
  allLive: () => apiGet<LiveVehicle[]>('/tracking/vehicles'),
  vehicleLive: (id: string) => apiGet<{ vehicle: object; location: LocationUpdate | null }>(`/tracking/vehicles/${id}`),
  eta: (id: string, studentId?: string) =>
    apiGet<Eta>(`/tracking/vehicles/${id}/eta`, studentId ? { studentId } : {}),
  postLocation: (body: object) => apiPost('/tracking/location', body),
};

export const tripService = {
  list: (page = 1) => apiGet<Paginated<Trip>>('/trips', { page, limit: 20 }),
  active: () => apiGet<Trip | null>('/trips/active'),
  start: () => apiPost<Trip>('/trips/start'),
  end: (id: string) => apiPost<Trip>(`/trips/${id}/end`),
};

export const paymentService = {
  list: (page = 1, month?: string) =>
    apiGet<Paginated<import('@/types/api.types').Payment>>('/payments', { page, limit: 20, month }),
  initiate: (studentId: string, month: string) =>
    apiPost('/payments/initiate', { studentId, month }),
  execute: (paymentId: string) => apiPost('/payments/execute', { paymentId }),
  invoice: (id: string) => apiGet(`/payments/${id}/invoice`),
};

export const reportService = {
  income: (month: string) => apiGet(`/reports/income`, { month }),
  pending: (month: string) => apiGet(`/reports/pending-payments`, { month }),
  vehicleUsage: () => apiGet('/reports/vehicle-usage'),
  driverActivity: () => apiGet('/reports/driver-activity'),
};
