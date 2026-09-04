import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Service, ServiceCategory } from '@/types';
import { generateUUID } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service }) => {
  const { categories, saveCategory, saveService, deleteService } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [isVariablePrice, setIsVariablePrice] = useState(false);
  const [price, setPrice] = useState(150);
  const [promotionalPrice, setPromotionalPrice] = useState<number | undefined>(undefined);
  const [requiresAnamnesis, setRequiresAnamnesis] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Category Creation State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategoryId(service.category_id || categories[0]?.id || '');
      setDescription(service.description || '');
      setDurationMinutes(service.duration_minutes);
      setBufferMinutes(service.buffer_minutes || 0);
      const isZeroPrice = service.price === 0 || service.price === undefined || Number.isNaN(service.price);
      setIsVariablePrice(isZeroPrice);
      setPrice(isZeroPrice ? 0 : service.price);
      setPromotionalPrice(service.promotional_price);
      setRequiresAnamnesis(service.requires_anamnesis ?? true);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setDurationMinutes(60);
      setBufferMinutes(10);
      setIsVariablePrice(false);
      setPrice(150);
      setPromotionalPrice(undefined);
      setRequiresAnamnesis(true);
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
  }, [service, isOpen, categories]);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) {
      toastError('Informe o nome da categoria');
      return;
    }

    try {
      setIsSavingCategory(true);
      const newCat: ServiceCategory = {
        id: generateUUID(),
        name: cleanName,
        color: '#bf3f57',
        sort_order: categories.length + 1,
        active: true,
      };

      await saveCategory(newCat);
      setCategoryId(newCat.id);
      setNewCategoryName('');
      setIsCreatingCategory(false);
      success(`Categoria "${cleanName}" criada com sucesso!`);
    } catch (err) {
      console.error(err);
      toastError('Erro ao criar categoria.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome do serviço é obrigatório');
      return;
    }

    if (!isVariablePrice && price <= 0) {
      toastError('Preço deve ser maior que zero ou marque a opção "Definir valor após o procedimento"');
      return;
    }

    try {
      setIsSubmitting(true);
      const finalPrice = isVariablePrice ? 0 : price;
      const finalPromo = isVariablePrice ? undefined : (promotionalPrice || undefined);

      const serviceData: Service = {
        id: service?.id || generateUUID(),
        name: name.trim(),
        category_id: categoryId || undefined,
        description: description.trim() || undefined,
        duration_minutes: durationMinutes,
        buffer_minutes: bufferMinutes,
        price: finalPrice,
        promotional_price: finalPromo,
        requires_anamnesis: requiresAnamnesis,
        active: true,
      };

      await saveService(serviceData);
      success(service ? 'Procedimento atualizado!' : 'Procedimento cadastrado!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar procedimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    if (confirm(`Deseja excluir o procedimento "${service.name}"?`)) {
      await deleteService(service.id);
      success('Procedimento excluído');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Editar Procedimento' : 'Novo Procedimento'}
      subtitle="Defina o nome, categoria, duração e valores do serviço"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Procedimento"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Extensão Volume Brasileiro"
          required
        />

        {/* Category Field with Inline Creation */}
        <div>
          <div className="flex items-center justify-between mb-1">
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
                Criar Nova Categoria de Procedimento
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da categoria (ex: Massagens, Sobrancelhas...)"
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
                  onClick={() => handleCreateCategory()}
                  loading={isSavingCategory}
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
            <Select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Descrição do Procedimento
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Aplicação de fios delicados em formato Y..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Duração em Minutos"
            type="number"
            min={15}
            step={15}
            value={durationMinutes}
            onChange={e => setDurationMinutes(Number(e.target.value))}
            required
          />
          <Input
            label="Intervalo / Buffer (minutos)"
            type="number"
            min={0}
            step={5}
            value={bufferMinutes}
            onChange={e => setBufferMinutes(Number(e.target.value))}
          />
        </div>

        {/* Pricing Section with Variable / Post-procedure Price Option */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Precificação
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isVariablePrice}
                onChange={e => {
                  setIsVariablePrice(e.target.checked);
                  if (e.target.checked) {
                    setPrice(0);
                    setPromotionalPrice(undefined);
                  } else if (price === 0) {
                    setPrice(150);
                  }
                }}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Definir valor após o procedimento (sem valor fixo)
              </span>
            </label>
          </div>

          {isVariablePrice ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">⭐ Valor Aberto:</span> Este procedimento não terá preço fixo pré-definido. O valor cobrado poderá ser inserido livremente durante ou após o atendimento na agenda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Preço Padrão (R$)"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                required={!isVariablePrice}
              />
              <Input
                label="Preço Promocional (opcional)"
                type="number"
                step="0.01"
                value={promotionalPrice || ''}
                onChange={e => setPromotionalPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 120.00"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="requiresAnamnesis"
            checked={requiresAnamnesis}
            onChange={e => setRequiresAnamnesis(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
          />
          <label htmlFor="requiresAnamnesis" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            Exige preenchimento prévio de Ficha de Anamnese
          </label>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {service ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Excluir Serviço
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              Salvar Procedimento
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
