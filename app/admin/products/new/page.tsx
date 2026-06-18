'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { categories } from '@/data/categories';
import { Button } from '@/components/ui/Button';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: Save to Supabase
    await new Promise((r) => setTimeout(r, 1000));
    alert('Product saved! (Supabase integration coming in Phase 2)');
    router.push('/admin/products');
  }

  const fieldClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red';

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-800">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
              <input required placeholder="e.g. Nongshim Shin Ramyun Bowl" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
              <input placeholder="e.g. Nongshim" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select required className={`${fieldClass} bg-white`}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Weight / Size</label>
              <input placeholder="e.g. 114g, 500ml, 1kg" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Country of Origin</label>
              <input placeholder="e.g. South Korea" className={fieldClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
              <input placeholder="One-line description shown in product cards" className={fieldClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Description</label>
              <textarea rows={4} placeholder="Detailed product description..." className={`${fieldClass} resize-none`} />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-800">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₦) *</label>
              <input required type="number" min="0" placeholder="2800" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Compare Price (₦)</label>
              <input type="number" min="0" placeholder="3200" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Count</label>
              <input type="number" min="0" placeholder="50" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Storage Type</label>
              <select className={`${fieldClass} bg-white`}>
                <option value="dry">Dry / Ambient</option>
                <option value="chilled">Chilled / Refrigerated</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Spice Level</label>
              <select className={`${fieldClass} bg-white`}>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-800">Product Flags</h2>
          {[
            { name: 'featured', label: 'Featured (show in Best Sellers)' },
            { name: 'isNew', label: 'New Arrival' },
            { name: 'isOnSale', label: 'On Sale' },
            { name: 'inStock', label: 'In Stock', defaultChecked: true },
          ].map(({ name, label, defaultChecked }) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={defaultChecked} className="w-4 h-4 accent-brand-red" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {/* Nutrition */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-800">Ingredients & Allergens</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredients</label>
            <textarea rows={3} placeholder="List of ingredients..." className={`${fieldClass} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Allergens</label>
            <input placeholder="e.g. Wheat, Soy, Milk" className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Best Before / Expiry Info</label>
            <input placeholder="e.g. 12 months from manufacture" className={fieldClass} />
          </div>
        </div>

        {/* TODO: Image upload */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-semibold text-amber-800">📸 Image Upload</p>
          <p className="text-sm text-amber-600 mt-1">Image upload via Supabase Storage is coming in Phase 2. For now, enter image URLs manually.</p>
          <input placeholder="Image URL (e.g. https://placehold.co/600x600)" className={`${fieldClass} mt-3 bg-white`} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg" className="flex-1">Save Product</Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
