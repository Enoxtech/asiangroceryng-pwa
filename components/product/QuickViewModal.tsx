'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Plus, Check, Heart, ZoomIn, Star, ShoppingCart } from 'lucide-react';
import { useQuickViewStore } from '@/store/quickViewStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useToastStore } from '@/store/toastStore';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export function QuickViewModal() {
  const { product, close } = useQuickViewStore();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { show: showToast } = useToastStore();

  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  // Reset when product changes
  useEffect(() => {
    if (product) {
      setImgIndex(0);
      setAdded(false);
      setZoomed(false);
      setImgSrc(product.images[0]);
    }
  }, [product]);

  // Sync imgSrc with imgIndex and product
  useEffect(() => {
    if (product?.images[imgIndex]) setImgSrc(product.images[imgIndex]);
  }, [imgIndex, product]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (zoomed) setZoomed(false); else close(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close, zoomed]);

  // Lock body scroll
  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const prevImg = useCallback(() => {
    if (!product) return;
    setImgIndex((p) => (p - 1 + product.images.length) % product.images.length);
  }, [product]);

  const nextImg = useCallback(() => {
    if (!product) return;
    setImgIndex((p) => (p + 1) % product.images.length);
  }, [product]);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!product || !product.inStock) return;
    addItem(product);
    setAdded(true);
    showToast(`${product.name} added to cart`, 'cart', '🛒');
    setTimeout(() => { setAdded(false); openCart(); }, 900);
  }

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : product.discount;
  const hasMultipleImages = product.images.length > 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 animate-fade-in"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={close}
        aria-hidden
      />

      {/* Modal card */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[81] animate-quick-view-in overflow-hidden rounded-[28px] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[680px] lg:w-[820px]"
        style={{ background: 'var(--bg)', boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px var(--border-color)', maxHeight: '90dvh', overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          style={{ background: 'var(--surface-glass-strong)' }}
          aria-label="Close"
        >
          <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>

        <div className="grid sm:grid-cols-2 gap-0">
          {/* Left: Image Gallery */}
          <div className="relative bg-[var(--surface)] flex flex-col">
            {/* Main image */}
            <div
              className="relative aspect-square overflow-hidden cursor-zoom-in group"
              onClick={() => setZoomed(true)}
              title="Click to zoom"
            >
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 410px"
                onError={() => setImgSrc(`https://placehold.co/600x600/f8ece8/c41e3a?text=${encodeURIComponent(product.name)}`)}
                unoptimized
                priority
              />
              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--surface-glass-strong)' }}>
                <ZoomIn className="h-3.5 w-3.5" style={{ color: 'var(--text-secondary)' }} />
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {!product.inStock && <Badge variant="out-of-stock">Out of Stock</Badge>}
                {product.inStock && product.isOnSale && discount && <Badge variant="sale">-{discount}%</Badge>}
                {product.inStock && product.isNew && !product.isOnSale && <Badge variant="new">New</Badge>}
              </div>

              {/* Image nav arrows (only if multiple images) */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ background: 'var(--surface-glass-strong)' }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ background: 'var(--surface-glass-strong)' }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={cn(
                      'relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
                      i === imgIndex ? 'border-[#c41e3a] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                    )}
                    style={{ background: 'var(--surface)' }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/100x100/f8ece8/c41e3a?text=${i + 1}`; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col p-5 sm:p-6 gap-4">
            {/* Brand + country */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest font-label" style={{ color: 'var(--text-muted)' }}>
                {product.brand}
              </span>
              <span className="text-base" title={product.countryOfOrigin}>{product.countryFlag}</span>
            </div>

            {/* Name */}
            <h2 className="text-lg font-bold font-display leading-snug" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className="h-3.5 w-3.5"
                    fill={s <= Math.round(product.rating) ? '#c41e3a' : 'none'}
                    stroke={s <= Math.round(product.rating) ? '#c41e3a' : 'var(--text-muted)'}
                  />
                ))}
              </div>
              <span className="text-xs font-label tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Short description */}
            <p className="text-sm font-display leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {product.shortDescription}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black font-label tabular-nums" style={{ color: '#c41e3a' }}>
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm line-through font-label tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2">
              {product.weight && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-label" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
                  {product.weight}
                </span>
              )}
              {product.storageType !== 'dry' && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-label capitalize" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
                  {product.storageType === 'chilled' ? '❄️ Chilled' : '🧊 Frozen'}
                </span>
              )}
              {product.spiceLevel && product.spiceLevel !== 'none' && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-label capitalize" style={{ background: 'rgba(196,30,58,0.1)', color: '#c41e3a' }}>
                  🌶️ {product.spiceLevel.replace('-', ' ')}
                </span>
              )}
              <span className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-label',
                product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {product.inStock ? `✓ In stock (${product.stockCount})` : 'Out of stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] font-bold text-sm transition-all cursor-pointer',
                  product.inStock
                    ? added
                      ? 'text-white'
                      : 'text-white hover:opacity-90 active:scale-95'
                    : 'opacity-50 cursor-not-allowed'
                )}
                style={{ background: product.inStock ? (added ? '#10B981' : '#c41e3a') : 'var(--surface)' }}
              >
                {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                {added ? 'Added!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                onClick={(e) => { e.preventDefault(); toggleItem(product); }}
                className={cn(
                  'h-12 w-12 shrink-0 flex items-center justify-center rounded-[14px] border transition-all cursor-pointer',
                  wishlisted ? 'border-[#c41e3a] bg-red-50' : 'border-[var(--border-color)] bg-[var(--surface)]'
                )}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={cn('h-4 w-4', wishlisted ? 'fill-[#c41e3a] text-[#c41e3a]' : 'text-[var(--text-muted)]')} />
              </button>
            </div>

            <Link
              href={`/shop/${product.slug}`}
              onClick={close}
              className="text-center text-xs font-semibold font-display underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              View full product details →
            </Link>
          </div>
        </div>
      </div>

      {/* Zoom lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 animate-fade-in cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="Close zoom"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={product.name}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}
