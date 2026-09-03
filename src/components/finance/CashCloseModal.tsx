import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { CashRegister } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface CashCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashRegister: CashRegister;
}

export const CashCloseModal: React.FC<CashCloseModalProps> = ({
  isOpen,
  onClose,
  cashRegister,
}) => {
  const { cashMovements, closeCashRegister } = useBusiness();
  const { success, error: toastError } = useToast();

  const [reportedCash, setReportedCash] = useState<number>(0);
  const [closedByName, setClosedByName] = useState('Dra. Camila');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate expected cash
  const movements = cashMovements.filter(m => m.cash_register_id === cashRegister.id);
  const cashIn = movements
    .filter(m => (m.type === 'income' || m.type === 'reforco') && m.payment_method === 'cash')
    .reduce((sum, m) => sum + m.amount, 0);
  const cashOut = movements
    .filter(m => (m.type === 'expense' || m.type === 'sangria') && m.payment_method === 'cash')
    .reduce((sum, m) => sum + m.amount, 0);

  const expectedCash = cashRegister.initial_amount + cashIn - cashOut;
  const difference = reportedCash - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closedByName.trim()) {
      toastError('Nome do responsável pelo fechamento é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      await closeCashRegister(cashRegister.id, reportedCash, closedByName.trim(), notes);
      success('Caixa fechado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao fechar caixa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fechamento & Conferência de Caixa"
      subtitle="Conte o dinheiro físico em gaveta e confira com o sistema"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Expected Summary */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Fundo de Troco Inicial:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(cashRegister.initial_amount)}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Entradas em Dinheiro:</span>
            <span className="font-bold">+{formatCurrency(cashIn)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Sangrias / Saídas em Dinheiro:</span>
            <span className="font-bold">-{formatCurrency(cashOut)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-slate-100">
            <span>Saldo Esperado em Gaveta:</span>
            <span className="text-rose-600">{formatCurrency(expectedCash)}</span>
          </div>
        </div>

        <Input
          label="Valor Total Contado em Dinheiro (R$)"
          type="number"
          step="0.01"
          value={reportedCash || ''}
          onChange={e => setReportedCash(Number(e.target.value))}
          placeholder="0,00"
          required
        />

        {/* Difference Alert */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          difference === 0
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
            : difference > 0
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-800 dark:text-blue-300'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-1.5 font-bold">
            {difference === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
            <span>{difference === 0 ? 'Caixa Bateu Perfeitamente!' : difference > 0 ? 'Sobra de Caixa' : 'Falta de Caixa'}</span>
          </div>
          <span className="font-extrabold">{formatCurrency(difference)}</span>
        </div>

        <Input
          label="Responsável pelo Fechamento"
          value={closedByName}
          onChange={e => setClosedByName(e.target.value)}
          required
        />

        <Input
          label="Observações Finais do Fechamento"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ex: Tudo conferido sem pendências"
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Confirmar Fechamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
