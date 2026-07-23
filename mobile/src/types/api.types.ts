export type Role = 'ADMIN' | 'GUARDIAN' | 'DRIVER';

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string | null;
  role: Role;
  madrasaId: string;
  driver?: {
    id: string;
    licenseNo?: string;
    vehicle?: {
      id: string;
      number: string;
      capacity?: number;
      route?: { name: string };
    };
  };
  guardian?: { id: string };
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type Vehicle = {
  id: string;
  number: string;
  capacity: number;
  status: string;
  route?: { name: string };
};

export type Student = {
  id: string;
  name: string;
  class?: string;
  pickupPoint: string;
  dropPoint: string;
  pickupLat?: number;
  pickupLng?: number;
  monthlyFee: number | string;
  vehicleId?: string;
  vehicle?: Vehicle;
};

export type Trip = {
  id: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  vehicle?: Vehicle;
};

export type Payment = {
  id: string;
  amount: number | string;
  month: string;
  status: string;
  invoiceNo: string;
  student?: Student;
};

export type LocationUpdate = {
  lat: number;
  lng: number;
  speed?: number;
  vehicleId: string;
  updatedAt?: string;
  source?: string;
};

export type Eta = {
  distanceText: string;
  durationText: string;
  durationMinutes: number;
  estimated?: boolean;
};

export type InitiatePaymentResponse = {
  payment?: { id: string };
  bkash?: { paymentID: string; bkashURL: string | null };
};
