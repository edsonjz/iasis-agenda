import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { CashMovementModal } from '@/components/finance/CashMovementModal';
import { CashCloseModal } from '@/components/finance/CashCloseModal';
import { formatCurrency } from '@/lib/utils';
import { formatDateBR, formatTimeBR, formatDateTimeBR } from '@/lib/dateUtils';
import { CashRegister, CashMovement } from '@/types';
import {
  Wallet,
  Lock,
  Unlock,
  Plus,
  MinusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export const Caixa: React.FC = () => {
  const { cashRegisters, cashMovements, openCashRegister } = useBusiness();
  const { success, error: toastError } = useToast();

  const openRegister = cashRegisters.find(c => c.status === 'open');
  const pastRegisters = cashRegisters.filter(c => c.status === 'closed');

  // Open modal states
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState(150);
  const [openedByName, setOpenedByName] = useState('Dra. Camila');
  const [openNotes, setOpenNotes] = useState('');

  // Sub modals
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'sangria' | 'reforco' | 'income' | 'expense'>('sangria');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Calculations for current open register
  const currentMovements = openRegister
    ? cashMovements.filter(m => m.cash_register_id === openRegister.id)
    : [];

  const cashIn = currentMovements
    .filter(m => (m.type === 'income' || m.type === 'reforco') && m.payment_method === 'cash')
    .reduce((sum, m) => sum + m.amount, 0);

  const cashOut = currentMovements
    .filter(m => (m.type === 'expense' || m.type === 'sangria') && m.payment_method === 'cash')
    .reduce((sum, m) => sum + m.amount, 0);

  const pixTotal = currentMovements
    .filter(m => m.type === 'income' && m.payment_method === 'pix')
    .reduce((sum, m) => sum + m.amount, 0);

  const cardTotal = currentMovements
    .filter(m => m.type === 'income' && (m.payment_method === 'credit_card' || m.payment_method === 'debit_card'))
    .reduce((sum, m) => sum + m.amount, 0);

  const currentCashInDrawer = openRegister
    ? openRegister.initial_amount + cashIn - cashOut
    : 0;

  const handleOpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openCashRegister(initialAmount, openedByName, openNotes);
      success('Caixa aberto com sucesso!');
      setIsOpenModalOpen(false);
    } catch (err) {
      console.error(err);
      toastError('Erro ao abrir caixa.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-rose-600" /> Caixa da Recepção
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Abertura, fechamento, sangrias e conferência em tempo real
          </p>
        </div>

        {openRegister ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMovementType('sangria');
                setIsMovementModalOpen(true);
              }}
              icon={<MinusCircle className="w-4 h-4 text-red-500" />}
            >
              Sangria / Retirada
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMovementType('reforco');
                setIsMovementModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4 text-emerald-500" />}
            >
              Reforço
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCloseModalOpen(true)}
              icon={<Lock className="w-4 h-4" />}
            >
              Fechar Caixa
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsOpenModalOpen(true)}
            icon={<Unlock className="w-4 h-4" />}
          >
            Abrir Caixa do Dia
          </Button>
        )}
      </div>

      {/* Active Cash Status Card */}
      {openRegister ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-emerald-500 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Gaveta / Dinheiro Físico
              </span>
              <Badge variant="success" className="text-[10px]">
                Aberto
              </Badge>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatCurrency(currentCashInDrawer)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Fundo inicial: {formatCurrency(openRegister.initial_amount)}
            </span>
          </Card>

          <Card className="p-5 border-l-4 border-rose-500 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recebido via PIX
            </span>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(pixTotal)}
            </div>
            <span className="text-[11px] text-slate-500 block">Confirmado na conta</span>
          </Card>

          <Card className="p-5 border-l-4 border-blue-500 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cartões (Débito / Crédito)
            </span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatCurrency(cardTotal)}
            </div>
            <span className="text-[11px] text-slate-500 block">Passado nas maquininhas</span>
          </Card>

          <Card className="p-5 border-l-4 border-purple-500 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Responsável & Horário
            </span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200 truncate">
              {openRegister.opened_by_name}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Aberto às {formatTimeBR(openRegister.opened_at)}
            </span>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-900 border-dashed">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            O Caixa está atualmente fechado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Abra o caixa informando o troco inicial para registrar movimentações, sangrias e atendimentos do dia.
          </p>
          <Button size="sm" onClick={() => setIsOpenModalOpen(true)}>
            Abrir Caixa Agora
          </Button>
        </Card>
      )}

      {/* Movements of Current Open Register */}
      {openRegister && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-600" /> Movimentações do Caixa Atual ({currentMovements.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Horário</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3">Forma</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentMovements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {formatTimeBR(m.created_at)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.type === 'income' || m.type === 'reforco'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {m.type === 'income'
                          ? 'Entrada'
                          : m.type === 'reforco'
                          ? 'Reforço'
                          : m.type === 'sangria'
                          ? 'Sangria'
                          : 'Saída'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {m.description}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500 font-bold">
                      {m.payment_method}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        m.type === 'income' || m.type === 'reforco'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {m.type === 'income' || m.type === 'reforco' ? '+' : '-'} {formatCurrency(m.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* History of Closed Registers */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Histórico de Caixas Fechados ({pastRegisters.length})
        </h3>

        {pastRegisters.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Nenhum caixa anterior arquivado no histórico.
          </div>
        ) : (
          <div className="space-y-2.5">
            {pastRegisters.map(reg => (
              <div
                key={reg.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Caixa de {formatDateBR(reg.opened_at)}
                    </span>
                    <Badge variant="default" className="text-[10px]">
                      Fechado
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Aberto por {reg.opened_by_name} • Fechado por {reg.closed_by_name || 'Admin'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fundo Inicial</span>
                    <span className="font-bold">{formatCurrency(reg.initial_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valor Fechamento</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(reg.closing_reported_amount || 0)}
                    </span>
                  </div>
                  {reg.difference_amount !== undefined && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Diferença</span>
                      <span
                        className={`font-bold ${
                          reg.difference_amount === 0
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {formatCurrency(reg.difference_amount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal: Open Cash Register */}
      <Modal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        title="Abertura de Caixa"
        subtitle="Informe o troco inicial presente na gaveta"
        maxWidth="sm"
      >
        <form onSubmit={handleOpenSubmit} className="space-y-4">
          <Input
            label="Fundo de Troco Inicial (R$)"
            type="number"
            step="0.01"
            value={initialAmount}
            onChange={e => setInitialAmount(Number(e.target.value))}
            required
          />
          <Input
            label="Nome do Operador de Caixa"
            value={openedByName}
            onChange={e => setOpenedByName(e.target.value)}
            required
          />
          <Input
            label="Observações da Abertura"
            value={openNotes}
            onChange={e => setOpenNotes(e.target.value)}
            placeholder="Ex: Notas de R$ 10, R$ 20 e moedas"
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpenModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Confirmar Abertura
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sub modals */}
      <CashMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        defaultType={movementType}
      />

      {openRegister && (
        <CashCloseModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          cashRegister={openRegister}
        />
      )}
    </div>
  );
};
