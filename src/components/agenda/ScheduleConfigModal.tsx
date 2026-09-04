import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Clock, CheckCircle2, Sparkles, Calendar, RotateCcw } from 'lucide-react';

interface ScheduleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DaySchedule {
  open: string;
  close: string;
  active: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const ScheduleConfigModal: React.FC<ScheduleConfigModalProps> = ({ isOpen, onClose }) => {
  const { settings, saveSettings } = useBusiness();
  const { success, error: toastError } = useToast();
  const [schedule, setSchedule] = useState<{ [key: string]: DaySchedule }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.business_hours) {
      setSchedule(settings.business_hours);
    } else {
      // Default 24h if not configured
      const default24h: { [key: string]: DaySchedule } = {};
      DAYS_OF_WEEK.forEach(d => {
        default24h[d.key] = { open: '00:00', close: '23:59', active: true };
      });
      setSchedule(default24h);
    }
  }, [settings, isOpen]);

  const handleApply24hAll = () => {
    const updated: { [key: string]: DaySchedule } = {};
    DAYS_OF_WEEK.forEach(d => {
      updated[d.key] = { open: '00:00', close: '23:59', active: true };
    });
    setSchedule(updated);
    success('Horário 24 horas aplicado para todos os dias!');
  };

  const handleApplyCommercialAll = () => {
    const updated: { [key: string]: DaySchedule } = {};
    DAYS_OF_WEEK.forEach(d => {
      if (d.key === 'sunday') {
        updated[d.key] = { open: '00:00', close: '00:00', active: false };
      } else if (d.key === 'saturday') {
        updated[d.key] = { open: '08:00', close: '16:00', active: true };
      } else {
        updated[d.key] = { open: '08:00', close: '20:00', active: true };
      }
    });
    setSchedule(updated);
    success('Horário comercial aplicado!');
  };

  const handleDayChange = (key: string, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { open: '08:00', close: '20:00', active: true }),
        [field]: value,
      },
    }));
  };

  const handleCopyDayToAll = (fromKey: string) => {
    const source = schedule[fromKey];
    if (!source) return;
    const updated = { ...schedule };
    DAYS_OF_WEEK.forEach(d => {
      updated[d.key] = { ...source };
    });
    setSchedule(updated);
    success(`Horário de ${DAYS_OF_WEEK.find(d => d.key === fromKey)?.label} copiado para todos os dias!`);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!settings) {
        toastError('Configurações não carregadas.');
        return;
      }
      await saveSettings({
        ...settings,
        business_hours: schedule,
      });
      success('Configuração de horários da agenda livre salva com sucesso!');
      onClose();
    } catch (err) {
      console.error('Erro ao salvar horários:', err);
      toastError('Erro ao salvar horários de atendimento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Agenda Livre & Horários"
      subtitle="Defina os horários disponíveis de atendimento por dia, semana ou libere 24h completas"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Quick Presets Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-rose-900 dark:text-rose-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Modelos Rápidos de Agenda
            </div>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300 font-medium">
              Escolha uma configuração rápida ou personalize os horários por dia:
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleApply24hAll}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors shadow-xs"
            >
              ⭐ 24 Horas Todos os Dias
            </button>
            <button
              type="button"
              onClick={handleApplyCommercialAll}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors shadow-xs"
            >
              Comercial (08h às 20h)
            </button>
          </div>
        </div>

        {/* Days of week list */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Horários por Dia da Semana
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {DAYS_OF_WEEK.map(day => {
              const current = schedule[day.key] || { open: '08:00', close: '20:00', active: true };
              const is24h = current.active && current.open === '00:00' && (current.close === '23:59' || current.close === '24:00');

              return (
                <div
                  key={day.key}
                  className={`p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    !current.active ? 'bg-slate-50/70 dark:bg-slate-950/40 opacity-70' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 w-40">
                    <input
                      type="checkbox"
                      id={`active-${day.key}`}
                      checked={current.active}
                      onChange={e => handleDayChange(day.key, 'active', e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <label htmlFor={`active-${day.key}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                      {day.label}
                    </label>
                  </div>

                  {current.active ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">De:</span>
                        <input
                          type="time"
                          value={current.open}
                          onChange={e => handleDayChange(day.key, 'open', e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Até:</span>
                        <input
                          type="time"
                          value={current.close === '23:59' ? '23:59' : current.close}
                          onChange={e => handleDayChange(day.key, 'close', e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>

                      {is24h && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          24h Livre
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyDayToAll(day.key)}
                        title="Copiar este horário para todos os outros dias da semana"
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-auto sm:ml-2"
                      >
                        Copiar para todos
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 italic">
                      Agenda fechada neste dia
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} icon={<CheckCircle2 className="w-4 h-4" />}>
            {isSaving ? 'Salvando...' : 'Salvar Horários da Agenda'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
