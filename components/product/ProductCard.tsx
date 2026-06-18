'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useToastStore } from '@/store/toastStore';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { show: showToast } = useToastStore();
  const [added, setAdded] = useState(false);
  const wishlisted = isInWishlist(product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    showToast(`${product.name} added to cart`, 'cart', '🛒');
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 900);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : product.discount;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        'group flex flex-col',
        'rounded-[32px] border border-[var(--border-color)]',
        'bg-[var(--surface-glass)] backdrop-blur-[12px]',
        'card-premium',
        className
      )}
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden rounded-t-[28px] bg-[var(--surface)]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 16vw"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {!product.inStock && <Badge variant="out-of-stock">Out of Stock</Badge>}
          {product.inStock && product.isOnSale && discount && (
            <Badge variant="sale">-{discount}%</Badge>
          )}
          {product.inStock && product.isNew && !product.isOnSale && (
            <Badge variant="new">New</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            'absolute top-2.5 right-2.5 h-8 w-8 flex items-center justify-center rounded-full',
            'bg-[var(--surface-glass-strong)] backdrop-blur-md border border-[var(--border-color)]',
            'transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer',
            wishlisted ? 'text-brand-red' : 'text-[var(--text-muted)] hover:text-brand-red'
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-3.5 w-3.5', wishlisted && 'fill-current')} />
        </button>

        {/* Country flag */}
        <span
          className="absolute bottom-2.5 left-2.5 text-base leading-none"
          title={product.countryOfOrigin}
          role="img"
          aria-label={product.countryOfOrigin}
        >
          {product.countryFlag}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest font-label truncate">
          {product.brand}
        </p>
        <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug flex-1 font-display">
          {product.name}
        </p>

        {/* Price + add to cart */}
        <div className="flex items-center justify-between mt-2 gap-1">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-brand-red font-label text-xs tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-[10px] text-[var(--text-muted)] line-through font-label tabular-nums">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded-full shrink-0',
              'transition-all duration-200 cursor-pointer',
              product.inStock
                ? added
                  ? 'bg-[var(--green)] text-white scale-95'
                  : 'bg-brand-red text-white hover:scale-110 hover:shadow-md active:scale-90'
                : 'bg-[var(--surface)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
            )}
            aria-label={product.inStock ? 'Add to cart' : 'Out of stock'}
          >
            {added
              ? <Check className="h-3 w-3" strokeWidth={3} />
              : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}
