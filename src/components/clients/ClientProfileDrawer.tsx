import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Client, Appointment } from '@/types';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatCurrency, formatPhone, getWhatsAppUrl } from '@/lib/utils';
import { formatDateBR, formatTimeBR } from '@/lib/dateUtils';
import { APPOINTMENT_STATUS_MAP } from '@/lib/constants';
import {
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  MessageCircle,
  FileText,
  Edit,
  Sparkles,
  Plus
} from 'lucide-react';
import { parseISO, isFuture, isPast } from 'date-fns';

interface ClientProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onNewAppointmentForClient: (client: Client) => void;
}

export const ClientProfileDrawer: React.FC<ClientProfileDrawerProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onNewAppointmentForClient,
}) => {
  const { appointments, professionals } = useBusiness();
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'upcoming' | 'notes'>('summary');

  if (!client) return null;

  const clientAppointments = appointments
    .filter(a => a.client_id === client.id)
    .sort((a, b) => b.start_time.localeCompare(a.start_time));

  const upcomingAppointments = clientAppointments.filter(a => isFuture(parseISO(a.start_time)));
  const pastAppointments = clientAppointments.filter(a => isPast(parseISO(a.start_time)));

  const preferredProf = professionals.find(p => p.id === client.preferred_professional_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {client.name}
                </h3>
                {client.nickname && (
                  <span className="text-xs text-slate-400">({client.nickname})</span>
                )}
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

          <div className="flex items-center gap-2">
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

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {client.tags.map(t => (
              <Badge key={t} variant="primary">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Atendimentos</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {client.total_appointments || clientAppointments.length}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Gasto</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(client.total_spent)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Última Visita</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
              {formatDateBR(client.last_appointment_date)}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'summary' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Resumo 360º
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'upcoming' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Próximos ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'history' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Histórico ({pastAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'notes' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Observações
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Profissional Preferencial:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {preferredProf ? preferredProf.name : 'Sem preferência'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Origem / Como conheceu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {client.how_did_you_find_us || 'Não informado'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Aniversário:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatDateBR(client.birth_date)}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-1">Cadastro desde:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatDateBR(client.created_at)}
                  </span>
                </div>
              </div>

              {client.notes && (
                <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <span className="font-bold text-rose-900 dark:text-rose-200 block mb-1">
                    Preferências da Cliente:
                  </span>
                  <p className="text-rose-800 dark:text-rose-300 italic">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* UPCOMING TAB */}
          {activeTab === 'upcoming' && (
            <div className="space-y-2.5">
              {upcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Nenhum agendamento futuro marcado.</p>
              ) : (
                upcomingAppointments.map(app => {
                  const statusInfo = APPOINTMENT_STATUS_MAP[app.status] || APPOINTMENT_STATUS_MAP.scheduled;
                  return (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {app.service?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDateBR(app.start_time)} às {formatTimeBR(app.start_time)} • {app.professional?.nickname || app.professional?.name}
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
                })
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {pastAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Nenhum histórico anterior registrado.</p>
              ) : (
                pastAppointments.map(app => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {app.service?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateBR(app.start_time)} • {app.professional?.nickname || app.professional?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-emerald-600">
                        {formatCurrency(app.final_price)}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">{app.payment_method || 'PIX'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-600" /> Registro de Anamnese & Evolução
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {client.notes || 'Nenhuma anotação registrada ainda para esta cliente.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
