import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Client, Appointment, AnamnesisRecord, ClientFollowUp } from '@/types';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatCurrency, formatPhone, getWhatsAppUrl, getAppointmentServicesNames } from '@/lib/utils';
import { formatDateBR, formatTimeBR, formatDateTimeBR } from '@/lib/dateUtils';
import { APPOINTMENT_STATUS_MAP } from '@/lib/constants';
import { calculateClientMetrics, buildClientTimelineEvents } from '@/lib/crmEngine';
import { AnamnesisFillerModal } from '../anamnesis/AnamnesisFillerModal';
import { AnamnesisRecordModal } from '../anamnesis/AnamnesisRecordModal';
import { EvolutionModal } from '../evolution/EvolutionModal';
import { PhotoUploadModal } from '../photos/PhotoUploadModal';
import { BeforeAfterComparator } from '../photos/BeforeAfterComparator';
import { FollowUpModal } from '../crm/FollowUpModal';
import {
  User,
  MessageCircle,
  FileText,
  Edit,
  Sparkles,
  Plus,
  Camera,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Package,
  Layers,
  Award,
  DollarSign,
  AlertTriangle,
  History,
  Tag,
  Gift,
  Coins,
  Send
} from 'lucide-react';
import { parseISO, isFuture, isPast } from 'date-fns';

interface ClientProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onNewAppointmentForClient: (client: Client) => void;
}

type TabType =
  | 'summary'
  | 'timeline'
  | 'schedule'
  | 'procedures'
  | 'anamnesis'
  | 'evolution'
  | 'photos'
  | 'financial'
  | 'packages'
  | 'loyalty'
  | 'followups'
  | 'notes';

