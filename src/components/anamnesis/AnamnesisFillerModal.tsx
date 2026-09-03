import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { SignatureCanvas } from '../signature/SignatureCanvas';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { AnamnesisTemplate, AnamnesisRecord, Client } from '@/types';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnamnesisFillerModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  template?: AnamnesisTemplate | null;
  appointmentId?: string;
  onSuccess?: () => void;
}

export const AnamnesisFillerModal: React.FC<AnamnesisFillerModalProps> = ({
  isOpen,
  onClose,
  client,
  template: initialTemplate,
  appointmentId,
  onSuccess,
}) => {
  const { anamnesisTemplates, saveAnamnesisRecord, professionals } = useBusiness();
  const { success, error: toastError } = useToast();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplate?.id || anamnesisTemplates[0]?.id || ''
  );
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [signatureData, setSignatureData] = useState<string>('');
  const [professionalId, setProfessionalId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTemplate =
    anamnesisTemplates.find(t => t.id === selectedTemplateId) || initialTemplate || anamnesisTemplates[0];

  useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplateId(initialTemplate.id);
    }
    setAnswers({});
    setSignatureData('');
    setProfessionalId(professionals[0]?.id || '');
  }, [initialTemplate, isOpen, professionals]);

  const handleAnswerChange = (fieldId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) {
      toastError('Selecione um modelo de ficha');
      return;
    }

    // Validate required fields
    for (const field of currentTemplate.fields) {
      if (field.required && (answers[field.id] === undefined || answers[field.id] === '')) {
        toastError(`Por favor, responda o campo: "${field.label}"`);
        return;
      }
    }

    if (currentTemplate.requires_signature && !signatureData) {
      toastError('A assinatura digital da cliente é obrigatória');
      return;
    }

    try {
      setIsSubmitting(true);
      const record: AnamnesisRecord = {
        id: `rec_${Date.now()}`,
        client_id: client.id,
        template_id: currentTemplate.id,
        template_title: currentTemplate.title,
        appointment_id: appointmentId,
        professional_id: professionalId || undefined,
        fields_snapshot: currentTemplate.fields, // Immutable snapshot
        answers,
        signature_data_url: signatureData || undefined,
        signed_at: signatureData ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
      };

      await saveAnamnesisRecord(record);
      success('Ficha de anamnese salva com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar ficha de anamnese.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTemplate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preencher Anamnese — ${client.name}`}
      subtitle={currentTemplate.title}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Template Selector if opening generic */}
        {!initialTemplate && anamnesisTemplates.length > 1 && (
          <Select
            label="Selecione o Modelo de Ficha"
            value={selectedTemplateId}
            onChange={e => {
              setSelectedTemplateId(e.target.value);
              setAnswers({});
            }}
          >
            {anamnesisTemplates.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        )}

        {/* Dynamic Form Fields Rendering */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {currentTemplate.fields.map(field => {
            const val = answers[field.id];

            return (
              <div
                key={field.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5"
              >
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {field.label}
                  {field.required && <span className="text-rose-500 ml-1">*</span>}
                </label>

                {/* Short text */}
                {field.type === 'short_text' && (
                  <Input
                    placeholder={field.placeholder || 'Digite sua resposta...'}
                    value={val || ''}
                    onChange={e => handleAnswerChange(field.id, e.target.value)}
                    required={field.required}
                  />
                )}

                {/* Long text */}
                {field.type === 'long_text' && (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || 'Detalhes...'}
                    value={val || ''}
                    onChange={e => handleAnswerChange(field.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                    required={field.required}
                  />
                )}

                {/* Single choice / Radio */}
                {field.type === 'single_choice' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(field.options || ['Sim', 'Não']).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(field.id, opt)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                          val === opt
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={e => handleAnswerChange(field.id, e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                    />
                    <span>Marque se verdadeiro / confirmado</span>
                  </label>
                )}

                {/* Scale (1 to 5) */}
                {field.type === 'scale' && (
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleAnswerChange(field.id, num)}
                        className={`w-9 h-9 rounded-xl border font-bold text-xs transition-all ${
                          val === num
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {/* Number */}
                {field.type === 'number' && (
                  <Input
                    type="number"
                    value={val || ''}
                    onChange={e => handleAnswerChange(field.id, e.target.value)}
                    required={field.required}
                  />
                )}

                {/* Date */}
                {field.type === 'date' && (
                  <Input
                    type="date"
                    value={val || ''}
                    onChange={e => handleAnswerChange(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            );
          })}

          {/* Terms text */}
          {currentTemplate.terms_text && (
            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200">
              <span className="font-bold block mb-1">Termo de Ciência:</span>
              <p className="italic leading-relaxed">{currentTemplate.terms_text}</p>
            </div>
          )}

          {/* Signature Canvas */}
          {currentTemplate.requires_signature && (
            <SignatureCanvas
              onSave={dataUrl => setSignatureData(dataUrl)}
              initialValue={signatureData}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Salvar e Assinar Ficha
          </Button>
        </div>
      </form>
    </Modal>
  );
};
