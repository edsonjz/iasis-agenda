import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Promotion } from '@/types';
import { addDays, format } from 'date-fns';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: Promotion | null;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  promotion,
}) => {
  const { savePromotion, deletePromotion, services } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [serviceId, setServiceId] = useState('');
  const [minSpend, setMinSpend] = useState(0);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (promotion) {
      setName(promotion.name);
      setCode(promotion.code || '');
      setDiscountType(promotion.discount_type);
      setDiscountValue(promotion.discount_value);
      setServiceId(promotion.service_id || '');
      setMinSpend(promotion.min_spend || 0);
      setStartDate(promotion.start_date);
      setEndDate(promotion.end_date);
    } else {
      setName('');
      setCode('');
      setDiscountType('percentage');
      setDiscountValue(15);
      setServiceId('');
      setMinSpend(0);
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEndDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
    }
  }, [promotion, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome da promoção é obrigatório');
      return;
    }
    if (discountValue <= 0) {
      toastError('Valor do desconto deve ser maior que zero');
      return;
    }

    try {
      setIsSubmitting(true);
      const promoData: Promotion = {
        id: promotion?.id || `pro_${Date.now()}`,
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        service_id: serviceId || undefined,
        min_spend: minSpend || undefined,
        start_date: startDate,
        end_date: endDate,
        usage_count: promotion?.usage_count || 0,
        active: true,
        created_at: promotion?.created_at || new Date().toISOString(),
      };

      await savePromotion(promoData);
      success(promotion ? 'Promoção atualizada!' : 'Promoção criada com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar promoção.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!promotion) return;
    if (confirm(`Deseja excluir a promoção "${promotion.name}"?`)) {
      await deletePromotion(promotion.id);
      success('Promoção excluída');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Editar Promoção' : 'Nova Promoção / Cupom'}
      subtitle="Configure descontos e campanhas para atrair clientes"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da Campanha / Promoção"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Mês das Mães — 20% OFF"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cupom de Desconto (opcional)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: MAES20"
          />

          <Select
            label="Procedimento Específico"
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
          >
            <option value="">Válido para Todos os Serviços</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de Desconto"
            value={discountType}
            onChange={e => setDiscountType(e.target.value as any)}
          >
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Valor Fixo (R$)</option>
          </Select>

          <Input
            label={discountType === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}
            type="number"
            step="0.01"
            value={discountValue}
            onChange={e => setDiscountValue(Number(e.target.value))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data de Início"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Data de Término"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {promotion ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Excluir Promoção
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {promotion ? 'Salvar Alterações' : 'Criar Promoção'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
