import { PrismaClient, Role, TripStatus, VehicleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const madrasa = await prisma.madrasa.upsert({
    where: { id: 'seed-madrasa' },
    update: {},
    create: {
      id: 'seed-madrasa',
      name: 'Al-Noor Madrasa',
      address: 'Dhaka, Bangladesh',
      phone: '01700000000',
    },
  });

  const admin = await prisma.user.upsert({
    where: { phone: '01700000000' },
    update: {},
    create: {
      name: 'Admin User',
      phone: '01700000000',
      email: 'admin@madrasa.local',
      password,
      role: Role.ADMIN,
      madrasaId: madrasa.id,
    },
  });

  const driverUsers = await Promise.all(
    ['01700000001', '01700000002'].map((phone, i) =>
      prisma.user.upsert({
        where: { phone },
        update: {},
        create: {
          name: `Driver ${i + 1}`,
          phone,
          password,
          role: Role.DRIVER,
          madrasaId: madrasa.id,
        },
      }),
    ),
  );

  const guardianUsers = await Promise.all(
    ['01700000003', '01700000004'].map((phone, i) =>
      prisma.user.upsert({
        where: { phone },
        update: {},
        create: {
          name: `Guardian ${i + 1}`,
          phone,
          password,
          role: Role.GUARDIAN,
          madrasaId: madrasa.id,
        },
      }),
    ),
  );

  const drivers = await Promise.all(
    driverUsers.map((u, i) =>
      prisma.driver.upsert({
        where: { userId: u.id },
        update: {},
        create: {
          userId: u.id,
          madrasaId: madrasa.id,
          licenseNo: `DL-${1000 + i}`,
        },
      }),
    ),
  );

  const guardians = await Promise.all(
    guardianUsers.map((u) =>
      prisma.guardian.upsert({
        where: { userId: u.id },
        update: {},
        create: { userId: u.id, madrasaId: madrasa.id },
      }),
    ),
  );

  const routes = await Promise.all(
    ['Route A - Mirpur', 'Route B - Uttara', 'Route C - Dhanmondi', 'Route D - Gulshan'].map(
      (name, i) =>
        prisma.route.upsert({
          where: { id: `seed-route-${i + 1}` },
          update: {},
          create: {
            id: `seed-route-${i + 1}`,
            name,
            madrasaId: madrasa.id,
            stops: {
              create: [
                { name: 'Stop 1', lat: 23.8103 + i * 0.01, lng: 90.4125, order: 0 },
                { name: 'Stop 2', lat: 23.8153 + i * 0.01, lng: 90.4225, order: 1 },
              ],
            },
          },
        }),
    ),
  );

  const vehicles = await Promise.all(
    ['DHK-1001', 'DHK-1002', 'DHK-1003', 'DHK-1004'].map((number, i) =>
      prisma.vehicle.upsert({
        where: { madrasaId_number: { madrasaId: madrasa.id, number } },
        update: i === 0 ? { deviceImei: '867530012345678' } : {},
        create: {
          number,
          capacity: 30,
          madrasaId: madrasa.id,
          driverId: drivers[i]?.id,
          routeId: routes[i]?.id,
          status: VehicleStatus.ACTIVE,
          deviceImei: i === 0 ? '867530012345678' : undefined,
        },
      }),
    ),
  );

  const studentNames = [
    ['Ahmed', 'Fatima'],
    ['Karim', 'Ayesha'],
  ];
  for (let g = 0; g < guardians.length; g++) {
    for (let s = 0; s < 2; s++) {
      const idx = g * 2 + s;
      await prisma.student.upsert({
        where: { id: `seed-student-${idx + 1}` },
        update: {},
        create: {
          id: `seed-student-${idx + 1}`,
          name: studentNames[g][s],
          class: 'Class 5',
          madrasaId: madrasa.id,
          guardianId: guardians[g].id,
          vehicleId: vehicles[idx % vehicles.length].id,
          pickupPoint: `Pickup Point ${idx + 1}`,
          dropPoint: madrasa.name,
          pickupLat: 23.78 + idx * 0.01,
          pickupLng: 90.4 + idx * 0.01,
          monthlyFee: 1500,
        },
      });
    }
  }

  const completedTrip = await prisma.trip.create({
    data: {
      madrasaId: madrasa.id,
      vehicleId: vehicles[0].id,
      driverId: drivers[0].id,
      status: TripStatus.COMPLETED,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 1800000),
      locationLogs: {
        create: [
          { lat: 23.8103, lng: 90.4125, speed: 25, source: 'PHONE_GPS' },
          { lat: 23.8123, lng: 90.4155, speed: 30, source: 'PHONE_GPS' },
        ],
      },
    },
  });

  console.log('Seed complete');
  console.log({ admin: admin.phone, drivers: driverUsers.map((u) => u.phone), guardians: guardianUsers.map((u) => u.phone), completedTrip: completedTrip.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
