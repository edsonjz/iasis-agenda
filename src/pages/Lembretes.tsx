import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Select } from '@/components/common/Select';
import { TEMPLATE_VARIABLES } from '@/lib/constants';
import { formatCurrency, formatPhone, getWhatsAppUrl } from '@/lib/utils';
import { formatDateBR, formatTimeBR } from '@/lib/dateUtils';
import { NotificationTemplate } from '@/types';
import {
  MessageSquare,
  Copy,
  MessageCircle,
  Sparkles,
  Info,
  Calendar,
  User,
  CheckCircle2,
  Edit
} from 'lucide-react';

export const Lembretes: React.FC = () => {
  const { templates, clients, appointments, professionals, saveTemplate } = useBusiness();
  const { success } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate>(templates[0] || {
    id: 'm1',
    category: 'reminder_24h',
    title: 'Lembrete de Atendimento (24h antes)',
    content: 'Olá, {{cliente}}! Passando para confirmar seu atendimento...',
    is_default: true,
  });

  const [testClientId, setTestClientId] = useState(clients[0]?.id || '');
  const [testAppointmentId, setTestAppointmentId] = useState(appointments[0]?.id || '');

  const targetClient = clients.find(c => c.id === testClientId) || clients[0];
  const targetAppointment = appointments.find(a => a.id === testAppointmentId) || appointments[0];

  // Helper to replace dynamic template tags
  const renderTemplateText = (content: string) => {
    let text = content;
    text = text.replace(/{{cliente}}/g, targetClient?.name || 'Mariana');
    text = text.replace(/{{data}}/g, targetAppointment ? formatDateBR(targetAppointment.start_time) : '10/09/2026');
    text = text.replace(/{{hora}}/g, targetAppointment ? formatTimeBR(targetAppointment.start_time) : '14:00');
    text = text.replace(/{{servico}}/g, targetAppointment?.service?.name || 'Extensão de Cílios');
    text = text.replace(/{{profissional}}/g, targetAppointment?.professional?.nickname || targetAppointment?.professional?.name || 'Dra. Camila');
    text = text.replace(/{{valor}}/g, targetAppointment ? formatCurrency(targetAppointment.final_price) : 'R$ 180,00');
    text = text.replace(/{{valor_sinal}}/g, targetAppointment?.deposit_amount ? formatCurrency(targetAppointment.deposit_amount) : 'R$ 54,00');
    return text;
  };

  const previewText = renderTemplateText(selectedTemplate.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    success('Mensagem copiada para a área de transferência!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-rose-600" /> Central de Mensagens & Lembretes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gere lembretes personalizados com variáveis automáticas para enviar às clientes
          </p>
        </div>
      </div>

      {/* WhatsApp Automation Roadmap Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <span className="font-bold">Arquitetura de Mensagens:</span> O IASIS AGENDA prepara o texto formatado com todas as variáveis preenchidas para você copiar ou abrir diretamente no WhatsApp Web em 1 clique.
          <span className="block mt-0.5 text-blue-700 dark:text-blue-300 font-medium">
            Disponível para configuração futura: Disparos 100% automáticos via WhatsApp Business Cloud API Oficial.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Template Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Modelos de Mensagens
          </h3>

          <div className="space-y-2">
            {templates.map(tpl => (
              <Card
                key={tpl.id}
                hoverable
                onClick={() => setSelectedTemplate(tpl)}
                className={`p-4 transition-all ${
                  selectedTemplate.id === tpl.id
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 ring-1 ring-rose-500'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {tpl.title}
                  </h4>
                  {tpl.is_default && (
                    <Badge variant="primary" className="text-[10px]">
                      Padrão
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {tpl.content}
                </p>
              </Card>
            ))}
          </div>

          {/* Variables Reference Box */}
          <Card className="p-4 bg-slate-50 dark:bg-slate-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Variáveis Disponíveis
            </h4>
            <div className="space-y-1.5 text-xs">
              {TEMPLATE_VARIABLES.map(v => (
                <div key={v.tag} className="flex items-center justify-between text-[11px]">
                  <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 font-bold">
                    {v.tag}
                  </code>
                  <span className="text-slate-500">{v.description}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Live Preview and Quick Send */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-5">
            {/* Header / Selector of test client */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pré-visualização: {selectedTemplate.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Simule o texto final gerado substituindo com dados reais
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={testClientId}
                  onChange={e => setTestClientId(e.target.value)}
                  className="text-xs py-1.5"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      Cliente: {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Preview Chat Bubble (WhatsApp Style) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-850 border border-emerald-100 dark:border-slate-800 max-w-lg mx-auto shadow-sm">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-sm border border-slate-200/60 dark:border-slate-800 relative">
                {previewText}
                <div className="text-right text-[10px] text-slate-400 mt-2">
                  14:32 ✓✓
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                icon={<Copy className="w-4 h-4" />}
              >
                Copiar Mensagem
              </Button>

              {targetClient && (
                <a
                  href={getWhatsAppUrl(targetClient.whatsapp, previewText)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 text-xs px-4 py-2.5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir no WhatsApp ({formatPhone(targetClient.whatsapp)})
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
