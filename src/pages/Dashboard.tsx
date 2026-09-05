import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { formatCurrency, formatPhone, getWhatsAppUrl, getAppointmentServicesNames } from '@/lib/utils';
import { formatDateBR, formatTimeBR } from '@/lib/dateUtils';
import { APPOINTMENT_STATUS_MAP } from '@/lib/constants';
import { Appointment } from '@/types';
import { isSameDay, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Cake,
  UserX,
  FileText,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { metrics, appointments, clients, professionals, services, saveAppointment } = useBusiness();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const todayAppointments = appointments
    .filter(a => isSameDay(parseISO(a.start_time), today) && a.status !== 'cancelled')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const handleQuickStatus = async (app: Appointment, newStatus: any) => {
    await saveAppointment({
      ...app,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Gestão Estética Inteligente
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Olá, {profile?.display_name || profile?.full_name || 'Profissional'}! ✨
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Você possui <strong className="text-white font-bold">{metrics.todayAppointmentsCount} atendimentos</strong> programados para hoje.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedAppointment(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
          >
            Novo Agendamento
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/agenda')}
            className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700"
          >
            Ver Agenda
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Atendimentos Hoje */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Atendimentos Hoje
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.todayAppointmentsCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              agendados para esta data
            </div>
          </div>
        </Card>

        {/* Faturamento Hoje */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faturamento Hoje
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(metrics.todayRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {formatCurrency(metrics.todayPendingAmount)} a receber
            </div>
          </div>
        </Card>

        {/* Faturamento Mês */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faturamento Mês
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatCurrency(metrics.monthRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Ticket Médio: {formatCurrency(metrics.averageTicket)}
            </div>
          </div>
        </Card>

        {/* Clientes Ativas */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Clientes Ativas
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.activeClientsCount}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              +{metrics.newClientsThisMonth} novas este mês
            </div>
          </div>
        </Card>
      </div>

      {/* Main Row: Today's Timeline & Smart Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" /> Atendimentos de Hoje ({formatDateBR(today)})
            </h3>
            <button
              onClick={() => navigate('/agenda')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Ver na Agenda <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-xs text-slate-500">Nenhum atendimento agendado para hoje.</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsModalOpen(true);
                }}
              >
                Agendar Atendimento
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(app => {
                const statusInfo = APPOINTMENT_STATUS_MAP[app.status] || APPOINTMENT_STATUS_MAP.scheduled;

                return (
                  <Card
                    key={app.id}
                    hoverable
                    onClick={() => {
                      setSelectedAppointment(app);
                      setIsModalOpen(true);
                    }}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4"
                    style={{ borderLeftColor: app.professional?.color || '#bf3f57' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Time box */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-center shrink-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {formatTimeBR(app.start_time)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          {app.duration_minutes} min
                        </div>
                      </div>

                      {/* Client & Service Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {app.client?.name || 'Cliente'}
                          </h4>
                          <Badge
                            className={`${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            dot
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {getAppointmentServicesNames(app, services)} • Profissional: <span className="font-semibold text-slate-700 dark:text-slate-300">{app.professional?.nickname || app.professional?.name}</span>
                        </div>
                        {app.notes && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1">
                            "{app.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Price & Quick Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(app.final_price)}
                        </div>
                        <div className={`text-[10px] font-semibold ${app.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {app.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                        </div>
                      </div>

                      {/* WhatsApp Button */}
                      {app.client?.whatsapp && (
                        <a
                          href={getWhatsAppUrl(app.client.whatsapp, `Olá ${app.client.name}, tudo bem? Confirmando seu atendimento hoje às ${formatTimeBR(app.start_time)}!`)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 transition-colors"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {/* Status changer buttons */}
                      {app.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickStatus(app, 'confirmed')}
                          className="text-xs"
                        >
                          Confirmar
                        </Button>
                      )}
                      {app.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => handleQuickStatus(app, 'in_service')}
                          className="text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {app.status === 'in_service' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleQuickStatus(app, 'completed')}
                          className="text-xs"
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Smart Alerts & Operational Cards (1 col) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Alertas & Retenção
          </h3>

          <div className="space-y-3">
            {/* Clientes em Risco de Abandono */}
            {(metrics.riskClientsCount ?? 0) > 0 && (
              <Card
                hoverable
                onClick={() => navigate('/crm')}
                className="p-4 bg-amber-500/10 border-amber-300 dark:border-amber-800/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      {metrics.riskClientsCount} Clientes Acima do Retorno Habitual
                    </div>
                    <div className="text-[10px] text-amber-800/80 dark:text-amber-400">
                      Risco de abandono detectado • Preparar Follow-up
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </Card>
            )}

            {/* Follow-ups de Hoje */}
            {(metrics.todayFollowUpsCount ?? 0) > 0 && (
              <Card
                hoverable
                onClick={() => navigate('/crm')}
                className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950 dark:text-blue-200">
                      {metrics.todayFollowUpsCount} Follow-ups para Hoje
                    </div>
                    <div className="text-[10px] text-blue-800/80 dark:text-blue-400">
                      Mensagens de acompanhamento pendentes
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Card>
            )}

            {/* Clientes sem Anamnese */}
            <Card
              hoverable
              onClick={() => navigate('/clientes')}
              className="p-4 bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {metrics.pendingAnamnesisCount} Clientes sem Anamnese
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Fichas pendentes de preenchimento
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Card>

            {/* Aniversariantes */}
            <Card
              hoverable
              onClick={() => navigate('/lembretes')}
              className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                  <Cake className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950 dark:text-rose-200">
                    {metrics.upcomingBirthdaysCount} Aniversariantes no mês
                  </div>
                  <div className="text-[10px] text-rose-800/80 dark:text-rose-400">
                    Envie mensagem de felicitação e desconto
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-600" />
            </Card>
          </div>

          {/* Quick Team Status */}
          <Card className="p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Profissionais em Atividade
            </h4>
            <div className="space-y-2.5">
              {professionals.map(prof => (
                <div key={prof.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: prof.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {prof.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {prof.specialties[0] || 'Geral'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
};
