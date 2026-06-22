import { prisma } from '@/lib/prisma';
import { products } from '@/data/products';
import { categories } from '@/data/categories';

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { ...p, createdAt: new Date(p.createdAt) },
      create: { ...p, createdAt: new Date(p.createdAt) },
    });
  }
  console.log(`Seeded ${products.length} products`);

  await prisma.bankDetails.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      note: 'Send proof of payment via WhatsApp after transfer.',
    },
  });
  console.log('Seeded bank details singleton');

  const defaultBanners = [
    {
      id: 'banner-1',
      image: '/banners/hero.png',
      headline: 'Asia In Every Aisle',
      subtitle: 'Korean · Japanese · Thai · Chinese',
      ctaLabel: 'Shop Now',
      ctaHref: '/shop',
      transition: 'fade',
      align: 'left',
      enabled: true,
      position: 0,
    },
    {
      id: 'banner-2',
      image: '/banners/walkin.png',
      headline: 'Visit Our Store',
      subtitle: 'Fresh arrivals every week',
      ctaLabel: 'Find Us',
      ctaHref: '/contact',
      transition: 'slide',
      align: 'center',
      enabled: true,
      position: 1,
    },
    {
      id: 'banner-3',
      image: '/banners/chalkboard.png',
      headline: 'Fresh Deals Daily',
      subtitle: 'Save big on Asian favourites',
      ctaLabel: 'See Deals',
      ctaHref: '/deals',
      transition: 'zoom',
      align: 'right',
      enabled: true,
      position: 2,
    },
  ];

  for (const b of defaultBanners) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    });
  }
  console.log(`Seeded ${defaultBanners.length} banners`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
