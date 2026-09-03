import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { TreatmentEvolution, Client } from '@/types';
import { format } from 'date-fns';
import { Sparkles, Package, Trash2 } from 'lucide-react';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  evolution?: TreatmentEvolution | null;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  isOpen,
  onClose,
  client,
  evolution,
}) => {
  const { professionals, products, services, saveEvolution, deleteEvolution } = useBusiness();
  const { success, error: toastError } = useToast();

  const [procedureName, setProcedureName] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [reactionResult, setReactionResult] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (evolution) {
      setProcedureName(evolution.procedure_name);
      setProfessionalId(evolution.professional_id);
      setSessionNumber(evolution.session_number || 1);
      setDate(evolution.date);
      setDescription(evolution.description);
      setSelectedProducts(evolution.products_used || []);
      setReactionResult(evolution.reaction_result || '');
      setClientFeedback(evolution.client_feedback || '');
      setRecommendations(evolution.recommendations || '');
      setNextSessionDate(evolution.next_session_date || '');
    } else {
      setProcedureName(services[0]?.name || 'Extensão de Cílios');
      setProfessionalId(professionals[0]?.id || '');
      setSessionNumber(1);
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setDescription('');
      setSelectedProducts([]);
      setReactionResult('');
      setClientFeedback('');
      setRecommendations('');
      setNextSessionDate('');
    }
  }, [evolution, isOpen, services, professionals]);

  const toggleProduct = (productName: string) => {
    setSelectedProducts(prev =>
      prev.includes(productName)
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toastError('Descrição técnica do procedimento é obrigatória');
      return;
    }

    try {
      setIsSubmitting(true);
      const evoData: TreatmentEvolution = {
        id: evolution?.id || `evo_${Date.now()}`,
        client_id: client.id,
        professional_id: professionalId || professionals[0]?.id || '',
        procedure_name: procedureName,
        session_number: sessionNumber,
        date,
        description: description.trim(),
        products_used: selectedProducts,
        reaction_result: reactionResult.trim() || undefined,
        client_feedback: clientFeedback.trim() || undefined,
        recommendations: recommendations.trim() || undefined,
        next_session_date: nextSessionDate || undefined,
        created_at: evolution?.created_at || new Date().toISOString(),
      };

      await saveEvolution(evoData);
      success(evolution ? 'Registro de evolução atualizado!' : 'Evolução registrada com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar evolução.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={evolution ? 'Editar Registro de Evolução' : 'Nova Evolução de Procedimento'}
      subtitle={`Cliente: ${client.name}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Procedimento Realizado"
              value={procedureName}
              onChange={e => setProcedureName(e.target.value)}
              placeholder="Ex: Extensão Volume Brasileiro"
              required
            />
          </div>
          <div>
            <Input
              label="Nº da Sessão"
              type="number"
              min={1}
              value={sessionNumber}
              onChange={e => setSessionNumber(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Profissional Responsável"
            value={professionalId}
            onChange={e => setProfessionalId(e.target.value)}
            required
          >
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Input
            label="Data do Atendimento"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Descrição Técnica do Procedimento <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Mapping Fox Eyes, curvatura D, espessura 0.07, tamanhos 8 a 13. Isolamento correto, sem ardência..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            required
          />
        </div>

        {/* Products selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-rose-500" /> Produtos & Materiais Utilizados
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
            {products.map(p => {
              const isSelected = selectedProducts.includes(p.name);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white font-semibold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Reação / Resultado Imediato
            </label>
            <Input
              value={reactionResult}
              onChange={e => setReactionResult(e.target.value)}
              placeholder="Ex: Excelente retenção, pele calma"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Data Sugerida para Retorno / Manutenção
            </label>
            <Input
              type="date"
              value={nextSessionDate}
              onChange={e => setNextSessionDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Recomendações Passadas para a Cliente (Home Care)
          </label>
          <Input
            value={recommendations}
            onChange={e => setRecommendations(e.target.value)}
            placeholder="Ex: Não molhar nas primeiras 24h, aplicar sérum regenerador 2x ao dia"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {evolution ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                if (confirm('Deseja excluir este registro de evolução?')) {
                  await deleteEvolution(evolution.id);
                  success('Registro excluído');
                  onClose();
                }
              }}
            >
              Excluir
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {evolution ? 'Salvar Alterações' : 'Registrar Evolução'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
