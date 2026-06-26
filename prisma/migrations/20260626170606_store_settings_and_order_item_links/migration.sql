-- AlterTable
ALTER TABLE "IntegrationSettings" ADD COLUMN     "businessHoursSaturday" TEXT NOT NULL DEFAULT '9:00 AM – 5:00 PM WAT',
ADD COLUMN     "businessHoursSunday" TEXT NOT NULL DEFAULT 'Closed',
ADD COLUMN     "businessHoursWeekdays" TEXT NOT NULL DEFAULT '8:00 AM – 7:00 PM WAT',
ADD COLUMN     "deliveryFreeThreshold" DOUBLE PRECISION NOT NULL DEFAULT 15000,
ADD COLUMN     "storeAddress" TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
ADD COLUMN     "storeEmail" TEXT NOT NULL DEFAULT 'hello@asiangroceryng.com',
ADD COLUMN     "storeName" TEXT NOT NULL DEFAULT 'Asian Grocery Nigeria',
ADD COLUMN     "tagline" TEXT NOT NULL DEFAULT 'Exploring Asia Through Food';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "categorySlug" TEXT,
ADD COLUMN     "productId" TEXT;
