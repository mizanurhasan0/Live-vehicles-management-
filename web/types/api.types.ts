export type Role = 'ADMIN' | 'GUARDIAN' | 'DRIVER';

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  madrasaId: string;
  driver?: { id: string };
  guardian?: { id: string };
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User & { driverId?: string; guardianId?: string };
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
  driverId?: string;
  routeId?: string;
  driver?: { user?: { name: string; phone: string } };
  route?: { name: string };
};

export type Driver = {
  id: string;
  licenseNo: string;
  user: { name: string; phone: string; email?: string };
  vehicle?: Vehicle;
};

export type Guardian = {
  id: string;
  user: { name: string; phone: string };
  students?: Student[];
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
  guardianId: string;
  vehicle?: Vehicle;
  guardian?: Guardian;
};

export type Route = {
  id: string;
  name: string;
  stops?: RouteStop[];
};

export type RouteStop = {
  name: string;
  lat: number;
  lng: number;
  order: number;
};

export type Trip = {
  id: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  vehicle?: Vehicle;
  driver?: { user?: { name: string; phone: string } };
};

export type Payment = {
  id: string;
  amount: number | string;
  month: string;
  status: string;
  invoiceNo: string;
  student?: Student;
};

export type LiveVehicle = {
  vehicle: Vehicle;
  location: LocationUpdate | null;
};

export type LocationUpdate = {
  lat: number;
  lng: number;
  speed?: number;
  vehicleId: string;
  updatedAt?: string;
};

export type Eta = {
  distanceText: string;
  durationText: string;
  durationMinutes: number;
  estimated?: boolean;
  source?: string;
};
