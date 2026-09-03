import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { FollowUpModal } from '@/components/crm/FollowUpModal';
import { BatchActionsModal } from '@/components/crm/BatchActionsModal';
import { ClientProfileDrawer } from '@/components/clients/ClientProfileDrawer';
import { ClientModal } from '@/components/clients/ClientModal';
import { calculateClientMetrics } from '@/lib/crmEngine';
import { formatCurrency, formatPhone, getWhatsAppUrl } from '@/lib/utils';
import { formatDateBR } from '@/lib/dateUtils';
import { Client, ClientRelationshipCategory, ClientFollowUp } from '@/types';
import {
  Users,
  AlertTriangle,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Activity,
  MessageCircle,
  Filter,
  Search,
  CheckSquare,
  Plus,
  Send,
  Download,
  Calendar,
  Layers,
  BarChart3,
  Clock,
  ArrowRight
} from 'lucide-react';

export const CRM: React.FC = () => {
  const {
    clients,
    appointments,
    services,
    crmConfig,
    recoveryLogs,
    followUps,
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<'risk' | 'loyal' | 'retention' | 'followups' | 'all'>('risk');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClientsIds, setSelectedClientsIds] = useState<string[]>([]);
  
  // Modals
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<Client | null>(null);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<ClientFollowUp | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Compute metrics for all clients
  const allClientsWithMetrics = clients.map(c => ({
    client: c,
    metrics: calculateClientMetrics(c, appointments, crmConfig, recoveryLogs),
  }));

  // Counts by category
  const countNovas = allClientsWithMetrics.filter(c => c.metrics.category === 'nova').length;
  const countAtivas = allClientsWithMetrics.filter(c => c.metrics.category === 'ativa').length;
  const countFieis = allClientsWithMetrics.filter(c => c.metrics.category === 'fiel').length;
  const countVIP = allClientsWithMetrics.filter(c => c.metrics.category === 'vip').length;
  const countEmRisco = allClientsWithMetrics.filter(c => c.metrics.category === 'em_risco').length;
  const countInativas = allClientsWithMetrics.filter(c => c.metrics.category === 'inativa').length;
  const countAbandonou = allClientsWithMetrics.filter(c => c.metrics.category === 'abandonou').length;
  const countRecuperadas = allClientsWithMetrics.filter(c => c.metrics.category === 'recuperada').length;

  // Filtered lists
  const riskClients = allClientsWithMetrics
    .filter(c => c.metrics.category === 'em_risco')
    .sort((a, b) => b.metrics.days_overdue - a.metrics.days_overdue);

  const loyalClients = [...allClientsWithMetrics]
    .sort((a, b) => b.metrics.loyalty_score - a.metrics.loyalty_score);

  // Conversion of first visit
  const totalClientsCount = clients.length;
  const singleVisitClients = allClientsWithMetrics.filter(c => c.metrics.completed_appointments_count === 1).length;
  const twoVisitClients = allClientsWithMetrics.filter(c => c.metrics.completed_appointments_count === 2).length;
  const threePlusVisitClients = allClientsWithMetrics.filter(c => c.metrics.completed_appointments_count >= 3).length;
  const returnedClientsCount = twoVisitClients + threePlusVisitClients;
  const firstVisitReturnRate = totalClientsCount > 0 ? Math.round((returnedClientsCount / totalClientsCount) * 100) : 0;

  // Retention by Service
  const serviceRetentionStats = services.map(s => {
    const apps = appointments.filter(a => a.service_id === s.id && a.status === 'completed');
    const uniqueClients = new Set(apps.map(a => a.client_id));
    const recurringForService = Array.from(uniqueClients).filter(cId => {
      const clientApps = apps.filter(a => a.client_id === cId);
      return clientApps.length > 1;
    });

    const returnRate = uniqueClients.size > 0 ? Math.round((recurringForService.length / uniqueClients.size) * 100) : 0;
    return {
      service: s,
      totalClients: uniqueClients.size,
      returnRate,
    };
  }).sort((a, b) => b.returnRate - a.returnRate);

  // Multi select toggle
  const toggleSelectClient = (id: string) => {
    setSelectedClientsIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (list: Client[]) => {
    if (selectedClientsIds.length === list.length) {
      setSelectedClientsIds([]);
    } else {
      setSelectedClientsIds(list.map(c => c.id));
    }
  };

  const selectedClientsObjects = clients.filter(c => selectedClientsIds.includes(c.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" /> CRM, Relacionamento & Retenção de Clientes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compreensão do comportamento individual, identificação de riscos e automação de follow-ups
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedClientsIds.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBatchModalOpen(true)}
              className="border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40"
              icon={<CheckSquare className="w-4 h-4 text-rose-600" />}
            >
              Ações em Lote ({selectedClientsIds.length})
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => {
              setSelectedFollowUp(null);
              setIsFollowUpModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Follow-up
          </Button>
        </div>
      </div>

      {/* Relationship Segmentation Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('em_risco');
          }}
          className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block">Em Risco</span>
          <span className="text-xl font-extrabold text-amber-900 dark:text-amber-200 mt-0.5 block">{countEmRisco}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('vip');
          }}
          className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase block">👑 VIP</span>
          <span className="text-xl font-extrabold text-purple-900 dark:text-purple-200 mt-0.5 block">{countVIP}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('fiel');
          }}
          className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase block">★ Fiel</span>
          <span className="text-xl font-extrabold text-rose-900 dark:text-rose-200 mt-0.5 block">{countFieis}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('recuperada');
          }}
          className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Recuperada</span>
          <span className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5 block">{countRecuperadas}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('nova');
          }}
          className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">🌱 Nova</span>
          <span className="text-xl font-extrabold text-blue-900 dark:text-blue-200 mt-0.5 block">{countNovas}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('ativa');
          }}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Ativa</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{countAtivas}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('inativa');
          }}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Inativa</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{countInativas}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('abandonou');
          }}
          className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-left hover:scale-[1.02] transition-all"
        >
          <span className="text-[10px] font-bold text-red-800 dark:text-red-300 uppercase block">Abandonou</span>
          <span className="text-xl font-extrabold text-red-900 dark:text-red-200 mt-0.5 block">{countAbandonou}</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('risk')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'risk' ? 'text-amber-600 font-bold border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Clientes em Risco ({riskClients.length})
        </button>

        <button
          onClick={() => setActiveTab('loyal')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'loyal' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4 text-rose-500" /> Ranking de Fidelidade
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'followups' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-rose-500" /> Central de Follow-ups ({followUps.length})
        </button>

        <button
          onClick={() => setActiveTab('retention')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'retention' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500" /> Análise de Retenção & Conversão
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'all' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4 text-rose-500" /> Todas as Clientes ({clients.length})
        </button>
      </div>

      {/* ================= TAB 1: CLIENTS IN RISK ================= */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 dark:text-amber-200">
              <span className="font-bold">Detecção Inteligente de Risco:</span> Estas clientes ultrapassaram o seu próprio intervalo habitual de retorno. Realizar um follow-up neste momento aumenta a chance de reativação em 4x antes que se tornem inativas.
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={selectedClientsIds.length === riskClients.length && riskClients.length > 0}
                        onChange={() => toggleSelectAll(riskClients.map(r => r.client))}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                    </th>
                    <th className="py-3 px-4">Prioridade</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Último Procedimento</th>
                    <th className="py-3 px-4 text-center">Intervalo Habitual</th>
                    <th className="py-3 px-4 text-center">Sem vir há</th>
                    <th className="py-3 px-4 text-center">Atraso</th>
                    <th className="py-3 px-4 text-right">Valor Histórico</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {riskClients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Nenhuma cliente em risco de abandono identificada no momento! ✨
                      </td>
                    </tr>
                  ) : (
                    riskClients.map(({ client, metrics }) => (
                      <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedClientsIds.includes(client.id)}
                            onChange={() => toggleSelectClient(client.id)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            metrics.risk_priority === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {metrics.risk_priority === 'high' ? '🔴 Alta' : '🟠 Média'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedClientForProfile(client)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-rose-600 text-left block"
                          >
                            {client.name}
                          </button>
                          <span className="text-[11px] text-slate-400">{formatPhone(client.whatsapp)}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {metrics.top_service_name}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                          {metrics.average_interval_days} dias
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-600">
                          {metrics.days_since_last_visit} dias
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-red-600">
                          +{metrics.days_overdue} dias
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {formatCurrency(metrics.total_spent)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFollowUp(null);
                              setIsFollowUpModalOpen(true);
                            }}
                            className="text-[10px] py-1 px-2.5 border-amber-300 text-amber-800 hover:bg-amber-100"
                            icon={<MessageCircle className="w-3 h-3" />}
                          >
                            Preparar Follow-up
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 2: LOYALTY RANKING ================= */}
      {activeTab === 'loyal' && (
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">Posição</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4 text-center">Índice Fidelidade</th>
                  <th className="py-3 px-4 text-center">Nível</th>
                  <th className="py-3 px-4 text-center">Atendimentos</th>
                  <th className="py-3 px-4 text-center">Intervalo Médio</th>
                  <th className="py-3 px-4 text-right">Total Gasto</th>
                  <th className="py-3 px-4 text-right">Ticket Médio</th>
                  <th className="py-3 px-4">Última Visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loyalClients.map(({ client, metrics }, idx) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <button
                        onClick={() => setSelectedClientForProfile(client)}
                        className="hover:text-rose-600 text-left block"
                      >
                        {client.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-sm text-purple-600 dark:text-purple-400">
                      {metrics.loyalty_score} / 100
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className="text-[10px] capitalize">
                        {metrics.loyalty_tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {metrics.completed_appointments_count}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {metrics.average_interval_days} dias
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(metrics.total_spent)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(metrics.average_ticket)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateBR(metrics.last_visit_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================= TAB 3: RETENTION & CONVERSION ================= */}
      {activeTab === 'retention' && (
        <div className="space-y-6">
          {/* Conversion of First Visit Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 space-y-3 lg:col-span-1 border-l-4 border-rose-500">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Conversão da 1ª Visita (Taxa de Retorno)
              </span>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {firstVisitReturnRate}%
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Das <strong>{totalClientsCount} clientes cadastradas</strong>, {returnedClientsCount} já retornaram para realizar um 2º ou 3º atendimento.
              </p>
            </Card>

            <Card className="p-5 space-y-4 lg:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Distribuição por Frequência de Visitas
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Fizeram apenas 1 atendimento ({singleVisitClients} clientes)</span>
                    <span className="text-slate-400">{totalClientsCount > 0 ? Math.round((singleVisitClients / totalClientsCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(singleVisitClients / (totalClientsCount || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Retornaram para o 2º atendimento ({twoVisitClients} clientes)</span>
                    <span className="text-slate-400">{totalClientsCount > 0 ? Math.round((twoVisitClients / totalClientsCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(twoVisitClients / (totalClientsCount || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Fiéis com 3 ou mais atendimentos ({threePlusVisitClients} clientes)</span>
                    <span className="text-emerald-600">{totalClientsCount > 0 ? Math.round((threePlusVisitClients / totalClientsCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(threePlusVisitClients / (totalClientsCount || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Retention by Procedure */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" /> Procedimentos que Mais Geram Retorno & Fidelização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {serviceRetentionStats.map(({ service, totalClients, returnRate }) => (
                <div
                  key={service.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{service.name}</h4>
                    <span className="font-extrabold text-emerald-600 text-sm">{returnRate}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {totalClients} clientes únicas atenderam este serviço
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: `${returnRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 4: CENTRAL DE FOLLOW-UPS ================= */}
      {activeTab === 'followups' && (
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Data Prevista</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {followUps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum follow-up cadastrado.
                    </td>
                  </tr>
                ) : (
                  followUps.map(flw => (
                    <tr key={flw.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{formatDateBR(flw.recommended_date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{flw.client_name}</td>
                      <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">
                        {flw.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{flw.reason}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{flw.assigned_to_name}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={flw.status === 'completed' || flw.status === 'booked' ? 'success' : 'warning'}
                          className="text-[10px]"
                        >
                          {flw.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFollowUp(flw);
                            setIsFollowUpModalOpen(true);
                          }}
                          className="text-[10px] py-1 px-2.5"
                        >
                          Ver Mensagem
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================= TAB 5: ALL CLIENTS WITH SEGMENTATION ================= */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nome ou telefone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Todas ({clients.length})
                </button>
                {['vip', 'fiel', 'em_risco', 'recuperada', 'nova', 'ativa', 'inativa', 'abandonou'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap capitalize ${
                      selectedCategory === cat
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={selectedClientsIds.length === clients.length && clients.length > 0}
                        onChange={() => toggleSelectAll(clients)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                    </th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Classificação</th>
                    <th className="py-3 px-4 text-center">Atendimentos</th>
                    <th className="py-3 px-4 text-right">Total Gasto</th>
                    <th className="py-3 px-4 text-center">Intervalo Habitual</th>
                    <th className="py-3 px-4">Último Atendimento</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allClientsWithMetrics
                    .filter(({ client, metrics }) => {
                      const matchesSearch =
                        !searchQuery ||
                        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        client.whatsapp.includes(searchQuery);
                      const matchesCat = selectedCategory === 'all' || metrics.category === selectedCategory;
                      return matchesSearch && matchesCat;
                    })
                    .map(({ client, metrics }) => (
                      <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedClientsIds.includes(client.id)}
                            onChange={() => toggleSelectClient(client.id)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedClientForProfile(client)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-rose-600 text-left block"
                          >
                            {client.name}
                          </button>
                          <span className="text-[11px] text-slate-400">{formatPhone(client.whatsapp)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="text-[10px] capitalize">
                            {metrics.category_label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {metrics.completed_appointments_count}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                          {formatCurrency(metrics.total_spent)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {metrics.average_interval_days} dias
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDateBR(metrics.last_visit_date)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedClientForProfile(client)}
                            className="text-[10px] py-1 px-2.5"
                          >
                            Perfil 360º
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Sub Modals */}
      <ClientProfileDrawer
        isOpen={Boolean(selectedClientForProfile)}
        onClose={() => setSelectedClientForProfile(null)}
        client={selectedClientForProfile}
        onEdit={c => setSelectedClientForEdit(c)}
        onNewAppointmentForClient={() => {}}
      />

      <ClientModal
        isOpen={Boolean(selectedClientForEdit)}
        onClose={() => setSelectedClientForEdit(null)}
        client={selectedClientForEdit}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setSelectedFollowUp(null);
        }}
        followUp={selectedFollowUp}
      />

      <BatchActionsModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedClients={selectedClientsObjects}
        onSuccess={() => setSelectedClientsIds([])}
      />
    </div>
  );
};
