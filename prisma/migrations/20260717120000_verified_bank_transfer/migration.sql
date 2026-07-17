CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'expired', 'refunded');

ALTER TABLE "Order"
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN "paymentProvider" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "paymentExpiresAt" TIMESTAMP(3),
  ADD COLUMN "paymentNotifiedAt" TIMESTAMP(3);

UPDATE "Order"
SET
  "paymentStatus" = 'paid',
  "paidAt" = COALESCE("paidAt", "createdAt"),
  "paymentProvider" = CASE
    WHEN "payment" IN ('paystack', 'bank_transfer') THEN 'paystack'
    WHEN "payment" = 'flutterwave' THEN 'flutterwave'
    ELSE NULL
  END
WHERE "status" IN ('confirmed', 'processing', 'shipped', 'delivered');

CREATE TABLE "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "amountKobo" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  "accountNumber" TEXT,
  "accountName" TEXT,
  "bankName" TEXT,
  "expiresAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "providerTransactionId" TEXT,
  "lastCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentAttempt_reference_key" ON "PaymentAttempt"("reference");
CREATE INDEX "PaymentAttempt_orderId_idx" ON "PaymentAttempt"("orderId");
CREATE INDEX "PaymentAttempt_status_expiresAt_idx" ON "PaymentAttempt"("status", "expiresAt");

ALTER TABLE "PaymentAttempt"
  ADD CONSTRAINT "PaymentAttempt_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
