import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Client, ClientFollowUp, FollowUpType } from '@/types';
import { format } from 'date-fns';
import { CheckSquare, Tag, MessageSquare, Download, Users } from 'lucide-react';
import { generateUUID } from '@/lib/utils';

interface BatchActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClients: Client[];
  onSuccess?: () => void;
}

export const BatchActionsModal: React.FC<BatchActionsModalProps> = ({
  isOpen,
  onClose,
  selectedClients,
  onSuccess,
}) => {
  const { saveFollowUp, saveClient } = useBusiness();
  const { success, error: toastError } = useToast();

  const [action, setAction] = useState<'create_followups' | 'add_tag' | 'export_csv'>('create_followups');
  const [followUpReason, setFollowUpReason] = useState('Campanha de Retenção & Reativação');
  const [followUpType, setFollowUpType] = useState<FollowUpType>('risk_retention');
  const [recommendedDate, setRecommendedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExportCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Email', 'Total Atendimentos', 'Total Gasto (R$)', 'Ultima Visita'];
    const rows = selectedClients.map(c => [
      `"${c.name}"`,
      `"${c.whatsapp}"`,
      `"${c.email || ''}"`,
      c.total_appointments || 0,
      (c.total_spent || 0).toFixed(2),
      `"${c.last_appointment_date || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes_iasis_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`${selectedClients.length} clientes exportadas para CSV com sucesso!`);
    onClose();
  };

  const handleExecute = async () => {
    if (selectedClients.length === 0) {
      toastError('Nenhuma cliente selecionada');
      return;
    }

    if (action === 'export_csv') {
      handleExportCSV();
      return;
    }

    try {
      setIsSubmitting(true);

      if (action === 'create_followups') {
        for (const client of selectedClients) {
          const flw: ClientFollowUp = {
            id: generateUUID(),
            client_id: client.id,
            client_name: client.name,
            client_phone: client.whatsapp,
            type: followUpType,
            reason: followUpReason,
            recommended_date: recommendedDate,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await saveFollowUp(flw);
        }
        success(`Follow-ups agendados para ${selectedClients.length} clientes!`);
      } else if (action === 'add_tag') {
        if (!newTag.trim()) {
          toastError('Digite o nome da tag');
          return;
        }
        for (const client of selectedClients) {
          const currentTags = client.tags || [];
          if (!currentTags.includes(newTag.trim())) {
            await saveClient({
              ...client,
              tags: [...currentTags, newTag.trim()],
            });
          }
        }
        success(`Tag "${newTag}" adicionada para ${selectedClients.length} clientes!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao executar ação em lote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ações em Lote para Clientes"
      subtitle={`${selectedClients.length} clientes selecionadas`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setAction('create_followups')}
            className={`py-2 px-1 rounded-lg transition-all text-center ${
              action === 'create_followups' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Agendar Follow-ups
          </button>
          <button
            type="button"
            onClick={() => setAction('add_tag')}
            className={`py-2 px-1 rounded-lg transition-all text-center ${
              action === 'add_tag' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Adicionar Tag
          </button>
          <button
            type="button"
            onClick={() => setAction('export_csv')}
            className={`py-2 px-1 rounded-lg transition-all text-center ${
              action === 'export_csv' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Exportar CSV
          </button>
        </div>

        {action === 'create_followups' && (
          <div className="space-y-3">
            <Select
              label="Tipo de Follow-up"
              value={followUpType}
              onChange={e => setFollowUpType(e.target.value as FollowUpType)}
            >
              <option value="risk_retention">Risco de Abandono (Reativação)</option>
              <option value="return_maintenance">Lembrete de Retorno</option>
              <option value="inactive_recovery">Recuperação de Inativa</option>
              <option value="manual">Campanha Especial / Oferta</option>
            </Select>

            <Input
              label="Motivo do Follow-up"
              value={followUpReason}
              onChange={e => setFollowUpReason(e.target.value)}
              required
            />

            <Input
              label="Data Prevista para Contato"
              type="date"
              value={recommendedDate}
              onChange={e => setRecommendedDate(e.target.value)}
              required
            />
          </div>
        )}

        {action === 'add_tag' && (
          <div className="space-y-3">
            <Input
              label="Nome da Tag"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder="Ex: Campanha Retorno Primavera, Black Friday, etc."
              required
            />
            <p className="text-[11px] text-slate-400">
              Esta tag será anexada à ficha de todas as {selectedClients.length} clientes selecionadas.
            </p>
          </div>
        )}

        {action === 'export_csv' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Download className="w-4 h-4 text-rose-600" />
              <span>Exportar Dados em Planilha Excel / CSV</span>
            </div>
            <p>
              Gera um arquivo <code>.csv</code> estruturado contendo Nome, WhatsApp, E-mail, Total Gasto e Data do Último Atendimento das {selectedClients.length} clientes.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" size="sm" loading={isSubmitting} onClick={handleExecute}>
            {action === 'export_csv' ? 'Baixar Planilha CSV' : 'Executar Ação'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
