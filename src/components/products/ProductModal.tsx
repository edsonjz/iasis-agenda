import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Product } from '@/types';
import { generateUUID } from '@/lib/utils';
import { DataService } from '@/lib/storage';
import { Plus } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { saveProduct, deleteProduct, products } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cílios & Lash');
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [minStockAlert, setMinStockAlert] = useState(2);
  const [unit, setUnit] = useState<'un' | 'ml' | 'g' | 'kit' | 'par'>('un');
  const [expirationDate, setExpirationDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category creation state
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const loadedCategories = DataService.getProductCategories();
    const fromProds = products.map(p => p.category).filter(Boolean);
    const combined = Array.from(new Set([...loadedCategories, ...fromProds]));
    setAvailableCategories(combined);

    if (product) {
      setName(product.name);
      setCategory(product.category || combined[0] || 'Cílios & Lash');
      setBrand(product.brand || '');
      setCostPrice(product.cost_price);
      setSalePrice(product.sale_price);
      setStockQuantity(product.stock_quantity);
      setMinStockAlert(product.min_stock_alert || 2);
      setUnit(product.unit || 'un');
      setExpirationDate(product.expiration_date || '');
      setBatchNumber(product.batch_number || '');
    } else {
      setName('');
      setCategory(combined[0] || 'Cílios & Lash');
      setBrand('');
      setCostPrice(0);
      setSalePrice(undefined);
      setStockQuantity(1);
      setMinStockAlert(2);
      setUnit('un');
      setExpirationDate('');
      setBatchNumber('');
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
  }, [product, isOpen, products]);

  const handleCreateCategory = () => {
    const clean = newCategoryName.trim();
    if (!clean) {
      toastError('Informe o nome da categoria');
      return;
    }
    const updated = DataService.saveProductCategory(clean);
    setAvailableCategories(updated);
    setCategory(clean);
    setNewCategoryName('');
    setIsCreatingCategory(false);
    success(`Categoria "${clean}" criada com sucesso!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome do produto é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      const prodData: Product = {
        id: product?.id || generateUUID(),
        name: name.trim(),
        category,
        brand: brand.trim() || undefined,
        cost_price: costPrice,
        sale_price: salePrice || undefined,
        stock_quantity: stockQuantity,
        min_stock_alert: minStockAlert,
        unit,
        expiration_date: expirationDate || undefined,
        batch_number: batchNumber.trim() || undefined,
        active: true,
        created_at: product?.created_at || new Date().toISOString(),
      };

      await saveProduct(prodData);
      success(product ? 'Produto atualizado!' : 'Produto cadastrado no estoque!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Produto' : 'Novo Produto / Material'}
      subtitle="Cadastre insumos e produtos utilizados nos procedimentos"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Produto / Material"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Adesivo / Cola Master Elite"
          required
        />

        {/* Category Field with Inline Creation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Categoria *
            </label>
            {!isCreatingCategory && (
              <button
                type="button"
                onClick={() => setIsCreatingCategory(true)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Nova Categoria
              </button>
            )}
          </div>

          {isCreatingCategory ? (
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Criar Nova Categoria de Produto / Estoque
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da categoria (ex: Tinturas, Descartáveis...)"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCategory}
                >
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Input
                label="Marca / Fabricante"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Ex: Master, RB Kollors, Nagaraku"
              />
            </div>
          )}
        </div>

        {isCreatingCategory && (
          <div>
            <Input
              label="Marca / Fabricante"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="Ex: Master, RB Kollors, Nagaraku"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Custo Unitário (R$)"
            type="number"
            step="0.01"
            value={costPrice}
            onChange={e => setCostPrice(Number(e.target.value))}
            required
          />
          <Input
            label="Preço de Venda (se aplicável)"
            type="number"
            step="0.01"
            value={salePrice || ''}
            onChange={e => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Opcional"
          />
          <Select
            label="Unidade de Medida"
            value={unit}
            onChange={e => setUnit(e.target.value as any)}
          >
            <option value="un">Unidade (un)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="g">Gramas (g)</option>
            <option value="kit">Kit</option>
            <option value="par">Par</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quantidade em Estoque"
            type="number"
            step="0.1"
            value={stockQuantity}
            onChange={e => setStockQuantity(Number(e.target.value))}
            required
          />
          <Input
            label="Alerta de Estoque Mínimo"
            type="number"
            value={minStockAlert}
            onChange={e => setMinStockAlert(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data de Validade (opcional)"
            type="date"
            value={expirationDate}
            onChange={e => setExpirationDate(e.target.value)}
          />
          <Input
            label="Lote de Fabricação (opcional)"
            value={batchNumber}
            onChange={e => setBatchNumber(e.target.value)}
            placeholder="Ex: LOTE-8842"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {product ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                if (confirm('Deseja excluir este produto do estoque?')) {
                  await deleteProduct(product.id);
                  success('Produto excluído');
                  onClose();
                }
              }}
            >
              Excluir
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
