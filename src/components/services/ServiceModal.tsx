import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Service } from '@/types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service }) => {
  const { categories, saveService } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [price, setPrice] = useState(150);
  const [promotionalPrice, setPromotionalPrice] = useState<number | undefined>(undefined);
  const [requiresAnamnesis, setRequiresAnamnesis] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategoryId(service.category_id || categories[0]?.id || '');
      setDescription(service.description || '');
      setDurationMinutes(service.duration_minutes);
      setBufferMinutes(service.buffer_minutes || 0);
      setPrice(service.price);
      setPromotionalPrice(service.promotional_price);
      setRequiresAnamnesis(service.requires_anamnesis ?? true);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setDurationMinutes(60);
      setBufferMinutes(10);
      setPrice(150);
      setPromotionalPrice(undefined);
      setRequiresAnamnesis(true);
    }
  }, [service, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome do serviço é obrigatório');
      return;
    }
    if (price <= 0) {
      toastError('Preço deve ser maior que zero');
      return;
    }

    try {
      setIsSubmitting(true);
      const serviceData: Service = {
        id: service?.id || Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        category_id: categoryId || undefined,
        description: description.trim() || undefined,
        duration_minutes: durationMinutes,
        buffer_minutes: bufferMinutes,
        price,
        promotional_price: promotionalPrice || undefined,
        requires_anamnesis: requiresAnamnesis,
        active: true,
      };

      await saveService(serviceData);
      success(service ? 'Serviço atualizado!' : 'Serviço cadastrado!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar serviço.');
    } finally {
      setIsSubmitting(false);
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

        <Select
          label="Categoria"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Preço Padrão (R$)"
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            required
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

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Salvar Procedimento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
