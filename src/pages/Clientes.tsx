import React, { useState, useMemo, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ClientModal } from '@/components/clients/ClientModal';
import { ClientProfileDrawer } from '@/components/clients/ClientProfileDrawer';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { formatCurrency, formatPhone, getWhatsAppUrl } from '@/lib/utils';
import { formatDateBR } from '@/lib/dateUtils';
import { Client } from '@/types';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Eye,
  Edit,
  Tag,
  Calendar,
  Sparkles,
  Phone
} from 'lucide-react';

export const Clientes: React.FC = () => {
  const { clients } = useBusiness();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Check URL params for quick actions (e.g. ?id=u1 or ?new=true)
  useEffect(() => {
    const idParam = searchParams.get('id');
    const newParam = searchParams.get('new');

    if (idParam) {
      const found = clients.find(c => c.id === idParam);
      if (found) {
        setSelectedClient(found);
        setIsProfileOpen(true);
      }
    } else if (newParam === 'true') {
      setSelectedClient(null);
      setIsModalOpen(true);
    }
  }, [searchParams, clients]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    clients.forEach(c => c.tags?.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [clients]);

  // Filter clients
  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(c => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nickname && c.nickname.toLowerCase().includes(q)) ||
        c.whatsapp.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q));

      const matchesTag = selectedTag === 'all' || (c.tags && c.tags.includes(selectedTag));

      return matchesQuery && matchesTag;
    });
  }, [clients, searchQuery, selectedTag]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" /> Clientes da Estética
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie cadastros, histórico 360º, preferências e fichas de clientes
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Nova Cliente
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, WhatsApp ou e-mail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedTag('all')}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                selectedTag === 'all'
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas ({clients.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <Card
            key={client.id}
            hoverable
            onClick={() => {
              setSelectedClient(client);
              setIsProfileOpen(true);
            }}
            className="p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Client Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {client.name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {formatPhone(client.whatsapp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <a
                    href={getWhatsAppUrl(client.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {client.tags.map(t => (
                    <Badge key={t} variant="primary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Stats */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block font-semibold text-slate-700 dark:text-slate-300">
                  {client.total_appointments} atendimentos
                </span>
                <span className="text-[10px] text-slate-400">
                  Última visita: {formatDateBR(client.last_appointment_date)}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(client.total_spent)}
                </span>
                <span className="text-[10px] text-slate-400">Gasto total</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="p-8 text-center text-slate-500 text-xs">
          Nenhuma cliente encontrada para os critérios selecionados.
        </Card>
      )}

      {/* Client Edit / Create Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />

      {/* 360º Profile Drawer */}
      <ClientProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onEdit={cl => {
          setIsProfileOpen(false);
          setSelectedClient(cl);
          setIsModalOpen(true);
        }}
        onNewAppointmentForClient={cl => {
          setIsProfileOpen(false);
          setSelectedClient(cl);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Appointment Modal prefilled with this client */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </div>
  );
};
