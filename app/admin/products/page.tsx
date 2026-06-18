import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[140px]">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand} · {p.countryFlag}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{formatPrice(p.price)}</p>
                    {p.comparePrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.comparePrice)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      !p.inStock ? 'bg-red-100 text-red-700' :
                      p.stockCount <= 20 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {!p.inStock ? 'Out of stock' : `${p.stockCount} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1">
                      {p.isFeatured && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Featured</span>}
                      {p.isNew && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">New</span>}
                      {p.isOnSale && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Sale</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 text-gray-400 hover:text-brand-red transition-colors rounded-lg hover:bg-red-50">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
