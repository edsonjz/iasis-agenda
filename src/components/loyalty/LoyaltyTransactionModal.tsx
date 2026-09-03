import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { LoyaltyAccount } from '@/types';

interface LoyaltyTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: LoyaltyAccount | null;
}

export const LoyaltyTransactionModal: React.FC<LoyaltyTransactionModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const { clients, addLoyaltyPoints, redeemLoyaltyPoints } = useBusiness();
  const { success, error: toastError } = useToast();

  const [clientId, setClientId] = useState(account?.client_id || clients[0]?.id || '');
  const [actionType, setActionType] = useState<'credit' | 'redeem'>('credit');
  const [points, setPoints] = useState<number>(100);
  const [cashback, setCashback] = useState<number>(5.0);
  const [description, setDescription] = useState('Atendimento e fidelidade');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClient = clients.find(c => c.id === clientId) || clients[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toastError('Selecione uma cliente');
      return;
    }

    try {
      setIsSubmitting(true);
      if (actionType === 'credit') {
        await addLoyaltyPoints(selectedClient.id, selectedClient.name, points, cashback, description);
        success(`Crédito de fidelidade adicionado para ${selectedClient.name}!`);
      } else {
        await redeemLoyaltyPoints(selectedClient.id, points, cashback, description);
        success(`Resgate de fidelidade realizado para ${selectedClient.name}!`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao atualizar saldo de fidelidade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={actionType === 'credit' ? 'Creditar Pontos / Cashback' : 'Resgatar Pontos / Cashback'}
      subtitle="Programa de fidelização da estética"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActionType('credit')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              actionType === 'credit' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + Adicionar Crédito
          </button>
          <button
            type="button"
            onClick={() => setActionType('redeem')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              actionType === 'redeem' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            - Resgatar Saldo
          </button>
        </div>

        <Select
          label="Cliente"
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          required
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Pontos"
            type="number"
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            required
          />
          <Input
            label="Cashback (R$)"
            type="number"
            step="0.01"
            value={cashback}
            onChange={e => setCashback(Number(e.target.value))}
            required
          />
        </div>

        <Input
          label="Motivo / Descrição"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Bônus de aniversário ou resgate em serviço"
          required
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Confirmar Operação
          </Button>
        </div>
      </form>
    </Modal>
  );
};
