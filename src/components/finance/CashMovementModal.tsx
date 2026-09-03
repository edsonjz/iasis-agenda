import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { PaymentMethod } from '@/types';

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense' | 'sangria' | 'reforco';
}

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'sangria',
}) => {
  const { addCashMovement } = useBusiness();
  const { success, error: toastError } = useToast();

  const [type, setType] = useState<'income' | 'expense' | 'sangria' | 'reforco'>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toastError('Descrição é obrigatória');
      return;
    }
    if (amount <= 0) {
      toastError('Valor deve ser maior que zero');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCashMovement(type, amount, description.trim(), paymentMethod);
      success('Movimentação registrada no caixa com sucesso!');
      setDescription('');
      setAmount(0);
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao registrar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        type === 'sangria'
          ? 'Sangria de Caixa (Retirada)'
          : type === 'reforco'
          ? 'Reforço de Caixa (Aporte)'
          : type === 'income'
          ? 'Entrada Avulsa no Caixa'
          : 'Saída do Caixa'
      }
      subtitle="Movimentação do caixa físico da recepção"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Tipo de Movimentação"
          value={type}
          onChange={e => setType(e.target.value as any)}
        >
          <option value="sangria">Sangria (Retirada de dinheiro do caixa)</option>
          <option value="reforco">Reforço (Adicionar troco ao caixa)</option>
          <option value="income">Entrada Avulsa / Pagamento</option>
          <option value="expense">Saída Avulsa / Pagamento Rápido</option>
        </Select>

        <Input
          label="Descrição / Motivo"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={
            type === 'sangria'
              ? 'Ex: Depósito bancário ou pagamento fornecedor'
              : type === 'reforco'
              ? 'Ex: Troco inicial extra'
              : 'Ex: Café e descartáveis'
          }
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={amount || ''}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="0,00"
            required
          />

          <Select
            label="Forma de Pagamento"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="cash">Dinheiro em Espécie</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Salvar Movimentação
          </Button>
        </div>
      </form>
    </Modal>
  );
};
