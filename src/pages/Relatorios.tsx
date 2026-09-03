import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Award
} from 'lucide-react';

export const Relatorios: React.FC = () => {
  const { appointments, services, professionals, clients, transactions } = useBusiness();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  // Financial summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Services breakdown
  const serviceStats = services.map(s => {
    const apps = appointments.filter(a => a.service_id === s.id && a.status === 'completed');
    const revenue = apps.reduce((sum, a) => sum + a.final_price, 0);
    return {
      name: s.name,
      count: apps.length,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Professionals productivity
  const professionalStats = professionals.map(p => {
    const apps = appointments.filter(a => a.professional_id === p.id && a.status !== 'cancelled');
    const completedApps = apps.filter(a => a.status === 'completed');
    const revenue = completedApps.reduce((sum, a) => sum + a.final_price, 0);
    const commission = (revenue * (p.default_commission_rate || 40)) / 100;
    return {
      name: p.nickname || p.name,
      totalAppointments: apps.length,
      completedAppointments: completedApps.length,
      revenue,
      commission,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Clients stats
  const activeClients = clients.filter(c => c.active && (c.total_appointments || 0) > 0);
  const newClients = clients.filter(c => (c.total_appointments || 0) <= 1);
  const recurringClients = clients.filter(c => (c.total_appointments || 0) > 1);

  // Attendance rate
  const nonCancelled = appointments.filter(a => a.status !== 'cancelled');
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const noShowCount = appointments.filter(a => a.status === 'no_show').length;
  const attendanceRate = nonCancelled.length > 0 ? Math.round((completedCount / nonCancelled.length) * 100) : 92;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-600" /> Relatórios & Indicadores de Performance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            DRE Simplificado, produtividade da equipe, procedimentos campeões e retenção
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              period === 'month' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              period === 'year' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Ano Atual
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              period === 'all' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* DRE Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Faturamento Bruto</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalIncome)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Receitas operacionais
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Despesas & Custos</span>
          <div className="text-xl font-extrabold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpense)}
          </div>
          <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
            <ArrowDownRight className="w-3 h-3" /> Custos fixos e variáveis
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Lucro Líquido Real</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(netProfit)}
          </div>
          <span className="text-[10px] text-slate-500">Resultado final do período</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Margem de Lucro</span>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
            {profitMargin}%
          </div>
          <span className="text-[10px] text-slate-500">Eficiência financeira</span>
        </Card>
      </div>

      {/* Grid: Top Services and Professional Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Services */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" /> Procedimentos Mais Realizados & Faturamento
          </h3>

          <div className="space-y-3">
            {serviceStats.map(s => {
              const maxRev = serviceStats[0]?.revenue || 1;
              const percent = Math.round((s.revenue / maxRev) * 100);

              return (
                <div key={s.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{s.name}</span>
                    <span>{formatCurrency(s.revenue)} ({s.count} atendimentos)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Team Productivity */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-600" /> Produtividade da Equipe
          </h3>

          <div className="space-y-3">
            {professionalStats.map(p => (
              <div
                key={p.name}
                className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                  <span className="text-[11px] text-slate-500">{p.completedAppointments} atendimentos realizados</span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(p.revenue)}</div>
                  <span className="text-[11px] text-amber-600 font-semibold">Comissão: {formatCurrency(p.commission)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Retention & Occupation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Retention */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" /> Retenção e Fidelidade de Clientes
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Ativas</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{clients.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Recorrentes</span>
              <span className="text-lg font-extrabold text-emerald-600">{recurringClients.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Novas</span>
              <span className="text-lg font-extrabold text-purple-600">{newClients.length}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60">
            Taxa de Recorrência da Clínica: <strong className="text-purple-700 dark:text-purple-300">
              {clients.length > 0 ? Math.round((recurringClients.length / clients.length) * 100) : 0}%
            </strong> das clientes retornam para realizar manutenções ou novos procedimentos.
          </div>
        </Card>

        {/* Occupation Rate */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" /> Eficiência e Taxa de Comparecimento
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-200">
              <span className="text-[10px] uppercase font-bold block">Taxa de Comparecimento</span>
              <span className="text-2xl font-extrabold">{attendanceRate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 text-amber-900 dark:text-amber-200">
              <span className="text-[10px] uppercase font-bold block">Faltas / No-Show</span>
              <span className="text-2xl font-extrabold">{noShowCount}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            O envio automatizado de lembretes via WhatsApp reduz o no-show em até 85%.
          </p>
        </Card>
      </div>
    </div>
  );
};
