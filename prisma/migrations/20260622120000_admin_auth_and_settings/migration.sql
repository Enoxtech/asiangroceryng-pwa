-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'support', 'product_manager');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "paystackPublicKey" TEXT NOT NULL DEFAULT '',
    "paystackSecretKey" TEXT NOT NULL DEFAULT '',
    "flutterwavePublicKey" TEXT NOT NULL DEFAULT '',
    "flutterwaveSecretKey" TEXT NOT NULL DEFAULT '',
    "gmailUser" TEXT NOT NULL DEFAULT '',
    "gmailAppPassword" TEXT NOT NULL DEFAULT '',
    "adminEmail" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
