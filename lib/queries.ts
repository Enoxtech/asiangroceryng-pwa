import { prisma } from '@/lib/prisma';
import type { Product } from '@/types';
import type { Product as PrismaProduct } from '@/lib/generated/prisma/client';

function serializeProduct(p: PrismaProduct): Product {
  return {
    ...p,
    comparePrice: p.comparePrice ?? undefined,
    ingredients: p.ingredients ?? undefined,
    allergens: p.allergens ?? undefined,
    expiryInfo: p.expiryInfo ?? undefined,
    spiceLevel: (p.spiceLevel as Product['spiceLevel']) ?? undefined,
    discount: p.discount ?? undefined,
    storageType: p.storageType as Product['storageType'],
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(serializeProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? serializeProduct(row) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { categorySlug }, orderBy: { createdAt: 'desc' } });
  return rows.map(serializeProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { isFeatured: true }, orderBy: { createdAt: 'desc' } });
  return rows.map(serializeProduct);
}

export async function getNewProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { isNew: true }, orderBy: { createdAt: 'desc' } });
  return rows.map(serializeProduct);
}

export async function getSaleProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { isOnSale: true }, orderBy: { createdAt: 'desc' } });
  return rows.map(serializeProduct);
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { categorySlug, id: { not: excludeId } },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serializeProduct);
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}
