/**
 * One-off migration: pulls all products from the live WooCommerce store
 * (asiangroceryng.com) via its REST API, downloads + re-hosts images on
 * Cloudflare R2, and upserts everything into our Postgres database.
 *
 * Read-only against WooCommerce — never writes back to the WordPress site.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/migrate-woocommerce.ts --limit=5   (test run)
 *   npx tsx --env-file=.env scripts/migrate-woocommerce.ts            (full run)
 *   npx tsx --env-file=.env scripts/migrate-woocommerce.ts --force-images  (re-upload images even for already-migrated products)
 */
import { prisma } from '../lib/prisma';
import { uploadToR2 } from '../lib/r2';

const FORCE_IMAGES = process.argv.includes('--force-images');

const WC_BASE = 'https://asiangroceryng.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_fc27cad821f8e449688c3b17712e605b45fcdb1b';
const CONSUMER_SECRET = 'cs_de45a6723e6baf3261a4ce2040dece1bb0bc5518';

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

interface WCImage {
  src: string;
}
interface WCCategory {
  id: number;
  name: string;
  slug: string;
}
interface WCProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: string;
  weight: string;
  featured: boolean;
  categories: WCCategory[];
  images: WCImage[];
  tags: { name: string }[];
  brands?: { name: string }[];
  average_rating: string;
  rating_count: number;
  date_created: string;
}

const CATEGORY_MAP: Record<string, string> = {
  boba: 'boba',
  chopsticks: 'chopsticks',
  cookwares: 'cookwares',
  drinks: 'drinks',
  beverages: 'drinks',
  'fresh-produce': 'fresh-produce',
  'frozen-products': 'frozen-products',
  frozen: 'frozen-products',
  grains: 'grains',
  molds: 'molds',
  'noodles-ramen': 'noodles-ramen',
  'pantry-staples': 'pantry-staples',
  'sauces-and-condiments': 'sauces-condiments',
  snacks: 'snacks',
  wholesale: 'wholesale',
  healthcare: 'healthcare',
  dairy: 'dairy',
  uncategorized: 'uncategorized',
};

const NEW_CATEGORIES = [
  { id: 'cat-healthcare', name: 'Healthcare', slug: 'healthcare', emoji: '🏥', description: 'Health and wellness products.' },
  { id: 'cat-dairy', name: 'Dairy', slug: 'dairy', emoji: '🥛', description: 'Milk, cheese, yogurt and other dairy products.' },
  { id: 'cat-uncategorized', name: 'Uncategorized', slug: 'uncategorized', emoji: '📦', description: 'Migrated products awaiting a proper category — please review and reassign.' },
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;|&#8221;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8230;|&hellip;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

async function wcFetch<T>(path: string): Promise<T> {
  const url = `${WC_BASE}${path}${path.includes('?') ? '&' : '?'}consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WC API ${res.status}: ${path}`);
  return res.json();
}

async function fetchAllProducts(): Promise<WCProduct[]> {
  const all: WCProduct[] = [];
  let page = 1;
  while (all.length < LIMIT) {
    const batch = await wcFetch<WCProduct[]>(`/products?per_page=100&page=${page}&status=publish`);
    if (batch.length === 0) break;
    all.push(...batch);
    console.log(`  fetched page ${page} (${all.length} products so far)`);
    page++;
    if (batch.length < 100) break;
  }
  return all.slice(0, LIMIT === Infinity ? undefined : LIMIT);
}

async function uploadImage(srcUrl: string, productId: string, index: number): Promise<string | null> {
  try {
    const res = await fetch(srcUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://asiangroceryng.com/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    if (!res.ok) {
      console.error(`  image fetch ${res.status} for ${srcUrl}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = srcUrl.split('.').pop()?.split('?')[0]?.slice(0, 4) || 'jpg';
    const url = await uploadToR2(`products/${productId}/${index}.${ext}`, buffer, res.headers.get('content-type') || undefined);
    return url;
  } catch (err) {
    console.error(`  image upload failed for ${srcUrl}:`, (err as Error).message);
    return null;
  }
}

function resolveCategory(wcCategories: WCCategory[]): { name: string; slug: string } {
  for (const c of wcCategories) {
    const mapped = CATEGORY_MAP[c.slug];
    if (mapped) {
      const found = [...NEW_CATEGORIES].find((n) => n.slug === mapped);
      return { name: found?.name ?? c.name, slug: mapped };
    }
  }
  return { name: 'Uncategorized', slug: 'uncategorized' };
}

function inferStorageType(categorySlug: string): string {
  if (categorySlug === 'frozen-products') return 'frozen';
  if (categorySlug === 'fresh-produce' || categorySlug === 'dairy') return 'chilled';
  return 'dry';
}

async function ensureCategoriesExist() {
  for (const cat of NEW_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: `https://placehold.co/300x300/e8e0f4/3a1a6a?text=${encodeURIComponent(cat.name)}`,
        description: cat.description,
        productCount: 0,
        emoji: cat.emoji,
      },
    });
  }
  console.log('Ensured new categories exist: healthcare, dairy, uncategorized');
}

