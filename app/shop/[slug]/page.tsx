'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Zap, MessageCircle, HelpCircle, ChevronDown, ChevronUp, Star, Truck, RotateCcw, Thermometer } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { formatPrice, getWhatsAppOrderUrl, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useToastStore } from '@/store/toastStore';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const SEED_REVIEWS: Record<string, Review[]> = {
  default: [
    { id: 'r1', name: 'Amara O.', rating: 5, comment: 'Absolutely love this product! Arrived well-packaged and tasted authentic.', date: '2024-06-10' },
    { id: 'r2', name: 'Femi A.', rating: 4, comment: 'Good quality, will order again. Delivery was fast!', date: '2024-05-28' },
    { id: 'r3', name: 'Chioma E.', rating: 5, comment: 'Exactly as described. Great taste and value for money.', date: '2024-05-15' },
  ],
};

const storageLabels = {
  dry: { label: 'Dry Storage', color: 'text-amber-700 bg-amber-50', icon: '📦' },
  chilled: { label: 'Keep Chilled', color: 'text-blue-700 bg-blue-50', icon: '❄️' },
  frozen: { label: 'Keep Frozen', color: 'text-indigo-700 bg-indigo-50', icon: '🧊' },
};

const spiceLabels = {
  none: { label: 'Not Spicy', emoji: '🟢' },
  mild: { label: 'Mild', emoji: '🟡' },
  medium: { label: 'Medium', emoji: '🟠' },
  hot: { label: 'Hot', emoji: '🔴' },
  'very-hot': { label: 'Very Hot', emoji: '🌶️🌶️' },
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { products, hydrated } = useAdminStore();
  const product = products.find((p) => p.slug === slug);

  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addItem: addRecentlyViewed } = useRecentlyViewedStore();
  const { show: showToast } = useToastStore();
  const [qty, setQty] = useState(1);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) return;
    const stored = localStorage.getItem(`agng-reviews-${product.id}`);
    setReviews(stored ? JSON.parse(stored) : (SEED_REVIEWS[product.id] ?? SEED_REVIEWS.default));
  }, [product?.id]);

  const submitReview = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewForm.name.trim() || !reviewForm.comment.trim()) return;
    setSubmittingReview(true);
    const newReview: Review = {
      id: Date.now().toString(),
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`agng-reviews-${product.id}`, JSON.stringify(updated));
    setReviewForm({ name: '', rating: 5, comment: '' });
    setSubmittingReview(false);
    showToast('Review submitted! Thank you 🙏', 'success');
  }, [reviewForm, reviews, product, showToast]);

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');

  if (!hydrated) {
    return <div className="min-h-[60vh]" />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="text-6xl">🍜</div>
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/shop" className="px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const wishlisted = isInWishlist(product.id);

  const storage = storageLabels[product.storageType];
  const spice = product.spiceLevel ? spiceLabels[product.spiceLevel] : null;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : product.discount;

  function handleAddToCart() {
    addItem(product!, qty);
    showToast(`${qty > 1 ? `${qty}×` : ''} ${product!.name} added to cart`, 'cart', '🛒');
    openCart();
  }

  function handleBuyNow() {
    addItem(product!, qty);
    router.push('/checkout');
  }

  function toggleSection(id: string) {
    setExpandedSection(expandedSection === id ? null : id);
  }

  const detailRows = [
    product.weight && { label: 'Weight / Size', value: product.weight },
    product.brand && { label: 'Brand', value: product.brand },
    { label: 'Country of Origin', value: `${product.countryFlag} ${product.countryOfOrigin}` },
    product.allergens && { label: 'Allergens', value: product.allergens },
    product.expiryInfo && { label: 'Best Before', value: product.expiryInfo },
    { label: 'Storage', value: `${storage.icon} ${storage.label}` },
    spice && { label: 'Spice Level', value: `${spice.emoji} ${spice.label}` },
  ].filter(Boolean) as { label: string; value: string }[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://asiangroceryng.com/shop/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Image gallery */}
        <div className="mb-6 lg:mb-0">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
            {product.isOnSale && discount && (
              <div className="absolute top-3 left-3">
                <Badge variant="sale">-{discount}% OFF</Badge>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors',
                    activeImage === i ? 'border-brand-red' : 'border-transparent'
                  )}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-gray-600">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-gray-600">{product.category}</Link>
          </nav>

          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm text-gray-500 font-medium">{product.brand} · {product.countryFlag} {product.countryOfOrigin}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>
            </div>
            <button
              onClick={() => toggleItem(product)}
              className={cn('p-2 rounded-full border transition-all shrink-0', wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400')}
            >
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-current')} />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('h-4 w-4', i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-brand-red">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          {/* Stock status & storage */}
          <div className="flex flex-wrap gap-2 mb-5">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                ✓ In Stock ({product.stockCount} left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold">
                Out of Stock
              </span>
            )}
            <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium', storage.color)}>
              {storage.icon} {storage.label}
            </span>
            {spice && spice.label !== 'Not Spicy' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                {spice.emoji} {spice.label}
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.shortDescription}</p>

          {/* Quantity + Cart */}
          {product.inStock && (
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 font-bold">−</button>
                <span className="w-10 h-12 flex items-center justify-center font-semibold text-gray-900">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 font-bold">+</button>
              </div>
              <Button onClick={handleAddToCart} size="lg" className="flex-1">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart · {formatPrice(product.price * qty)}
              </Button>
            </div>
          )}

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {product.inStock && (
              <Button onClick={handleBuyNow} variant="outline" size="md" className="w-full">
                <Zap className="h-4 w-4" /> Buy Now
              </Button>
            )}
            <a href={getWhatsAppOrderUrl(product.name, product.price)} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="md" className="w-full">
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </Button>
            </a>
            <a href={getWhatsAppOrderUrl(`Question about: ${product.name}`, 0)} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="md" className="w-full border border-gray-200">
                <HelpCircle className="h-4 w-4" /> Ask a Question
              </Button>
            </a>
          </div>

          {/* Delivery & returns */}
          <div className="space-y-2 mb-6">
            <div className="flex items-start gap-2.5 p-3 bg-green-50 rounded-xl text-sm">
              <Truck className="h-4 w-4 text-green-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Delivery across Nigeria</p>
                <p className="text-green-700">Lagos: 1–2 business days · Outside Lagos: 2–4 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl text-sm">
              <RotateCcw className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-amber-700">Due to the perishable nature of grocery products, we cannot accept returns. Items are checked before dispatch.</p>
            </div>
          </div>

          {/* Accordion sections */}
          {[
            {
              id: 'details',
              title: 'Product Details',
              content: (
                <div className="divide-y divide-gray-100">
                  {detailRows.map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 text-sm">
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className="text-gray-800 text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            product.ingredients && {
              id: 'ingredients',
              title: 'Ingredients',
              content: <p className="text-sm text-gray-600 leading-relaxed">{product.ingredients}</p>,
            },
            {
              id: 'description',
              title: 'Full Description',
              content: <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>,
            },
          ].filter(Boolean).map((section) => {
            if (!section) return null;
            const { id, title, content } = section as { id: string; title: string; content: React.ReactNode };
            const open = expandedSection === id;
            return (
              <div key={id} className="border-t border-gray-100">
                <button
                  onClick={() => toggleSection(id)}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-800 hover:text-brand-red transition-colors"
                >
                  {title}
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {open && <div className="pb-4">{content}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── REVIEWS ─────────────────────────────────────────────── */}
      <section className="mt-12 border-t border-[var(--border-color)] pt-8">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
                ))}
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-[var(--text-muted)]">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>

        {/* Review list */}
        <div className="space-y-4 mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)] font-display">{review.name}</p>
                  <p className="text-xs text-[var(--text-muted)] font-display">{new Date(review.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-display">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Write a review */}
        <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)]">
          <h3 className="font-bold text-[var(--text-primary)] mb-4 font-display">Write a Review</h3>
          <form onSubmit={submitReview} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 font-label uppercase tracking-wider">Your Name *</label>
                <input
                  type="text"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Amara Okafor"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-red font-display"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 font-label uppercase tracking-wider">Rating *</label>
                <div className="flex items-center gap-1 py-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={cn('h-6 w-6', star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300')} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 font-label uppercase tracking-wider">Your Review *</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                required
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-red resize-none font-display"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-full bg-brand-red text-white text-sm font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 font-display"
            >
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 font-display">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
