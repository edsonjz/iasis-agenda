import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { AnamnesisTemplate, AnamnesisField, AnamnesisFieldType } from '@/types';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  FileText,
  CheckSquare,
  ListFilter,
  Sliders,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

interface AnamnesisBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: AnamnesisTemplate | null;
}

const FIELD_TYPES: { type: AnamnesisFieldType; label: string; icon: string }[] = [
  { type: 'short_text', label: 'Campo Curto (Texto)', icon: 'Aa' },
  { type: 'long_text', label: 'Campo Longo (Parágrafo)', icon: '¶' },
  { type: 'single_choice', label: 'Escolha Única (Opções)', icon: '◉' },
  { type: 'multiple_choice', label: 'Múltipla Escolha', icon: '☑' },
  { type: 'checkbox', label: 'Checkbox (Sim/Não)', icon: '✔' },
  { type: 'scale', label: 'Escala Numérica (1 a 5 ou 10)', icon: '1-5' },
  { type: 'number', label: 'Número', icon: '#' },
  { type: 'date', label: 'Data', icon: '📅' },
  { type: 'notice', label: 'Aviso / Texto Informativo', icon: 'ℹ' },
];

export const AnamnesisBuilderModal: React.FC<AnamnesisBuilderModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const { saveAnamnesisTemplate } = useBusiness();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('personalizado');
  const [termsText, setTermsText] = useState('');
  const [requiresSignature, setRequiresSignature] = useState(true);
  const [fields, setFields] = useState<AnamnesisField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description || '');
      setCategory(template.category);
      setTermsText(template.terms_text || '');
      setRequiresSignature(template.requires_signature);
      setFields(template.fields || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('personalizado');
      setTermsText('Declaro que todas as informações prestadas são verdadeiras e estou ciente das recomendações pós-procedimento.');
      setRequiresSignature(true);
      setFields([
        { id: `f_${Date.now()}_1`, type: 'single_choice', label: 'Possui alguma alergia conhecida?', required: true, options: ['Não', 'Sim'] },
        { id: `f_${Date.now()}_2`, type: 'long_text', label: 'Observações de saúde ou histórico médico', placeholder: 'Descreva caso possua alguma condição de saúde...', required: false },
      ]);
    }
  }, [template, isOpen]);

  const addField = (type: AnamnesisFieldType) => {
    const newField: AnamnesisField = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      label: type === 'notice' ? 'Aviso Importante' : 'Nova Pergunta',
      placeholder: '',
      required: type !== 'notice',
      options: type === 'single_choice' || type === 'multiple_choice' ? ['Opção 1', 'Opção 2'] : undefined,
      min: type === 'scale' ? 1 : undefined,
      max: type === 'scale' ? 5 : undefined,
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (id: string, updates: Partial<AnamnesisField>) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const copy = [...fields];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIdx, 0, item);
    setFields(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Título da ficha é obrigatório');
      return;
    }
    if (fields.length === 0) {
      toastError('Adicione pelo menos um campo à ficha');
      return;
    }

    try {
      setIsSubmitting(true);
      const tplData: AnamnesisTemplate = {
        id: template?.id || `t_${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        fields,
        terms_text: termsText.trim() || undefined,
        requires_signature: requiresSignature,
        active: true,
        created_at: template?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveAnamnesisTemplate(tplData);
      success(template ? 'Modelo de ficha atualizado!' : 'Modelo de ficha criado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar modelo de anamnese.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Editar Modelo de Anamnese' : 'Novo Modelo de Anamnese'}
      subtitle="Crie ou personalize formulários de avaliação estética para sua clínica"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Template General Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Título do Modelo"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Ficha de Extensão de Cílios"
              required
            />
          </div>
          <div>
            <Select
              label="Categoria"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="cilios">Cílios</option>
              <option value="labios">Lábios</option>
              <option value="sobrancelhas">Sobrancelhas</option>
              <option value="remocao">Remoção</option>
              <option value="facial">Facial</option>
              <option value="corporal">Corporal</option>
              <option value="personalizado">Personalizado</option>
            </Select>
          </div>
        </div>

        <Input
          label="Descrição Curta (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Avaliação de saúde ocular e mapeamento de fios..."
        />

        {/* Fields List */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Campos do Formulário ({fields.length})
            </h4>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                    Campo #{idx + 1} • {FIELD_TYPES.find(t => t.type === field.type)?.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveField(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => moveField(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1 text-red-500 hover:text-red-700 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Título / Pergunta do Campo"
                      value={field.label}
                      onChange={e => updateField(field.id, { label: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(field.id, { required: e.target.checked })}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      Obrigatório
                    </label>
                  </div>
                </div>

                {/* Options Editor for Choice Fields */}
                {(field.type === 'single_choice' || field.type === 'multiple_choice') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Opções (separadas por vírgula)
                    </label>
                    <Input
                      placeholder="Opção 1, Opção 2, Opção 3"
                      value={(field.options || []).join(', ')}
                      onChange={e =>
                        updateField(field.id, {
                          options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Field Buttons Toolbar */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              + Adicionar Campo à Ficha:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FIELD_TYPES.map(ft => (
                <button
                  key={ft.type}
                  type="button"
                  onClick={() => addField(ft.type)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-rose-500 hover:text-rose-600 transition-colors font-medium"
                >
                  + {ft.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms of Consent & Signature */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Termo de Consentimento & Responsabilidade
            </label>
            <textarea
              rows={2}
              value={termsText}
              onChange={e => setTermsText(e.target.value)}
              placeholder="Texto legal de ciência e consentimento da cliente..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresSignature"
              checked={requiresSignature}
              onChange={e => setRequiresSignature(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <label htmlFor="requiresSignature" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Exigir Assinatura Digital Touch no preenchimento
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            {template ? 'Salvar Alterações' : 'Criar Modelo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
