import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Product } from '@/types';

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
  const { saveProduct, deleteProduct } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cílios');
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [minStockAlert, setMinStockAlert] = useState(2);
  const [unit, setUnit] = useState<'un' | 'ml' | 'g' | 'kit' | 'par'>('un');
  const [expirationDate, setExpirationDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || 'Cílios');
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
      setCategory('Cílios');
      setBrand('');
      setCostPrice(0);
      setSalePrice(undefined);
      setStockQuantity(1);
      setMinStockAlert(2);
      setUnit('un');
      setExpirationDate('');
      setBatchNumber('');
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome do produto é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      const prodData: Product = {
        id: product?.id || `prd_${Date.now()}`,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Categoria"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="Cílios">Cílios & Lash</option>
            <option value="Micropigmentação">Micropigmentação</option>
            <option value="Lábios">Lábios</option>
            <option value="Sobrancelhas">Sobrancelhas</option>
            <option value="Facial">Tratamentos Faciais</option>
            <option value="Descartáveis">Descartáveis & Higiene</option>
            <option value="Home Care">Venda Home Care</option>
          </Select>

          <Input
            label="Marca / Fabricante"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="Ex: Master, RB Kollors, Nagaraku"
          />
        </div>

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
