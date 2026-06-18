'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const { products, deleteProduct } = useAdminStore();
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deleteProduct(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, categories..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200"
          style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.08)' }}
        />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Price</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500 hidden lg:table-cell">Flags</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#0f0e0b] shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/1a1814/c41e3a?text=${p.name[0]}`; }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-200 truncate max-w-[160px] font-display text-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-500 font-label">{p.brand} · {p.countryFlag}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-display hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-200 text-xs font-label tabular-nums">{formatPrice(p.price)}</p>
                    {p.comparePrice && <p className="text-[10px] text-gray-600 line-through font-label tabular-nums">{formatPrice(p.comparePrice)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-label ${
                      !p.inStock ? 'bg-red-500/15 text-red-400' :
                      p.stockCount <= 20 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-green-500/15 text-green-400'
                    }`}>
                      {!p.inStock ? 'Out of stock' : `${p.stockCount} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {p.isFeatured && <span className="px-1.5 py-0.5 bg-blue-500/15 text-blue-400 text-[10px] rounded font-label">Featured</span>}
                      {p.isNew && <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 text-[10px] rounded font-label">New</span>}
                      {p.isOnSale && <span className="px-1.5 py-0.5 bg-red-500/15 text-red-400 text-[10px] rounded font-label">Sale</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className={`p-1.5 transition-colors rounded-lg cursor-pointer ${
                          confirmDelete === p.id
                            ? 'text-red-400 bg-red-500/15 animate-pulse'
                            : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                        title={confirmDelete === p.id ? 'Click again to confirm delete' : 'Delete product'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm font-display">No products match &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
