import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { FinancialTransaction, PaymentMethod } from '@/types';
import { format } from 'date-fns';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction | null;
  defaultType?: 'income' | 'expense';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  defaultType = 'income',
}) => {
  const { saveTransaction, deleteTransaction } = useBusiness();
  const { success, error: toastError } = useToast();

  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [categoryName, setCategoryName] = useState('Atendimentos');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(transaction.amount);
      setCategoryName(transaction.category_name || (transaction.type === 'income' ? 'Atendimentos' : 'Produtos'));
      setPaymentMethod(transaction.payment_method || 'pix');
      setPaidAt(transaction.paid_at ? transaction.paid_at.split('T')[0] : format(new Date(), 'yyyy-MM-dd'));
      setNotes(transaction.notes || '');
    } else {
      setType(defaultType);
      setDescription('');
      setAmount(0);
      setCategoryName(defaultType === 'income' ? 'Atendimentos' : 'Produtos e Descartáveis');
      setPaymentMethod('pix');
      setPaidAt(format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
    }
  }, [transaction, isOpen, defaultType]);

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
      const trData: FinancialTransaction = {
        id: transaction?.id || `tr_${Date.now()}`,
        type,
        description: description.trim(),
        amount,
        category_name: categoryName,
        payment_method: paymentMethod,
        paid_at: `${paidAt}T12:00:00Z`,
        status: 'completed',
        notes: notes.trim() || undefined,
        created_at: transaction?.created_at || new Date().toISOString(),
      };

      await saveTransaction(trData);
      success(transaction ? 'Lançamento atualizado!' : 'Lançamento registrado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar lançamento financeiro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Editar Lançamento' : type === 'income' ? 'Nova Receita (Entrada)' : 'Nova Despesa (Saída)'}
      subtitle="Controle financeiro da estética"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryName('Atendimentos');
            }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              type === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + Receita / Entrada
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryName('Produtos e Descartáveis');
            }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              type === 'expense' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            - Despesa / Saída
          </button>
        </div>

        <Input
          label="Descrição do Lançamento"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={type === 'income' ? 'Ex: Procedimento Cílios Mari' : 'Ex: Compra de luvas e descartáveis'}
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
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="cash">Dinheiro em Espécie</option>
            <option value="transfer">Transferência / TED</option>
            <option value="other">Outro</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Categoria"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
          >
            {type === 'income' ? (
              <>
                <option value="Atendimentos">Atendimentos / Procedimentos</option>
                <option value="Sinais de Reserva">Sinais de Reserva</option>
                <option value="Venda de Pacote">Venda de Pacote</option>
                <option value="Venda de Produtos">Venda de Produtos (Home Care)</option>
                <option value="Cursos e Workshops">Cursos e Workshops</option>
                <option value="Outras Receitas">Outras Receitas</option>
              </>
            ) : (
              <>
                <option value="Produtos e Descartáveis">Produtos e Descartáveis</option>
                <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
                <option value="Comissões Pagas">Comissões Pagas</option>
                <option value="Marketing & Anúncios">Marketing & Anúncios</option>
                <option value="Energia, Água & Internet">Energia, Água & Internet</option>
                <option value="Taxas de Cartão">Taxas de Cartão</option>
                <option value="Manutenção & Equipamentos">Manutenção & Equipamentos</option>
                <option value="Outras Despesas">Outras Despesas</option>
              </>
            )}
          </Select>

          <Input
            label="Data de Pagamento"
            type="date"
            value={paidAt}
            onChange={e => setPaidAt(e.target.value)}
            required
          />
        </div>

        <Input
          label="Observações (opcional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ex: Nota fiscal nº 123"
        />

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {transaction ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                if (confirm('Deseja excluir este lançamento financeiro?')) {
                  await deleteTransaction(transaction.id);
                  success('Lançamento excluído');
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
              {transaction ? 'Salvar Alterações' : 'Registrar Lançamento'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
