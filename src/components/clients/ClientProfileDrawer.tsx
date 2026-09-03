import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Client, Appointment, AnamnesisRecord } from '@/types';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatCurrency, formatPhone, getWhatsAppUrl } from '@/lib/utils';
import { formatDateBR, formatTimeBR, formatDateTimeBR } from '@/lib/dateUtils';
import { APPOINTMENT_STATUS_MAP } from '@/lib/constants';
import { AnamnesisFillerModal } from '../anamnesis/AnamnesisFillerModal';
import { AnamnesisRecordModal } from '../anamnesis/AnamnesisRecordModal';
import { EvolutionModal } from '../evolution/EvolutionModal';
import { PhotoUploadModal } from '../photos/PhotoUploadModal';
import { BeforeAfterComparator } from '../photos/BeforeAfterComparator';
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
  Package
} from 'lucide-react';
import { parseISO, isFuture, isPast } from 'date-fns';

interface ClientProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onNewAppointmentForClient: (client: Client) => void;
}

type TabType = 'summary' | 'upcoming' | 'history' | 'anamnesis' | 'evolution' | 'photos';

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
    anamnesisRecords,
    evolutions,
    photos,
    deleteAnamnesisRecord,
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Sub-modals state
  const [isAnamnesisFillerOpen, setIsAnamnesisFillerOpen] = useState(false);
  const [selectedRecordToView, setSelectedRecordToView] = useState<AnamnesisRecord | null>(null);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [selectedEvolutionToEdit, setSelectedEvolutionToEdit] = useState<any>(null);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

  if (!client) return null;

  const clientAppointments = appointments
    .filter(a => a.client_id === client.id)
    .sort((a, b) => b.start_time.localeCompare(a.start_time));

  const upcomingAppointments = clientAppointments.filter(a => isFuture(parseISO(a.start_time)));
  const pastAppointments = clientAppointments.filter(a => isPast(parseISO(a.start_time)));

  const clientAnamnesis = anamnesisRecords.filter(r => r.client_id === client.id);
  const clientEvolutions = evolutions.filter(e => e.client_id === client.id);
  const clientPhotos = photos.filter(p => p.client_id === client.id);

  const preferredProf = professionals.find(p => p.id === client.preferred_professional_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="space-y-5">
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-center">
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
            <div className="text-[10px] uppercase font-bold text-slate-400">Anamneses</div>
            <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {clientAnamnesis.length}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Fotos</div>
            <div className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
              {clientPhotos.length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap ${
              activeTab === 'summary' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Resumo 360º
          </button>
          <button
            onClick={() => setActiveTab('anamnesis')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'anamnesis' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Anamneses ({clientAnamnesis.length})
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'evolution' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Evolução ({clientEvolutions.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'photos' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Fotos Antes/Depois ({clientPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap ${
              activeTab === 'upcoming' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Próximos ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-1 transition-colors whitespace-nowrap ${
              activeTab === 'history' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'text-slate-500'
            }`}
          >
            Histórico ({pastAppointments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {/* ================= 1. SUMMARY TAB ================= */}
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
                    Preferências e Observações da Cliente:
                  </span>
                  <p className="text-rose-800 dark:text-rose-300 italic">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* ================= 2. ANAMNESIS TAB ================= */}
          {activeTab === 'anamnesis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fichas Preenchidas & Assinadas
                </span>
                <Button
                  size="sm"
                  onClick={() => setIsAnamnesisFillerOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Preencher Nova Anamnese
                </Button>
              </div>

              {clientAnamnesis.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed rounded-2xl">
                  Nenhuma ficha de anamnese preenchida ainda para esta cliente.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {clientAnamnesis.map(rec => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {rec.template_title}
                          </h4>
                          {rec.signature_data_url && (
                            <Badge variant="success" className="text-[10px]">
                              Assinada
                            </Badge>
                          )}
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
                          Visualizar
                        </Button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Deseja excluir este registro de anamnese?')) {
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

          {/* ================= 3. EVOLUTION TAB ================= */}
          {activeTab === 'evolution' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Linha do Tempo dos Atendimentos
                </span>
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
                  Nenhum registro de evolução adicionado para esta cliente.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientEvolutions.map(evo => (
                    <div
                      key={evo.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 relative"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {evo.procedure_name} (Sessão #{evo.session_number || 1})
                            </h4>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              • {formatDateBR(evo.date)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedEvolutionToEdit(evo);
                            setIsEvolutionModalOpen(true);
                          }}
                          className="text-xs text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {evo.description}
                      </p>

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

                      {evo.next_session_date && (
                        <div className="text-[10px] text-slate-400 font-semibold pt-1">
                          Próxima sessão sugerida: {formatDateBR(evo.next_session_date)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. PHOTOS TAB ================= */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fotos Antes & Depois do Tratamento
                </span>
                <Button
                  size="sm"
                  onClick={() => setIsPhotoUploadOpen(true)}
                  icon={<Camera className="w-3.5 h-3.5" />}
                >
                  Upload de Foto
                </Button>
              </div>

              <BeforeAfterComparator photos={clientPhotos} />
            </div>
          )}

          {/* ================= 5. UPCOMING TAB ================= */}
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

          {/* ================= 6. HISTORY TAB ================= */}
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
    </Modal>
  );
};
