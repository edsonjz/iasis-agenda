import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/lib/utils';
import { formatDateBR } from '@/lib/dateUtils';
import { useToast } from '@/contexts/ToastContext';
import {
  Percent,
  CheckCircle2,
  Clock,
  UserCheck,
  DollarSign,
  Filter,
  Check
} from 'lucide-react';

export const Comissoes: React.FC = () => {
  const { commissions, professionals, payCommission } = useBusiness();
  const { success } = useToast();

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'paid'>('all');

  const filteredCommissions = commissions.filter(c => {
    const matchesProf = selectedProfessionalId === 'all' || c.professional_id === selectedProfessionalId;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesProf && matchesStatus;
  });

  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const handlePay = async (id: string) => {
    await payCommission(id);
    success('Comissão marcada como paga!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Percent className="w-6 h-6 text-rose-600" /> Gestão de Comissões da Equipe
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cálculo automático de comissões por atendimento realizado e controle de pagamentos
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-amber-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Comissões Pendentes
            </span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Comissões Pagas (Mês)
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-rose-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Profissionais Cadastrados
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {professionals.length}
            </span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedProfessionalId('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
              selectedProfessionalId === 'all'
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Toda a Equipe
          </button>
          {professionals.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProfessionalId(p.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                selectedProfessionalId === p.id
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {p.nickname || p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
              selectedStatus === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
              selectedStatus === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-500'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setSelectedStatus('paid')}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
              selectedStatus === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-500'
            }`}
          >
            Pagas
          </button>
        </div>
      </Card>

      {/* Commissions Table */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Profissional</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Procedimento</th>
                <th className="py-3 px-4 text-right">Valor Bruto</th>
                <th className="py-3 px-4 text-center">Taxa %</th>
                <th className="py-3 px-4 text-right">Comissão</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCommissions.map(com => (
                <tr key={com.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500">{formatDateBR(com.appointment_date)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{com.professional_name}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{com.client_name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{com.service_name}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(com.gross_amount)}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-500">{com.commission_rate}%</td>
                  <td className="py-3 px-4 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(com.commission_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={com.status === 'paid' ? 'success' : 'warning'} className="text-[10px]">
                      {com.status === 'paid' ? 'Paga' : 'Pendente'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {com.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePay(com.id)}
                        className="text-[10px] py-1 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        icon={<Check className="w-3 h-3" />}
                      >
                        Pagar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
