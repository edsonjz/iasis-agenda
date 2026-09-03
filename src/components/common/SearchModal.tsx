import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useBusiness } from '@/contexts/BusinessContext';
import { Search, User, Calendar, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { formatDateBR, formatTimeBR } from '@/lib/dateUtils';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAppointment?: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectAppointment }) => {
  const [query, setQuery] = useState('');
  const { clients, services, professionals, appointments } = useBusiness();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const cleanQuery = query.toLowerCase().trim();

  const filteredClients = query
    ? clients.filter(
        c =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.whatsapp.includes(cleanQuery) ||
          (c.email && c.email.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const filteredServices = query
    ? services.filter(
        s =>
          s.name.toLowerCase().includes(cleanQuery) ||
          (s.description && s.description.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const filteredProfessionals = query
    ? professionals.filter(
        p =>
          p.name.toLowerCase().includes(cleanQuery) ||
          (p.nickname && p.nickname.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const filteredAppointments = query
    ? appointments.filter(
        a =>
          a.client?.name.toLowerCase().includes(cleanQuery) ||
          a.service?.name.toLowerCase().includes(cleanQuery) ||
          a.professional?.name.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const hasResults =
    filteredClients.length > 0 ||
    filteredServices.length > 0 ||
    filteredProfessionals.length > 0 ||
    filteredAppointments.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por cliente, WhatsApp, serviço, profissional ou agendamento..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-slate-100"
          />
        </div>

        {query && !hasResults && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            Nenhum resultado encontrado para "{query}".
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Clientes */}
          {filteredClients.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" /> Clientes
              </h5>
              <div className="space-y-1.5">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => {
                      navigate(`/clientes?id=${client.id}`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{client.name}</div>
                      <div className="text-xs text-slate-500">{formatPhone(client.whatsapp)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agendamentos */}
          {filteredAppointments.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Agendamentos
              </h5>
              <div className="space-y-1.5">
                {filteredAppointments.map(app => (
                  <div
                    key={app.id}
                    onClick={() => {
                      if (onSelectAppointment) onSelectAppointment(app.id);
                      navigate('/agenda');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {app.client?.name} — {app.service?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDateBR(app.start_time)} às {formatTimeBR(app.start_time)} ({app.professional?.nickname || app.professional?.name})
                      </div>
                    </div>
                    <div className="text-xs font-bold text-rose-600">{formatCurrency(app.final_price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Serviços */}
          {filteredServices.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Serviços
              </h5>
              <div className="space-y-1.5">
                {filteredServices.map(srv => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      navigate('/servicos');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{srv.name}</div>
                      <div className="text-xs text-slate-500">{srv.duration_minutes} min</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600">{formatCurrency(srv.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profissionais */}
          {filteredProfessionals.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Profissionais
              </h5>
              <div className="space-y-1.5">
                {filteredProfessionals.map(prof => (
                  <div
                    key={prof.id}
                    onClick={() => {
                      navigate('/profissionais');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{prof.name}</div>
                      <div className="text-xs text-slate-500">{prof.specialties.join(', ')}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Pressione <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">ESC</kbd> para fechar</span>
          <span>Dica: Use <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">N</kbd> para novo agendamento</span>
        </div>
      </div>
    </Modal>
  );
};
