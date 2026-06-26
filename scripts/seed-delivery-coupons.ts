import { prisma } from '../lib/prisma';

const deliveryAreas = [
  { name: 'Lagos Island', fee: 1500, estimatedDays: '1-2 business days' },
  { name: 'Lagos Mainland', fee: 1500, estimatedDays: '1-2 business days' },
  { name: 'Abuja (FCT)', fee: 2500, estimatedDays: '2-3 business days' },
  { name: 'Port Harcourt', fee: 2500, estimatedDays: '2-3 business days' },
  { name: 'Ibadan', fee: 2000, estimatedDays: '2-3 business days' },
  { name: 'Other States', fee: 3000, estimatedDays: '3-5 business days' },
];

const coupons = [
  { code: 'SHOPASIA', type: 'percent', value: 10 },
  { code: 'ASIAN10', type: 'percent', value: 10, minOrder: 5000 },
  { code: 'NEWCUSTOMER', type: 'percent', value: 15, minOrder: 3000 },
  { code: 'WELCOME20', type: 'percent', value: 20, minOrder: 10000 },
  { code: 'FREESHIP', type: 'shipping', value: 0 },
];

async function main() {
  const existingAreas = await prisma.deliveryArea.count();
  if (existingAreas === 0) {
    for (let i = 0; i < deliveryAreas.length; i++) {
      await prisma.deliveryArea.create({ data: { ...deliveryAreas[i], position: i } });
    }
    console.log(`Seeded ${deliveryAreas.length} delivery areas.`);
  } else {
    console.log(`Delivery areas already exist (${existingAreas}), skipping seed.`);
  }

  for (const c of coupons) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }
  console.log(`Ensured ${coupons.length} coupons exist.`);

  await prisma.$disconnect();
}

main();
