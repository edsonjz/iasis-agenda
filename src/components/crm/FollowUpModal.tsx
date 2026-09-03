import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { ClientFollowUp, FollowUpType, FollowUpStatus, Client } from '@/types';
import { generateFollowUpMessage } from '@/lib/crmEngine';
import { getWhatsAppUrl } from '@/lib/utils';
import { format } from 'date-fns';
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Calendar,
  User,
  Sparkles,
  Clock,
  Trash2
} from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  followUp?: ClientFollowUp | null;
  defaultClient?: Client | null;
  defaultType?: FollowUpType;
  defaultReason?: string;
  defaultDaysOverdue?: number;
  defaultProcedure?: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  followUp,
  defaultClient,
  defaultType = 'manual',
  defaultReason = '',
  defaultDaysOverdue = 0,
  defaultProcedure = 'Procedimento Estético',
}) => {
  const { clients, professionals, saveFollowUp, deleteFollowUp } = useBusiness();
  const { success, error: toastError } = useToast();

  const [clientId, setClientId] = useState(defaultClient?.id || clients[0]?.id || '');
  const [type, setType] = useState<FollowUpType>(defaultType);
  const [reason, setReason] = useState(defaultReason);
  const [recommendedDate, setRecommendedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [assignedToName, setAssignedToName] = useState(professionals[0]?.name || 'Dra. Camila');
  const [status, setStatus] = useState<FollowUpStatus>('pending');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClient = clients.find(c => c.id === clientId) || defaultClient || clients[0];

  useEffect(() => {
    if (followUp) {
      setClientId(followUp.client_id);
      setType(followUp.type);
      setReason(followUp.reason);
      setRecommendedDate(followUp.recommended_date);
      setAssignedToName(followUp.assigned_to_name || professionals[0]?.name || 'Dra. Camila');
      setStatus(followUp.status);
      setNotes(followUp.notes || '');
      setResult(followUp.result || '');
      setMessageText(followUp.generated_message || '');
    } else {
      const cId = defaultClient?.id || clients[0]?.id || '';
      setClientId(cId);
      setType(defaultType);
      setReason(defaultReason || (defaultType === 'risk_retention' ? 'Cliente acima do intervalo habitual de retorno' : 'Acompanhamento pós-procedimento'));
      setRecommendedDate(format(new Date(), 'yyyy-MM-dd'));
      setAssignedToName(professionals[0]?.name || 'Dra. Camila');
      setStatus('pending');
      setNotes('');
      setResult('');

      // Auto-generate suggested message
      const defaultTemplate =
        defaultType === 'risk_retention'
          ? 'Olá, {{cliente}}! Tudo bem? 😊 Passando para saber como estão seus cuidados! Percebemos que já se passaram {{dias_sem_visita}} dias desde seu último {{procedimento}}. Que tal renovar seus cuidados esta semana? 💕'
          : defaultType === 'post_procedure'
          ? 'Oi, {{cliente}}! Como ficou o resultado do seu {{procedimento}}? Espero que tenha amado! Me conta como está a cicatrização e se tiver qualquer dúvida é só chamar. ✨'
          : defaultType === 'inactive_recovery'
          ? 'Olá, {{cliente}}! Estamos com saudades de você aqui no espaço IASIS! Preparamos uma condição especial para sua volta este mês. Vamos agendar seu horário?'
          : 'Olá, {{cliente}}! Passando para checar como você está e se deseja garantir seu próximo atendimento de {{procedimento}}!';

      const formatted = generateFollowUpMessage(defaultTemplate, {
        cliente: defaultClient?.nickname || defaultClient?.name || 'Cliente',
        procedimento: defaultProcedure,
        dias_sem_visita: defaultDaysOverdue > 0 ? defaultDaysOverdue : 30,
        profissional: professionals[0]?.nickname || professionals[0]?.name || 'Dra. Camila',
      });
      setMessageText(formatted);
    }
  }, [followUp, defaultClient, defaultType, defaultReason, defaultDaysOverdue, defaultProcedure, isOpen, clients, professionals]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    success('Mensagem copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toastError('Selecione uma cliente');
      return;
    }
    if (!reason.trim()) {
      toastError('Motivo do follow-up é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      const flwData: ClientFollowUp = {
        id: followUp?.id || `flw_${Date.now()}`,
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        client_phone: selectedClient.whatsapp,
        type,
        reason: reason.trim(),
        recommended_date: recommendedDate,
        assigned_to_name: assignedToName,
        status,
        notes: notes.trim() || undefined,
        result: result.trim() || undefined,
        generated_message: messageText.trim() || undefined,
        contacted_at: status !== 'pending' ? (followUp?.contacted_at || new Date().toISOString()) : undefined,
        created_at: followUp?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveFollowUp(flwData);
      success(followUp ? 'Follow-up atualizado!' : 'Follow-up agendado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!followUp) return;
    if (confirm('Deseja excluir este follow-up?')) {
      await deleteFollowUp(followUp.id);
      success('Follow-up excluído');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={followUp ? 'Editar Follow-up' : 'Novo Follow-up & Contato de Retenção'}
      subtitle="Acompanhe o retorno e mantenha relacionamento próximo com a cliente"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cliente"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.whatsapp})
              </option>
            ))}
          </Select>

          <Select
            label="Tipo de Follow-up"
            value={type}
            onChange={e => setType(e.target.value as FollowUpType)}
          >
            <option value="risk_retention">Risco de Abandono (Acima do habitual)</option>
            <option value="post_procedure">Pós-Procedimento (Cicatrização / Cuidados)</option>
            <option value="return_maintenance">Retorno / Manutenção Periódica</option>
            <option value="inactive_recovery">Recuperação de Inativa</option>
            <option value="birthday">Aniversário da Cliente</option>
            <option value="manual">Manual / Outro</option>
          </Select>
        </div>

        <Input
          label="Motivo / Objetivo do Contato"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Ex: Cliente com 25 dias acima do retorno habitual de cílios"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Data Recomendada"
            type="date"
            value={recommendedDate}
            onChange={e => setRecommendedDate(e.target.value)}
            required
          />

          <Select
            label="Profissional Responsável"
            value={assignedToName}
            onChange={e => setAssignedToName(e.target.value)}
          >
            {professionals.map(p => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </Select>

          <Select
            label="Status do Contato"
            value={status}
            onChange={e => setStatus(e.target.value as FollowUpStatus)}
          >
            <option value="pending">Pendente (A realizar)</option>
            <option value="contacted">Contatado</option>
            <option value="responded">Cliente Respondeu</option>
            <option value="booked">Agendou Novo Horário</option>
            <option value="no_response">Não Respondeu</option>
            <option value="not_interested">Sem Interesse no Momento</option>
            <option value="reschedule">Reagendar Contato</option>
            <option value="completed">Concluído</option>
          </Select>
        </div>

        {/* Generated Message Generator & Editor */}
        <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Mensagem Sugerida para WhatsApp:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 text-rose-700 dark:text-rose-300 hover:bg-rose-100 flex items-center gap-1 shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Mensagem'}
              </button>

              {selectedClient && (
                <a
                  href={getWhatsAppUrl(selectedClient.whatsapp, messageText)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" /> Abrir WhatsApp
                </a>
              )}
            </div>
          </div>

          <textarea
            rows={3}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            className="w-full rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none leading-relaxed"
            placeholder="Digite ou personalize o texto que será enviado..."
          />
          <div className="text-[10px] text-slate-400">
            Você pode editar livremente o texto antes de copiar. Nenhuma mensagem é enviada automaticamente.
          </div>
        </div>

        {/* Contact outcome / notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Resultado do Contato (opcional)"
            value={result}
            onChange={e => setResult(e.target.value)}
            placeholder="Ex: Cliente agendou para próxima quinta às 14h"
          />
          <Input
            label="Observações Internas (opcional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Prefere mensagens pela manhã"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {followUp ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {followUp ? 'Salvar Alterações' : 'Agendar Follow-up'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
