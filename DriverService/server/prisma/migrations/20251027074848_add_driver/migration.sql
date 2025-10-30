-- CreateEnum
CREATE TYPE "DriverState" AS ENUM ('READY', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "state" "DriverState" NOT NULL DEFAULT 'UNAVAILABLE',

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);
