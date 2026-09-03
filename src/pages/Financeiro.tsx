import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { formatCurrency } from '@/lib/utils';
import { formatDateBR } from '@/lib/dateUtils';
import { FinancialTransaction } from '@/types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Search,
  Wallet,
  Receipt,
  CreditCard,
  Edit,
  Trash2
} from 'lucide-react';
import { parseISO, isSameMonth, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const Financeiro: React.FC = () => {
  const { transactions } = useBusiness();
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filtered List
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.description.toLowerCase().includes(q) ||
      (t.category_name && t.category_name.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-rose-600" /> Gestão Financeira & Fluxo de Caixa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de receitas, custos, despesas operacionais e lucratividade líquida
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTransaction(null);
              setModalType('expense');
              setIsModalOpen(true);
            }}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            icon={<ArrowDownLeft className="w-4 h-4 text-red-500" />}
          >
            Nova Despesa
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedTransaction(null);
              setModalType('income');
              setIsModalOpen(true);
            }}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            Nova Receita
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Receitas
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-red-500">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Despesas
            </span>
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </Card>

        <Card className={`p-5 flex items-center gap-4 border-l-4 ${netBalance >= 0 ? 'border-rose-500' : 'border-amber-500'}`}>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo Líquido
            </span>
            <span className={`text-2xl font-extrabold ${netBalance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-amber-600'}`}>
              {formatCurrency(netBalance)}
            </span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento por descrição ou categoria..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors ${
                filterType === 'all'
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors ${
                filterType === 'income'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors ${
                filterType === 'expense'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>
      </Card>

      {/* Transactions Table / List */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Forma</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredTransactions.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant={tr.type === 'income' ? 'success' : 'danger'} className="text-[10px]">
                      {tr.type === 'income' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {tr.description}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {tr.category_name || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDateBR(tr.paid_at)}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] text-slate-500 font-semibold">
                    {tr.payment_method || 'PIX'}
                  </td>
                  <td className={`py-3 px-4 text-right font-extrabold text-sm ${
                    tr.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tr.type === 'income' ? '+' : '-'} {formatCurrency(tr.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedTransaction(tr);
                        setModalType(tr.type);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        defaultType={modalType}
      />
    </div>
  );
};
