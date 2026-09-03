import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AnamnesisBuilderModal } from '@/components/anamnesis/AnamnesisBuilderModal';
import { AnamnesisTemplate } from '@/types';
import {
  FileText,
  Plus,
  Edit,
  Copy,
  Trash2,
  Sparkles,
  CheckCircle2,
  PenTool,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const Anamnese: React.FC = () => {
  const { anamnesisTemplates, saveAnamnesisTemplate, deleteAnamnesisTemplate } = useBusiness();
  const { success } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<AnamnesisTemplate | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleDuplicate = async (tpl: AnamnesisTemplate) => {
    const duplicated: AnamnesisTemplate = {
      ...tpl,
      id: `t_${Date.now()}`,
      title: `${tpl.title} (Cópia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveAnamnesisTemplate(duplicated);
    success('Modelo duplicado com sucesso!');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este modelo de ficha de anamnese?')) {
      await deleteAnamnesisTemplate(id);
      success('Modelo excluído com sucesso');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-600" /> Fichas de Anamnese & Construtor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modelos pré-configurados e construtor visual de formulários com assinatura digital
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedTemplate(null);
            setIsBuilderOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Criar Ficha do Zero
        </Button>
      </div>

      {/* Security & Immutability Badge */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 dark:text-emerald-200">
          <span className="font-bold">Histórico Imutável & LGPD:</span> Toda vez que uma cliente preenche uma ficha, é gravado um snapshot dos campos daquele momento. Alterações futuras no modelo nunca alteram fichas passadas.
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {anamnesisTemplates.map(tpl => (
          <Card
            key={tpl.id}
            className="p-5 flex flex-col justify-between space-y-4 border-slate-200 dark:border-slate-800"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="primary" className="text-[10px] mb-2 uppercase">
                    {tpl.category}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {tpl.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(tpl)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Duplicar modelo"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setIsBuilderOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Editar construtor"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Excluir modelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {tpl.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {tpl.description}
                </p>
              )}

              {/* Fields overview */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Perguntas ({tpl.fields.length}):
                </span>
                <div className="space-y-1">
                  {tpl.fields.slice(0, 4).map((f, i) => (
                    <div
                      key={f.id}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 truncate"
                    >
                      <span className="w-4 text-slate-400 text-[10px] font-mono">{i + 1}.</span>
                      <span className="truncate">{f.label}</span>
                      {f.required && <span className="text-rose-500 text-[10px]">*</span>}
                    </div>
                  ))}
                  {tpl.fields.length > 4 && (
                    <span className="text-[11px] text-slate-400 pl-6 block">
                      +{tpl.fields.length - 4} outros campos
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                {tpl.requires_signature ? (
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                    <PenTool className="w-3.5 h-3.5" /> Exige Assinatura
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Sem assinatura</span>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setIsBuilderOpen(true);
                }}
              >
                Abrir Construtor
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Anamnesis Builder Modal */}
      <AnamnesisBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </div>
  );
};
