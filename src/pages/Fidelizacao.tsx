import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { LoyaltyTransactionModal } from '@/components/loyalty/LoyaltyTransactionModal';
import { formatCurrency } from '@/lib/utils';
import { LoyaltyAccount } from '@/types';
import {
  Award,
  Plus,
  Sparkles,
  Gift,
  Coins,
  Crown,
  Search,
  Star
} from 'lucide-react';

export const Fidelizacao: React.FC = () => {
  const { loyaltyAccounts } = useBusiness();
  const [selectedAccount, setSelectedAccount] = useState<LoyaltyAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalPointsGiven = loyaltyAccounts.reduce((sum, a) => sum + a.total_earned_points, 0);
  const totalCashbackActive = loyaltyAccounts.reduce((sum, a) => sum + a.cashback_balance, 0);

  const filteredAccounts = loyaltyAccounts.filter(a =>
    !searchQuery || (a.client_name && a.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-rose-600" /> Programa de Fidelidade & Cashback
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bonifique clientes recorrentes com pontos, cashback e níveis VIP
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedAccount(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Lançar Crédito / Resgate
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-purple-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Pontos Concedidos
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalPointsGiven.toLocaleString('pt-BR')} pts
            </span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo Ativo em Cashback
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCashbackActive)}
            </span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-amber-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Nível VIP & Clientes Ouro
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {loyaltyAccounts.filter(a => a.tier === 'VIP' || a.tier === 'Ouro').length} clientes
            </span>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar saldo de cliente por nome..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
          />
        </div>
      </Card>

      {/* Loyalty Table */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Categoria / Nível</th>
                <th className="py-3 px-4 text-center">Pontos Acumulados</th>
                <th className="py-3 px-4 text-right">Saldo de Cashback</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {acc.client_name || 'Cliente'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        acc.tier === 'VIP'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : acc.tier === 'Ouro'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      ★ {acc.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-purple-600 dark:text-purple-400">
                    {acc.points_balance} pts
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(acc.cashback_balance)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAccount(acc);
                        setIsModalOpen(true);
                      }}
                      className="text-[10px] py-1 px-2.5"
                    >
                      Resgatar / Creditar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Loyalty Transaction Modal */}
      <LoyaltyTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
      />
    </div>
  );
};
