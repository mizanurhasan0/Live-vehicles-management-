-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GUARDIAN', 'DRIVER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_TRIP', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('STARTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRIP_STARTED', 'VEHICLE_NEAR_PICKUP', 'TRIP_COMPLETED', 'PAYMENT_REMINDER', 'PAYMENT_RECEIVED');

-- CreateTable
CREATE TABLE "Madrasa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Madrasa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "driverId" TEXT,
    "routeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "name" TEXT NOT NULL,
    "class" TEXT,
    "pickupPoint" TEXT NOT NULL,
    "dropPoint" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "dropLat" DOUBLE PRECISION,
    "dropLng" DOUBLE PRECISION,
    "monthlyFee" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationLog" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'PHONE_GPS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "month" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "bkashTrxId" TEXT,
    "bkashPaymentId" TEXT,
    "invoiceNo" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "madrasaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_madrasaId_idx" ON "User"("madrasaId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_madrasaId_idx" ON "Driver"("madrasaId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- CreateIndex
CREATE INDEX "Guardian_madrasaId_idx" ON "Guardian"("madrasaId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");

-- CreateIndex
CREATE INDEX "Vehicle_madrasaId_idx" ON "Vehicle"("madrasaId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_madrasaId_number_key" ON "Vehicle"("madrasaId", "number");

-- CreateIndex
CREATE INDEX "Student_madrasaId_idx" ON "Student"("madrasaId");

-- CreateIndex
CREATE INDEX "Student_guardianId_idx" ON "Student"("guardianId");

-- CreateIndex
CREATE INDEX "Student_vehicleId_idx" ON "Student"("vehicleId");

-- CreateIndex
CREATE INDEX "Route_madrasaId_idx" ON "Route"("madrasaId");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_idx" ON "RouteStop"("routeId");

-- CreateIndex
CREATE INDEX "Trip_madrasaId_idx" ON "Trip"("madrasaId");

-- CreateIndex
CREATE INDEX "Trip_vehicleId_idx" ON "Trip"("vehicleId");

-- CreateIndex
CREATE INDEX "Trip_driverId_idx" ON "Trip"("driverId");

-- CreateIndex
CREATE INDEX "LocationLog_tripId_idx" ON "LocationLog"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNo_key" ON "Payment"("invoiceNo");

-- CreateIndex
CREATE INDEX "Payment_madrasaId_idx" ON "Payment"("madrasaId");

-- CreateIndex
CREATE INDEX "Payment_guardianId_idx" ON "Payment"("guardianId");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_month_idx" ON "Payment"("month");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_madrasaId_idx" ON "Notification"("madrasaId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationLog" ADD CONSTRAINT "LocationLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_madrasaId_fkey" FOREIGN KEY ("madrasaId") REFERENCES "Madrasa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

