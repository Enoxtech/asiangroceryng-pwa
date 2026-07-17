-- Emergency rollback for the verified bank-transfer schema only.
-- Run this only after reverting the application to the restore-point branch.
DROP TABLE IF EXISTS "PaymentAttempt";

ALTER TABLE "Order"
  DROP COLUMN IF EXISTS "paymentNotifiedAt",
  DROP COLUMN IF EXISTS "paymentExpiresAt",
  DROP COLUMN IF EXISTS "paidAt",
  DROP COLUMN IF EXISTS "paymentProvider",
  DROP COLUMN IF EXISTS "paymentStatus";

DROP TYPE IF EXISTS "PaymentStatus";
