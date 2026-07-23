-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "deviceImei" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_deviceImei_key" ON "Vehicle"("deviceImei");
