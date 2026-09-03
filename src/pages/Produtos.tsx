import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProductModal } from '@/components/products/ProductModal';
import { formatCurrency } from '@/lib/utils';
import { formatDateBR } from '@/lib/dateUtils';
import { Product } from '@/types';
import {
  Package,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Tag
} from 'lucide-react';

export const Produtos: React.FC = () => {
  const { products } = useBusiness();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.batch_number && p.batch_number.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-600" /> Produtos & Estoque de Insumos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle produtos utilizados nos procedimentos, custos, validade e estoque
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Produto
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produto por nome, marca ou lote..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(prod => {
          const isLowStock = prod.stock_quantity <= (prod.min_stock_alert || 2);

          return (
            <Card
              key={prod.id}
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="default" className="text-[10px] mb-1.5">
                      {prod.category}
                    </Badge>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {prod.name}
                    </h3>
                    {prod.brand && (
                      <span className="text-xs text-slate-400 font-medium">Marca: {prod.brand}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(prod);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* Stock info */}
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estoque</span>
                    <span className={`font-extrabold ${isLowStock ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}`}>
                      {prod.stock_quantity} {prod.unit}
                    </span>
                  </div>
                  {isLowStock && (
                    <span className="flex items-center gap-1 text-amber-600 text-[10px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                    </span>
                  )}
                </div>

                {prod.batch_number && (
                  <div className="text-[11px] text-slate-400 mt-2">
                    Lote: {prod.batch_number} {prod.expiration_date ? `• Val: ${formatDateBR(prod.expiration_date)}` : ''}
                  </div>
                )}
              </div>

              {/* Bottom Price */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Custo Unitário</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(prod.cost_price)}
                  </span>
                </div>
                {prod.sale_price && (
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Venda</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(prod.sale_price)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};
