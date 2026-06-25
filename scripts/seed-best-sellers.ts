/**
 * One-off: the WooCommerce export had no sales/rating data, so there's no
 * real "best seller" signal. Marks a diverse spread of products (a few per
 * category) as isFeatured so the homepage Best Sellers section isn't empty.
 */
import { prisma } from '../lib/prisma';

const PER_CATEGORY = 3;

async function main() {
  await prisma.product.updateMany({ data: { isFeatured: false } });

  const categories = await prisma.category.findMany({ select: { slug: true } });
  let total = 0;

  for (const cat of categories) {
    const picks = await prisma.product.findMany({
      where: { categorySlug: cat.slug, inStock: true },
      orderBy: { price: 'desc' },
      take: PER_CATEGORY,
      select: { id: true },
    });
    if (picks.length === 0) continue;
    await prisma.product.updateMany({
      where: { id: { in: picks.map((p) => p.id) } },
      data: { isFeatured: true },
    });
    total += picks.length;
    console.log(`${cat.slug}: featured ${picks.length}`);
  }

  console.log(`\nDone. ${total} products marked as featured (Best Sellers).`);

  // New Arrivals was completely empty too (no migrated product was ever
  // marked isNew) — pick a different diverse spread per category for it.
  await prisma.product.updateMany({ data: { isNew: false } });
  let newTotal = 0;
  for (const cat of categories) {
    const picks = await prisma.product.findMany({
      where: { categorySlug: cat.slug, inStock: true, isFeatured: false },
      orderBy: { price: 'asc' },
      take: PER_CATEGORY,
      select: { id: true },
    });
    if (picks.length === 0) continue;
    await prisma.product.updateMany({
      where: { id: { in: picks.map((p) => p.id) } },
      data: { isNew: true },
    });
    newTotal += picks.length;
  }
  console.log(`Done. ${newTotal} products marked as new (New Arrivals).`);

  await prisma.$disconnect();
}

main();
