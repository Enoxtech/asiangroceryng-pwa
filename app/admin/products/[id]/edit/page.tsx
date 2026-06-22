'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { Product } from '@/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { products, categories, updateProduct } = useAdminStore();
  const product = products.find((p) => p.id === id);

  const [form, setForm] = useState<Partial<Product>>({});
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (product) setForm(product);
  }, [product]);

  if (!mounted) return null;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400 font-display">Product not found.</p>
        <Link href="/admin/products" className="text-brand-red text-sm font-semibold hover:opacity-75 font-display">← Back to Products</Link>
      </div>
    );
  }

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name || !form.price) return;
    updateProduct(id, form);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/admin/products'); }, 1200);
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
        <div>
          <h1 className="text-lg font-bold text-white font-display">Edit Product</h1>
          <p className="text-xs text-gray-500 font-display truncate max-w-xs">{product.name}</p>
        </div>
      </div>

      {/* Basic info */}
      <div className={card} style={cardStyle}>
        <h2 className="font-bold text-gray-200 text-sm font-display">Basic Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Product Name *</label>
            <input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={label}>Brand</label>
            <input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={label}>Category</label>
            <select value={form.categorySlug ?? ''} onChange={(e) => {
              const cat = categories.find((c) => c.slug === e.target.value);
              if (cat) set('categorySlug', cat.slug);
              if (cat) set('category', cat.name);
            }} className={`${fieldCls} bg-[#0f0e0b]`}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Weight / Size</label>
            <input value={form.weight ?? ''} onChange={(e) => set('weight', e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={label}>Country of Origin</label>
            <input value={form.countryOfOrigin ?? ''} onChange={(e) => set('countryOfOrigin', e.target.value)} className={fieldCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Short Description</label>
            <input value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} className={fieldCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Full Description</label>
            <textarea rows={4} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} className={`${fieldCls} resize-none`} />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className={card} style={cardStyle}>
        <h2 className="font-bold text-gray-200 text-sm font-display">Product Images</h2>
        {(form.images ?? []).map((url, i) => (
          <div key={i} className="flex gap-2 items-center">
            <label className="text-[10px] font-label text-gray-500 w-8 shrink-0">#{i + 1}</label>
            <input
              value={url}
              onChange={(e) => {
                const imgs = [...(form.images ?? [])];
                imgs[i] = e.target.value;
                set('images', imgs);
              }}
              className={`${fieldCls} flex-1`}
              placeholder="https://images.unsplash.com/..."
            />
            {i > 0 && (
              <button onClick={() => set('images', (form.images ?? []).filter((_, j) => j !== i))}
                className="text-gray-500 hover:text-red-400 text-xs font-label cursor-pointer px-2 py-1 rounded">✕</button>
            )}
          </div>
        ))}
        <button onClick={() => set('images', [...(form.images ?? []), ''])}
          className="text-xs text-brand-red hover:opacity-75 font-label font-semibold cursor-pointer">
          + Add Image URL
        </button>
      </div>

      {/* Pricing & Stock */}
      <div className={card} style={cardStyle}>
        <h2 className="font-bold text-gray-200 text-sm font-display">Pricing & Stock</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Price (₦) *</label>
            <input type="number" min="0" value={form.price ?? ''} onChange={(e) => set('price', Number(e.target.value))} className={fieldCls} />
          </div>
          <div>
            <label className={label}>Compare Price (₦)</label>
            <input type="number" min="0" value={form.comparePrice ?? ''} onChange={(e) => set('comparePrice', e.target.value ? Number(e.target.value) : undefined)} className={fieldCls} />
          </div>
          <div>
            <label className={label}>Stock Count</label>
            <input type="number" min="0" value={form.stockCount ?? 0} onChange={(e) => set('stockCount', Number(e.target.value))} className={fieldCls} />
          </div>
          <div>
            <label className={label}>Storage Type</label>
            <select value={form.storageType ?? 'dry'} onChange={(e) => set('storageType', e.target.value as Product['storageType'])} className={`${fieldCls} bg-[#0f0e0b]`}>
              <option value="dry">Dry / Ambient</option>
              <option value="chilled">Chilled</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
          <div>
            <label className={label}>Spice Level</label>
            <select value={form.spiceLevel ?? ''} onChange={(e) => set('spiceLevel', e.target.value as Product['spiceLevel'])} className={`${fieldCls} bg-[#0f0e0b]`}>
              <option value="">Not Applicable</option>
              <option value="none">None</option>
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
                checked={!!(form[key])}
                onChange={(e) => set(key, e.target.checked as never)}
                className="w-4 h-4 accent-brand-red"
              />
              <span className="text-sm font-medium text-gray-300 font-display">{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergens */}
      <div className={card} style={cardStyle}>
        <h2 className="font-bold text-gray-200 text-sm font-display">Ingredients & Allergens</h2>
        <div className="space-y-3">
          <div>
            <label className={label}>Ingredients</label>
            <textarea rows={3} value={form.ingredients ?? ''} onChange={(e) => set('ingredients', e.target.value)} className={`${fieldCls} resize-none`} />
          </div>
          <div>
            <label className={label}>Allergens</label>
            <input value={form.allergens ?? ''} onChange={(e) => set('allergens', e.target.value)} className={fieldCls} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-8">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer"
          style={{ background: saved ? '#10B981' : '#c41e3a' }}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved! Redirecting…' : 'Save Changes'}
        </button>
        <Link href="/admin/products"
          className="px-6 py-3 rounded-xl text-sm font-medium font-display border text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