export const ClientProfileDrawer: React.FC<ClientProfileDrawerProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onNewAppointmentForClient,
}) => {
  const {
    appointments,
    professionals,
    services,
    anamnesisRecords,
    evolutions,
    photos,
    transactions,
    clientPackages,
    loyaltyAccounts,
    followUps,
    crmConfig,
    recoveryLogs,
    usePackageSession,
    deleteAnamnesisRecord,
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Sub-modals state
  const [isAnamnesisFillerOpen, setIsAnamnesisFillerOpen] = useState(false);
  const [selectedRecordToView, setSelectedRecordToView] = useState<AnamnesisRecord | null>(null);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [selectedEvolutionToEdit, setSelectedEvolutionToEdit] = useState<any>(null);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<ClientFollowUp | null>(null);

  if (!client) return null;

  // Behavior metrics
  const metrics = calculateClientMetrics(client, appointments, crmConfig, recoveryLogs);

  // Timeline events
  const timelineEvents = buildClientTimelineEvents(
    client,
    appointments,
    anamnesisRecords,
    evolutions,
    photos,
    transactions,
    clientPackages,
    followUps
  );

  const clientApps = appointments
    .filter(a => a.client_id === client.id)
    .sort((a, b) => b.start_time.localeCompare(a.start_time));

  const upcomingAppointments = clientApps.filter(a => isFuture(parseISO(a.start_time)) && a.status !== 'cancelled');
  const pastAppointments = clientApps.filter(a => isPast(parseISO(a.start_time)));
  const completedAppointments = clientApps.filter(a => a.status === 'completed');

  const clientAnamnesis = anamnesisRecords.filter(r => r.client_id === client.id);
  const clientEvolutions = evolutions.filter(e => e.client_id === client.id);
  const clientPhotos = photos.filter(p => p.client_id === client.id);
  const clientPkgs = clientPackages.filter(p => p.client_id === client.id);
  const clientLoyalty = loyaltyAccounts.find(l => l.client_id === client.id);
  const clientFollowUps = followUps.filter(f => f.client_id === client.id);
  const clientTransactions = transactions.filter(t => t.description.toLowerCase().includes(client.name.toLowerCase()));

  const preferredProf = professionals.find(p => p.id === client.preferred_professional_id);

  // Category Badge Colors
  const getCategoryBadge = () => {
    switch (metrics.category) {
      case 'vip':
        return <Badge className="bg-purple-600 text-white font-extrabold text-[10px]">👑 VIP</Badge>;
      case 'fiel':
        return <Badge className="bg-rose-600 text-white font-extrabold text-[10px]">★ Fiel</Badge>;
      case 'em_risco':
        return <Badge className="bg-amber-600 text-white font-extrabold text-[10px]">⚠️ Em Risco</Badge>;
      case 'recuperada':
        return <Badge className="bg-emerald-600 text-white font-extrabold text-[10px]">🎉 Recuperada</Badge>;
      case 'inativa':
        return <Badge className="bg-slate-600 text-white font-extrabold text-[10px]">Inativa</Badge>;
      case 'abandonou':
        return <Badge className="bg-red-600 text-white font-extrabold text-[10px]">Abandonou</Badge>;
      case 'nova':
        return <Badge className="bg-blue-600 text-white font-extrabold text-[10px]">🌱 Nova</Badge>;
      default:
        return <Badge className="bg-slate-700 text-white text-[10px]">Ativa</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-5">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {client.name}
                </h3>
                {client.nickname && (
                  <span className="text-xs text-slate-400">({client.nickname})</span>
                )}
                {getCategoryBadge()}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <a
                  href={getWhatsAppUrl(client.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> {formatPhone(client.whatsapp)}
                </a>
                {client.email && (
                  <span className="text-xs text-slate-500 hidden sm:inline">• {client.email}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedFollowUp(null);
                setIsFollowUpModalOpen(true);
              }}
              icon={<MessageCircle className="w-3.5 h-3.5" />}
            >
              Follow-up
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(client)}
              icon={<Edit className="w-3.5 h-3.5" />}
            >
              Editar
            </Button>
            <Button
              size="sm"
              onClick={() => onNewAppointmentForClient(client)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Agendar
            </Button>
          </div>
        </div>

        {/* 12 Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap ${
              activeTab === 'summary' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Resumo 360º
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'timeline' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Linha do Tempo
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'schedule' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Agenda ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('procedures')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'procedures' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Procedimentos ({completedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('anamnesis')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'anamnesis' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Anamnese ({clientAnamnesis.length})
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'evolution' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Evolução ({clientEvolutions.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'photos' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Fotos ({clientPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'financial' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Financeiro
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'packages' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Pacotes ({clientPkgs.length})
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'loyalty' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Fidelidade
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'followups' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Follow-ups ({clientFollowUps.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'notes' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Observações
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {/* ================= 1. SUMMARY TAB ================= */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs">
              {/* Alert if in risk or recovered */}
              {metrics.category === 'em_risco' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Cliente acima do intervalo habitual de retorno! (Média: {metrics.average_interval_days} dias • Sem vir há: {metrics.days_since_last_visit} dias)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedFollowUp(null);
                      setIsFollowUpModalOpen(true);
                    }}
                    className="border-amber-300 text-amber-800 hover:bg-amber-100"
                  >
                    Preparar Follow-up
                  </Button>
                </div>
              )}

              {metrics.category === 'recuperada' && metrics.recovery_info && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>
                    Cliente recuperada após {metrics.recovery_info.inactive_days_count} dias sem atendimento!
                  </span>
                </div>
              )}

              {/* Behavior KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Gasto</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatCurrency(metrics.total_spent)}
                  </span>
                  <span className="text-[10px] text-slate-400">{metrics.completed_appointments_count} atendimentos</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Médio</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {formatCurrency(metrics.average_ticket)}
                  </span>
                  <span className="text-[10px] text-slate-400">por atendimento</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Intervalo Médio</span>
                  <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    {metrics.average_interval_days} dias
                  </span>
                  <span className="text-[10px] text-slate-400">mín: {metrics.min_interval_days}d • máx: {metrics.max_interval_days}d</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Índice Fidelidade</span>
                  <span className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5 block">
                    {metrics.loyalty_score} / 100
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold uppercase">{metrics.loyalty_tier}</span>
                </div>
              </div>

              {/* General Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Primeira Visita:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatDateBR(metrics.first_visit_date)}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Última Visita:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatDateBR(metrics.last_visit_date)} ({metrics.days_since_last_visit} dias atrás)
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Procedimento Favorito:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.top_service_name}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Profissional Mais Utilizada:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.top_professional_name}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Próximo Agendamento:</span>
                  <span className="font-bold text-emerald-600">
                    {metrics.next_appointment_date ? formatDateTimeBR(metrics.next_appointment_date) : 'Nenhum horário marcado'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Origem / Canal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{client.how_did_you_find_us || 'Instagram'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. TIMELINE TAB ================= */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Histórico Cronológico Unificado ({timelineEvents.length} eventos)
              </span>

              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhum evento registrado na linha do tempo da cliente.
                </div>
              ) : (
                <div className="relative border-l-2 border-rose-200 dark:border-rose-900 ml-4 space-y-4 py-2">
                  {timelineEvents.map(event => (
                    <div key={event.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 shadow-xs" />
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{event.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDateTimeBR(event.date)}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{event.description}</p>
                        {event.amount && (
                          <div className="text-emerald-600 font-bold text-xs pt-1">
                            Valor: {formatCurrency(event.amount)}
                          </div>
                        )}
                        {event.metadata?.image_url && (
                          <img
                            src={event.metadata.image_url}
                            alt="Foto"
                            className="max-h-24 rounded-lg object-cover mt-2 border"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. SCHEDULE TAB ================= */}
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agendamentos</span>
                <Button size="sm" onClick={() => onNewAppointmentForClient(client)} icon={<Plus className="w-3.5 h-3.5" />}>
                  Novo Horário
                </Button>
              </div>

              {clientApps.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhum agendamento registrado.
                </div>
              ) : (
                <div className="space-y-2">
                  {clientApps.map(app => {
                    const statusInfo = APPOINTMENT_STATUS_MAP[app.status] || APPOINTMENT_STATUS_MAP.scheduled;
                    return (
                      <div
                        key={app.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                            {getAppointmentServicesNames(app, services)}
                            {app.services && app.services.length > 1 && (
                              <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                                {app.services.length} procedimentos
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDateBR(app.start_time)} às {formatTimeBR(app.start_time)} ({app.duration_minutes} min) • {app.professional?.nickname || app.professional?.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${statusInfo.bg} ${statusInfo.text} text-[10px]`}>
                            {statusInfo.label}
                          </Badge>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                            {formatCurrency(app.final_price)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. PROCEDURES TAB ================= */}
          {activeTab === 'procedures' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Procedimentos Realizados ({completedAppointments.length})
              </span>

              {completedAppointments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhum procedimento concluído ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {completedAppointments.map(app => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          {getAppointmentServicesNames(app, services)}
                          {app.services && app.services.length > 1 && (
                            <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                              {app.services.length} procedimentos
                            </span>
                          )}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          {formatDateBR(app.start_time)} • Profissional: {app.professional?.name}
                        </div>
                        {app.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{app.notes}</p>}
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600 text-sm block">
                          {formatCurrency(app.final_price)}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{app.payment_method || 'PIX'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 5. ANAMNESIS TAB ================= */}
          {activeTab === 'anamnesis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fichas Preenchidas</span>
                <Button size="sm" onClick={() => setIsAnamnesisFillerOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
                  Preencher Nova Anamnese
                </Button>
              </div>

              {clientAnamnesis.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhuma ficha de anamnese preenchida para esta cliente.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {clientAnamnesis.map(rec => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{rec.template_title}</h4>
                          {rec.signature_data_url && <Badge variant="success" className="text-[10px]">Assinada</Badge>}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Preenchida em {formatDateTimeBR(rec.signed_at || rec.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRecordToView(rec)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Ver
                        </Button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Deseja excluir esta ficha de anamnese?')) {
                              await deleteAnamnesisRecord(rec.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 6. EVOLUTION TAB ================= */}
          {activeTab === 'evolution' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evolução em Cabine</span>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedEvolutionToEdit(null);
                    setIsEvolutionModalOpen(true);
                  }}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Registrar Evolução
                </Button>
              </div>

              {clientEvolutions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhum registro de evolução adicionado.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientEvolutions.map(evo => (
                    <div
                      key={evo.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {evo.procedure_name} (Sessão #{evo.session_number || 1})
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold ml-2">• {formatDateBR(evo.date)}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEvolutionToEdit(evo);
                            setIsEvolutionModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{evo.description}</p>

                      {evo.products_used && evo.products_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center pt-1">
                          <Package className="w-3 h-3 text-slate-400" />
                          {evo.products_used.map(prod => (
                            <span
                              key={prod}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {prod}
                            </span>
                          ))}
                        </div>
                      )}

                      {evo.recommendations && (
                        <div className="text-[11px] text-rose-700 dark:text-rose-300 italic pt-1">
                          Recomendações: "{evo.recommendations}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 7. PHOTOS TAB ================= */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Galeria & Comparador</span>
                <Button size="sm" onClick={() => setIsPhotoUploadOpen(true)} icon={<Camera className="w-3.5 h-3.5" />}>
                  Upload de Foto
                </Button>
              </div>

              <BeforeAfterComparator photos={clientPhotos} />
            </div>
          )}

          {/* ================= 8. FINANCIAL TAB ================= */}
          {activeTab === 'financial' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Gasto na Clínica</span>
                  <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                    {formatCurrency(metrics.total_spent)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Médio</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(metrics.average_ticket)}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Histórico de Pagamentos & Sinais ({completedAppointments.length})
              </span>

              <div className="space-y-2">
                {completedAppointments.map(app => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{getAppointmentServicesNames(app, services)}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateBR(app.start_time)} • Forma: <span className="uppercase font-semibold">{app.payment_method || 'PIX'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-600 text-sm block">{formatCurrency(app.final_price)}</span>
                      {app.deposit_paid && (
                        <span className="text-[10px] text-slate-400">Sinal de R$ {app.deposit_amount.toFixed(2)} abatido</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 9. PACKAGES TAB ================= */}
          {activeTab === 'packages' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Pacotes Contratados ({clientPkgs.length})
              </span>

              {clientPkgs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Esta cliente não possui nenhum pacote contratado.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientPkgs.map(cpkg => {
                    const remaining = cpkg.total_sessions - cpkg.used_sessions;
                    const percent = Math.round((cpkg.used_sessions / cpkg.total_sessions) * 100);

                    return (
                      <div
                        key={cpkg.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{cpkg.package_name}</h4>
                            <span className="text-[11px] text-slate-400">Válido até: {formatDateBR(cpkg.expires_at)}</span>
                          </div>
                          <Badge variant={cpkg.status === 'completed' ? 'default' : 'success'}>
                            {cpkg.status === 'completed' ? 'Concluído' : 'Ativo'}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>{cpkg.used_sessions} de {cpkg.total_sessions} sessões realizadas</span>
                            <span className="text-rose-600">{remaining} restantes</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>

                        {cpkg.status === 'active' && remaining > 0 && (
                          <div className="pt-2 flex justify-end">
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (confirm('Confirmar baixa de 1 sessão deste pacote?')) {
                                  await usePackageSession(cpkg.id);
                                }
                              }}
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Dar Baixa em 1 Sessão
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= 10. LOYALTY TAB ================= */}
          {activeTab === 'loyalty' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block">Pontos Acumulados</span>
                  <span className="text-xl font-extrabold text-purple-800 dark:text-purple-200">
                    {clientLoyalty?.points_balance || 0} pts
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold uppercase mt-1 block">
                    Nível: {clientLoyalty?.tier || 'Bronze'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Saldo de Cashback</span>
                  <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                    {formatCurrency(clientLoyalty?.cashback_balance || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Disponível para abatimento</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 11. FOLLOW-UPS TAB ================= */}
          {activeTab === 'followups' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico de Contatos</span>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedFollowUp(null);
                    setIsFollowUpModalOpen(true);
                  }}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Novo Follow-up
                </Button>
              </div>

              {clientFollowUps.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhum follow-up registrado para esta cliente.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {clientFollowUps.map(flw => (
                    <div
                      key={flw.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{flw.reason}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Data prevista: {formatDateBR(flw.recommended_date)} • Responsável: {flw.assigned_to_name}
                          </span>
                        </div>
                        <Badge variant={flw.status === 'completed' || flw.status === 'booked' ? 'success' : 'warning'}>
                          {flw.status}
                        </Badge>
                      </div>

                      {flw.generated_message && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-850 p-2 rounded-lg">
                          "{flw.generated_message}"
                        </p>
                      )}

                      {flw.result && (
                        <div className="text-[11px] font-semibold text-emerald-700">Resultado: {flw.result}</div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setSelectedFollowUp(flw);
                            setIsFollowUpModalOpen(true);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          Editar / Atualizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 12. NOTES TAB ================= */}
          {activeTab === 'notes' && (
            <div className="space-y-3 text-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Observações, Alergias e Preferências Pessoais
              </span>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  {client.notes || 'Nenhuma observação interna cadastrada para esta cliente.'}
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(client)} icon={<Edit className="w-3.5 h-3.5" />}>
                    Editar Observações
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      <AnamnesisFillerModal
        isOpen={isAnamnesisFillerOpen}
        onClose={() => setIsAnamnesisFillerOpen(false)}
        client={client}
      />

      <AnamnesisRecordModal
        isOpen={Boolean(selectedRecordToView)}
        onClose={() => setSelectedRecordToView(null)}
        record={selectedRecordToView}
      />

      <EvolutionModal
        isOpen={isEvolutionModalOpen}
        onClose={() => {
          setIsEvolutionModalOpen(false);
          setSelectedEvolutionToEdit(null);
        }}
        client={client}
        evolution={selectedEvolutionToEdit}
      />

      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        client={client}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setSelectedFollowUp(null);
        }}
        followUp={selectedFollowUp}
        defaultClient={client}
        defaultType={metrics.category === 'em_risco' ? 'risk_retention' : 'manual'}
        defaultDaysOverdue={metrics.days_overdue}
        defaultProcedure={metrics.top_service_name}
      />
    </Modal>
  );
};
