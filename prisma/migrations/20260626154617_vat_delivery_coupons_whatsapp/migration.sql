-- AlterTable
ALTER TABLE "IntegrationSettings" ADD COLUMN     "resendApiKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resendFromEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "vatPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "whatsappAccessToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappBusinessAccountId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappOrderTemplateName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappPhoneNumberId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappTemplateLanguage" TEXT NOT NULL DEFAULT 'en_US';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DeliveryArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "estimatedDays" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DeliveryArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrder" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
