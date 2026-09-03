import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AnamnesisRecord } from '@/types';
import { formatDateBR, formatDateTimeBR } from '@/lib/dateUtils';
import { FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

interface AnamnesisRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AnamnesisRecord | null;
}

export const AnamnesisRecordModal: React.FC<AnamnesisRecordModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record.template_title}
      subtitle={`Preenchida e assinada em ${formatDateTimeBR(record.created_at)}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>Registro Imutável de Anamnese e Termo de Consentimento</span>
        </div>

        {/* Answers List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {record.fields_snapshot.map(field => {
            const answer = record.answers[field.id];

            return (
              <div
                key={field.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {field.label}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {typeof answer === 'boolean'
                    ? answer
                      ? 'Sim / Confirmado'
                      : 'Não'
                    : answer || '-'}
                </div>
              </div>
            );
          })}

          {/* Signature Rendering */}
          {record.signature_data_url && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Assinatura Digital da Cliente
              </span>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-center">
                <img
                  src={record.signature_data_url}
                  alt="Assinatura da Cliente"
                  className="max-h-28 object-contain"
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                Assinado digitalmente em: {formatDateTimeBR(record.signed_at || record.created_at)}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
