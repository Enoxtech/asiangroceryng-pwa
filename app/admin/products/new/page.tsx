'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { slugify } from '@/lib/utils';
import { Product } from '@/types';

const EMPTY: Partial<Product> = {
  name: '', brand: '', categorySlug: '', weight: '', countryOfOrigin: '', countryFlag: '🌏',
  shortDescription: '', description: '', price: undefined, comparePrice: undefined, stockCount: 50,
  storageType: 'dry', spiceLevel: undefined, images: [], ingredients: '', allergens: '', expiryInfo: '',
  inStock: true, isFeatured: false, isNew: false, isOnSale: false, tags: [],
};

export default function NewProductPage() {
  const router = useRouter();
  const { categories, addProduct } = useAdminStore();
  const [form, setForm] = useState<Partial<Product>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name?.trim() || !form.categorySlug || !form.price) {
      setError('Product name, category, and price are required.');
      return;
    }

    const category = categories.find((c) => c.slug === form.categorySlug);
    const slug = slugify(form.name);
    const id = `prod-${slug}-${Date.now().toString(36)}`;

    setLoading(true);
    try {
      await addProduct({
        id,
        name: form.name.trim(),
        slug,
        description: form.description?.trim() || form.shortDescription?.trim() || form.name.trim(),
        shortDescription: form.shortDescription?.trim() || form.name.trim(),
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        images: form.images && form.images.length > 0 ? form.images : [`https://placehold.co/600x600/f8ece8/c41e3a?text=${encodeURIComponent(form.name.trim())}`],
        category: category?.name || '',
        categorySlug: form.categorySlug,
        brand: form.brand?.trim() || '',
        countryOfOrigin: form.countryOfOrigin?.trim() || '',
        countryFlag: form.countryFlag || '🌏',
        weight: form.weight?.trim() || '',
        ingredients: form.ingredients?.trim() || undefined,
        allergens: form.allergens?.trim() || undefined,
        expiryInfo: form.expiryInfo?.trim() || undefined,
        storageType: form.storageType || 'dry',
        spiceLevel: form.spiceLevel || undefined,
        inStock: form.inStock ?? true,
        stockCount: Number(form.stockCount) || 0,
        isFeatured: !!form.isFeatured,
        isNew: !!form.isNew,
        isOnSale: !!form.isOnSale,
        discount: undefined,
        tags: [],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      });
      router.push('/admin/products');
    } catch {
      setError('Could not save product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fieldCls = 'w-full px-4 py-2.5 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]';
  const card = 'rounded-2xl border p-5 space-y-4';
  const cardStyle = { background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' };
  const label = 'block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5';

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-white font-display">Add New Product</h1>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-display">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className={card} style={cardStyle}>
          <h2 className="font-bold text-gray-200 text-sm font-display">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={label}>Product Name *</label>
              <input required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Nongshim Shin Ramyun Bowl" className={fieldCls} />
            </div>
            <div>
              <label className={label}>Brand</label>
              <input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Nongshim" className={fieldCls} />
            </div>
            <div>
              <label className={label}>Category *</label>
              <select required value={form.categorySlug ?? ''} onChange={(e) => set('categorySlug', e.target.value)} className={`${fieldCls} bg-[#0f0e0b]`}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Weight / Size</label>
              <input value={form.weight ?? ''} onChange={(e) => set('weight', e.target.value)} placeholder="e.g. 114g, 500ml, 1kg" className={fieldCls} />
            </div>
            <div>
              <label className={label}>Country of Origin</label>
              <input value={form.countryOfOrigin ?? ''} onChange={(e) => set('countryOfOrigin', e.target.value)} placeholder="e.g. South Korea" className={fieldCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Short Description</label>
              <input value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} placeholder="One-line description shown in product cards" className={fieldCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Full Description</label>
              <textarea rows={4} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Detailed product description..." className={`${fieldCls} resize-none`} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className={card} style={cardStyle}>
          <h2 className="font-bold text-gray-200 text-sm font-display">Product Images</h2>
          <ImageUploader images={form.images ?? []} onChange={(images) => set('images', images)} />
        </div>

        {/* Pricing & Stock */}
        <div className={card} style={cardStyle}>
          <h2 className="font-bold text-gray-200 text-sm font-display">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={label}>Price (₦) *</label>
              <input required type="number" min="0" value={form.price ?? ''} onChange={(e) => set('price', Number(e.target.value))} placeholder="2800" className={fieldCls} />
            </div>
            <div>
              <label className={label}>Compare Price (₦)</label>
              <input type="number" min="0" value={form.comparePrice ?? ''} onChange={(e) => set('comparePrice', e.target.value ? Number(e.target.value) : undefined)} placeholder="3200" className={fieldCls} />
            </div>
            <div>
              <label className={label}>Stock Count</label>
              <input type="number" min="0" value={form.stockCount ?? 0} onChange={(e) => set('stockCount', Number(e.target.value))} placeholder="50" className={fieldCls} />
            </div>
            <div>
              <label className={label}>Storage Type</label>
              <select value={form.storageType ?? 'dry'} onChange={(e) => set('storageType', e.target.value as Product['storageType'])} className={`${fieldCls} bg-[#0f0e0b]`}>
                <option value="dry">Dry / Ambient</option>
                <option value="chilled">Chilled / Refrigerated</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
            <div>
              <label className={label}>Spice Level</label>
              <select value={form.spiceLevel ?? ''} onChange={(e) => set('spiceLevel', (e.target.value || undefined) as Product['spiceLevel'])} className={`${fieldCls} bg-[#0f0e0b]`}>
                <option value="">Not Applicable</option>
                <option value="none">Not Spicy</option>
                <option value="mild">Mild</option>
                <option value="medium">Medium</option>
                <option value="hot">Hot</option>
                <option value="very-hot">Very Hot</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className={card} style={cardStyle}>
          <h2 className="font-bold text-gray-200 text-sm font-display">Product Flags</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              { key: 'inStock', label: 'In Stock' },
              { key: 'isFeatured', label: 'Featured (Best Sellers)' },
              { key: 'isNew', label: 'New Arrival' },
              { key: 'isOnSale', label: 'On Sale' },
            ] as const).map(({ key, label: lbl }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => set(key, e.target.checked as never)}
                  className="w-4 h-4 accent-brand-red"
                />
                <span className="text-sm font-medium text-gray-300 font-display">{lbl}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ingredients & Allergens */}
        <div className={card} style={cardStyle}>
          <h2 className="font-bold text-gray-200 text-sm font-display">Ingredients & Allergens</h2>
          <div>
            <label className={label}>Ingredients</label>
            <textarea rows={3} value={form.ingredients ?? ''} onChange={(e) => set('ingredients', e.target.value)} placeholder="List of ingredients..." className={`${fieldCls} resize-none`} />
          </div>
          <div>
            <label className={label}>Allergens</label>
            <input value={form.allergens ?? ''} onChange={(e) => set('allergens', e.target.value)} placeholder="e.g. Wheat, Soy, Milk" className={fieldCls} />
          </div>
          <div>
            <label className={label}>Best Before / Expiry Info</label>
            <input value={form.expiryInfo ?? ''} onChange={(e) => set('expiryInfo', e.target.value)} placeholder="e.g. 12 months from manufacture" className={fieldCls} />
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {loading ? 'Saving…' : 'Save Product'}
          </button>
          <Link href="/admin/products"
            className="px-6 py-3 rounded-xl text-sm font-medium font-display border text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
