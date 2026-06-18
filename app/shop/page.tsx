'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-[32px] overflow-hidden border border-[var(--border-color)]">
          <div className="aspect-square skeleton" />
          <div className="p-3 space-y-2">
            <div className="h-2 w-1/3 rounded-full skeleton" />
            <div className="h-3 w-4/5 rounded-full skeleton" />
            <div className="h-3 w-3/5 rounded-full skeleton" />
            <div className="flex justify-between items-center mt-2">
              <div className="h-4 w-1/3 rounded-full skeleton" />
              <div className="h-7 w-7 rounded-full skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type SortOption = 'latest' | 'price-asc' | 'price-desc' | 'popular';

function ShopContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('sale') === 'true');
  const [maxPrice, setMaxPrice] = useState(20000);
  const searchQuery = searchParams.get('q') || '';

  const filtered = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    if (selectedCategory) result = result.filter((p) => p.categorySlug === selectedCategory);
    if (selectedTag) result = result.filter((p) => p.tags.includes(selectedTag));
    if (inStockOnly) result = result.filter((p) => p.inStock);
    if (onSaleOnly) result = result.filter((p) => p.isOnSale);
    result = result.filter((p) => p.price <= maxPrice);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'popular': result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [searchQuery, selectedCategory, selectedTag, inStockOnly, onSaleOnly, maxPrice, sortBy]);

  function clearFilters() {
    setSelectedCategory('');
    setSelectedTag('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMaxPrice(20000);
  }

  const hasFilters = selectedCategory || selectedTag || inStockOnly || onSaleOnly || maxPrice < 20000;

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low–High</option>
              <option value="price-desc">Price: High–Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors',
              hasFilters ? 'border-brand-red bg-red-50 text-brand-red' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium"
            >
              {categories.find(c => c.slug === selectedCategory)?.name}
              <X className="h-3 w-3" />
            </button>
          )}
          {inStockOnly && (
            <button onClick={() => setInStockOnly(false)} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              In Stock <X className="h-3 w-3" />
            </button>
          )}
          {onSaleOnly && (
            <button onClick={() => setOnSaleOnly(false)} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              On Sale <X className="h-3 w-3" />
            </button>
          )}
          <button onClick={clearFilters} className="px-3 py-1 text-xs text-gray-500 underline">
            Clear all
          </button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 -mx-1 px-1">
        <button
          onClick={() => setSelectedCategory('')}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
            !selectedCategory ? 'bg-brand-red text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat.slug ? 'bg-brand-red text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      <ProductGrid products={filtered} />

      {/* Filter drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <p className="font-semibold text-sm text-gray-800 mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                        selectedCategory === cat.slug ? 'bg-brand-red text-white border-brand-red' : 'border-gray-200 text-gray-600 hover:border-brand-red'
                      )}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max price */}
              <div>
                <p className="font-semibold text-sm text-gray-800 mb-2">Max Price: ₦{maxPrice.toLocaleString()}</p>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-red"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₦500</span><span>₦20,000</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {[
                  { label: 'In Stock Only', value: inStockOnly, onChange: setInStockOnly },
                  { label: 'On Sale Only', value: onSaleOnly, onChange: setOnSaleOnly },
                ].map(({ label, value, onChange }) => (
                  <label key={label} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <button
                      onClick={() => onChange(!value)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        value ? 'bg-brand-red' : 'bg-gray-200'
                      )}
                    >
                      <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', value && 'translate-x-5')} />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={clearFilters} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Clear All
              </button>
              <button onClick={() => setShowFilters(false)} className="flex-1 py-3 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-red-700">
                Show {filtered.length} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 w-40 rounded-full skeleton mb-2" />
            <div className="h-4 w-24 rounded-full skeleton" />
          </div>
          <div className="h-9 w-28 rounded-xl skeleton" />
        </div>
        <div className="flex gap-2 overflow-hidden mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shrink-0 h-8 w-20 rounded-full skeleton" />
          ))}
        </div>
        <ProductGridSkeleton />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
