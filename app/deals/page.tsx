import { Tag } from 'lucide-react';
import { getSaleProducts } from '@/data/products';
import { ProductGrid } from '@/components/product/ProductGrid';

export default function DealsPage() {
  const deals = getSaleProducts();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Tag className="h-5 w-5 text-brand-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔥 Deals of the Week</h1>
          <p className="text-sm text-gray-500">{deals.length} products on sale right now</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-red to-red-700 rounded-2xl p-4 mb-6 text-white">
        <p className="font-bold text-lg">Limited time offers!</p>
        <p className="text-red-200 text-sm">Stock is limited. Grab yours before it runs out.</p>
      </div>

      <ProductGrid products={deals} />
    </div>
  );
}