async function migrateProduct(wc: WCProduct, index: number, total: number) {
  const id = `wc-${wc.id}`;
  console.log(`[${index + 1}/${total}] ${wc.name} (id=${id})`);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (existing && existing.images.length > 0 && !FORCE_IMAGES) {
    console.log('  already migrated, skipping');
    return;
  }

  const { name: categoryName, slug: categorySlug } = resolveCategory(wc.categories);

  const regularPrice = parseFloat(wc.regular_price || wc.price || '0') || 0;
  const salePrice = wc.on_sale && wc.sale_price ? parseFloat(wc.sale_price) : null;
  const price = salePrice ?? regularPrice;
  const comparePrice = salePrice && regularPrice > salePrice ? regularPrice : undefined;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : undefined;

  const description = stripHtml(wc.description) || stripHtml(wc.short_description) || wc.name;
  const shortDescription = stripHtml(wc.short_description) || description.slice(0, 150);

  // Upload images sequentially per product (keeps overall concurrency bounded across products in the caller)
  const imageUrls: string[] = [];
  for (let i = 0; i < wc.images.length; i++) {
    const uploaded = await uploadImage(wc.images[i].src, id, i);
    if (uploaded) imageUrls.push(uploaded);
  }
  if (imageUrls.length === 0) {
    imageUrls.push(`https://placehold.co/600x600/f8ece8/c41e3a?text=${encodeURIComponent(wc.name)}`);
  }

  const data = {
    name: wc.name,
    slug: wc.slug,
    description,
    shortDescription,
    price,
    comparePrice,
    images: imageUrls,
    category: categoryName,
    categorySlug,
    brand: wc.brands?.[0]?.name || 'Asian Grocery NG',
    countryOfOrigin: '',
    countryFlag: '🌏',
    weight: wc.weight ? `${wc.weight}g` : '',
    storageType: inferStorageType(categorySlug),
    inStock: wc.stock_status === 'instock',
    stockCount: wc.stock_quantity ?? (wc.stock_status === 'instock' ? 50 : 0),
    isFeatured: wc.featured,
    isNew: false,
    isOnSale: wc.on_sale,
    discount,
    tags: wc.tags.map((t) => t.name.toLowerCase()),
    rating: parseFloat(wc.average_rating) || 0,
    reviewCount: wc.rating_count || 0,
    createdAt: new Date(wc.date_created),
  };

  await prisma.product.upsert({
    where: { id },
    update: data,
    create: { id, ...data },
  });
  console.log(`  saved with ${imageUrls.length} image(s), category=${categorySlug}`);
}

async function recalculateCategoryProductCounts() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const count = await prisma.product.count({ where: { categorySlug: cat.slug } });
    await prisma.category.update({ where: { id: cat.id }, data: { productCount: count } });
  }
  console.log('Recalculated category product counts');
}

async function main() {
  console.log(`Starting WooCommerce migration${LIMIT !== Infinity ? ` (limited to ${LIMIT} products)` : ''}${FORCE_IMAGES ? ' [force-images]' : ''}...`);

  await ensureCategoriesExist();

  console.log('Fetching products from WooCommerce...');
  const products = await fetchAllProducts();
  console.log(`Fetched ${products.length} products total. Migrating...`);

  let success = 0;
  let failed = 0;
  for (let i = 0; i < products.length; i++) {
    try {
      await migrateProduct(products[i], i, products.length);
      success++;
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${products[i].name}`, (err as Error).message);
    }
  }

  await recalculateCategoryProductCounts();

  console.log(`\nDone. ${success} succeeded, ${failed} failed out of ${products.length}.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Migration crashed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
