import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Appointment, AppointmentStatus, PaymentMethod } from '@/types';
import { checkScheduleConflict, formatTimeBR, formatDateBR } from '@/lib/dateUtils';
import { formatCurrency, getWhatsAppUrl } from '@/lib/utils';
import { APPOINTMENT_STATUS_MAP, PAYMENT_METHODS_MAP } from '@/lib/constants';
import { AlertCircle, Plus, Copy, Calendar, Clock, DollarSign, User, Sparkles, MessageCircle } from 'lucide-react';
import { format, parseISO, addMinutes } from 'date-fns';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  initialDate?: Date;
  initialProfessionalId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  initialDate,
  initialProfessionalId,
}) => {
  const { clients, services, professionals, appointments, saveAppointment, deleteAppointment, saveClient, settings } = useBusiness();
  const { success, error: toastError, warning } = useToast();

  const [clientId, setClientId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [depositRequested, setDepositRequested] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositPaid, setDepositPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'partially_paid'>('pending');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientWhatsApp, setNewClientWhatsApp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when appointment changes or opens
  useEffect(() => {
    if (appointment) {
      setClientId(appointment.client_id);
      setProfessionalId(appointment.professional_id);
      setServiceId(appointment.service_id);
      const appStart = parseISO(appointment.start_time);
      setDate(format(appStart, 'yyyy-MM-dd'));
      setTime(format(appStart, 'HH:mm'));
      setDurationMinutes(appointment.duration_minutes);
      setStatus(appointment.status);
      setPrice(appointment.price);
      setDiscount(appointment.discount || 0);
      setDepositRequested(appointment.deposit_requested || false);
      setDepositAmount(appointment.deposit_amount || 0);
      setDepositPaid(appointment.deposit_paid || false);
      setPaymentMethod(appointment.payment_method || 'pix');
      setPaymentStatus(appointment.payment_status || 'pending');
      setNotes(appointment.notes || '');
      setInternalNotes(appointment.internal_notes || '');
    } else {
      const defaultDate = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      setDate(defaultDate);
      setTime('09:00');
      setClientId(clients[0]?.id || '');
      setProfessionalId(initialProfessionalId || professionals[0]?.id || '');
      const firstService = services[0];
      if (firstService) {
        setServiceId(firstService.id);
        setDurationMinutes(firstService.duration_minutes);
        setPrice(firstService.promotional_price || firstService.price);
      }
      setStatus('scheduled');
      setDiscount(0);
      setDepositRequested(settings?.require_deposit_by_default || false);
      setDepositAmount(settings?.default_deposit_fixed_amount || 50);
      setDepositPaid(false);
      setPaymentMethod('pix');
      setPaymentStatus('pending');
      setNotes('');
      setInternalNotes('');
    }
  }, [appointment, isOpen, initialDate, initialProfessionalId, clients, professionals, services, settings]);

  // Handle service change to auto-fill price and duration
  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const selected = services.find(s => s.id === id);
    if (selected) {
      setDurationMinutes(selected.duration_minutes);
      const basePrice = selected.promotional_price || selected.price;
      setPrice(basePrice);
      if (depositRequested && settings?.default_deposit_percentage) {
        setDepositAmount((basePrice * settings.default_deposit_percentage) / 100);
      }
    }
  };

  // Conflict Detection
  const conflictInfo = useMemo(() => {
    if (!date || !time || !professionalId || !durationMinutes) return { hasConflict: false };
    const startDateTime = `${date}T${time}:00`;
    return checkScheduleConflict({
      professionalId,
      startDateTime,
      durationMinutes,
      existingAppointments: appointments,
      excludeAppointmentId: appointment?.id,
    });
  }, [date, time, professionalId, durationMinutes, appointments, appointment]);

  const finalPrice = Math.max(0, price - discount);

  // Quick Client Creation
  const handleCreateQuickClient = async () => {
    if (!newClientName || !newClientWhatsApp) {
      toastError('Preencha o nome e WhatsApp da cliente');
      return;
    }
    const newClient = {
      id: Math.random().toString(36).substring(2, 9),
      name: newClientName,
      whatsapp: newClientWhatsApp.replace(/\D/g, ''),
      allow_contact: true,
      tags: ['Nova cliente'],
      total_appointments: 0,
      total_spent: 0,
      active: true,
      created_at: new Date().toISOString(),
    };
    await saveClient(newClient);
    setClientId(newClient.id);
    setIsQuickClientOpen(false);
    setNewClientName('');
    setNewClientWhatsApp('');
    success('Cliente cadastrada com sucesso!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toastError('Por favor, selecione uma cliente');
      return;
    }
    if (!professionalId) {
      toastError('Por favor, selecione uma profissional');
      return;
    }
    if (!serviceId) {
      toastError('Por favor, selecione um serviço');
      return;
    }
    if (conflictInfo.hasConflict) {
      warning('Aviso: Este horário colide com outro agendamento desta profissional. Ajuste o horário antes de salvar.');
      return;
    }

    try {
      setIsSubmitting(true);
      const startDateTime = `${date}T${time}:00`;
      const startIso = parseISO(startDateTime);
      const endIso = addMinutes(startIso, durationMinutes);

      const appData: Appointment = {
        id: appointment?.id || Math.random().toString(36).substring(2, 9),
        client_id: clientId,
        professional_id: professionalId,
        service_id: serviceId,
        start_time: format(startIso, "yyyy-MM-dd'T'HH:mm:ss"),
        end_time: format(endIso, "yyyy-MM-dd'T'HH:mm:ss"),
        duration_minutes: durationMinutes,
        status,
        price,
        discount,
        final_price: finalPrice,
        deposit_requested: depositRequested,
        deposit_amount: depositAmount,
        deposit_paid: depositPaid,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes,
        internal_notes: internalNotes,
        created_at: appointment?.created_at || new Date().toISOString(),
      };

      await saveAppointment(appData);
      success(appointment ? 'Agendamento atualizado!' : 'Agendamento criado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Não foi possível salvar o agendamento. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy WhatsApp Confirmation
  const handleCopyConfirmation = () => {
    const targetClient = clients.find(c => c.id === clientId);
    const targetService = services.find(s => s.id === serviceId);
    const targetProf = professionals.find(p => p.id === professionalId);

    const msg = `Olá, ${targetClient?.name || 'Cliente'}! Tudo bem? 😊\n\nConfirmando seu atendimento no *IASIS AGENDA*:\n📅 Data: ${formatDateBR(date)}\n⏰ Horário: ${time}\n💅 Serviço: ${targetService?.name}\n👩‍⚕️ Profissional: ${targetProf?.nickname || targetProf?.name}\n💰 Valor: ${formatCurrency(finalPrice)}\n\nNos vemos em breve! ✨`;

    navigator.clipboard.writeText(msg);
    success('Mensagem de confirmação copiada!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
      subtitle="Preencha os dados do atendimento na estética"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Conflict Warning Alert */}
        {conflictInfo.hasConflict && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Conflito de Horário detectado!</span>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                Esta profissional já possui atendimento marcado neste mesmo horário. Por favor, escolha outro horário ou profissional.
              </p>
            </div>
          </div>
        )}

        {/* Client Selection Row */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Cliente <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsQuickClientOpen(!isQuickClientOpen)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Cadastrar nova cliente
            </button>
          </div>

          {isQuickClientOpen ? (
            <div className="p-3.5 mb-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 space-y-3">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-200">Cadastro Rápido de Cliente</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Nome completo"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                />
                <Input
                  placeholder="WhatsApp (ex: 11987654321)"
                  value={newClientWhatsApp}
                  onChange={e => setNewClientWhatsApp(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsQuickClientOpen(false)}>
                  Cancelar
                </Button>
                <Button size="sm" type="button" onClick={handleCreateQuickClient}>
                  Salvar Cliente
                </Button>
              </div>
            </div>
          ) : (
            <Select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              required
            >
              <option value="">Selecione uma cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.whatsapp}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Service & Professional Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Serviço / Procedimento"
            value={serviceId}
            onChange={e => handleServiceChange(e.target.value)}
            required
          >
            <option value="">Selecione um serviço...</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration_minutes} min — {formatCurrency(s.promotional_price || s.price)})
              </option>
            ))}
          </Select>

          <Select
            label="Profissional Responsável"
            value={professionalId}
            onChange={e => setProfessionalId(e.target.value)}
            required
          >
            <option value="">Selecione uma profissional...</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.nickname ? `(${p.nickname})` : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* Date, Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <Input
            label="Horário de Início"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
          />
          <Input
            label="Duração (minutos)"
            type="number"
            min={15}
            step={15}
            value={durationMinutes}
            onChange={e => setDurationMinutes(Number(e.target.value))}
            required
          />
        </div>

        {/* Price, Discount & Final Price Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Bruto (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Desconto (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Final</label>
            <div className="text-base font-bold text-rose-600 dark:text-rose-400 py-2.5">
              {formatCurrency(finalPrice)}
            </div>
          </div>
        </div>

        {/* Status & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Status do Atendimento"
            value={status}
            onChange={e => setStatus(e.target.value as AppointmentStatus)}
          >
            {Object.entries(APPOINTMENT_STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </Select>

          <Select
            label="Forma de Pagamento"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {Object.entries(PAYMENT_METHODS_MAP).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            label="Status do Pagamento"
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value as any)}
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="partially_paid">Sinal Pago / Parcial</option>
          </Select>
        </div>

        {/* Deposit Section Toggle */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={depositRequested}
                onChange={e => setDepositRequested(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              Solicitar Sinal de Reserva
            </label>
            {depositRequested && (
              <span className="text-[11px] text-slate-500">Chave PIX: {settings?.pix_key || 'pix@iasisagenda.com.br'}</span>
            )}
          </div>

          {depositRequested && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <Input
                label="Valor do Sinal (R$)"
                type="number"
                step="0.01"
                value={depositAmount}
                onChange={e => setDepositAmount(Number(e.target.value))}
              />
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={depositPaid}
                    onChange={e => setDepositPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  Sinal já foi pago pela cliente
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Observações do Procedimento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Cílios efeito fox, tonalidade castanho médio..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Observações Internas (Somente equipe)
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              placeholder="Ex: Cliente prefere atendimento pontual..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {appointment && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (confirm('Deseja excluir este agendamento?')) {
                    await deleteAppointment(appointment.id);
                    success('Agendamento excluído');
                    onClose();
                  }
                }}
              >
                Excluir
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyConfirmation}
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              Copiar Msg WhatsApp
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {appointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
