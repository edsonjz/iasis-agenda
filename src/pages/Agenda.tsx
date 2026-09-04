import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { ScheduleConfigModal } from '@/components/agenda/ScheduleConfigModal';
import { formatCurrency } from '@/lib/utils';
import { formatDateBR, formatTimeBR, getDayOfWeekName, getMonthYearName } from '@/lib/dateUtils';
import { APPOINTMENT_STATUS_MAP } from '@/lib/constants';
import { Appointment, AppointmentStatus } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  User,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month';

export const Agenda: React.FC = () => {
  const { appointments, professionals, settings } = useBusiness();
  const { error: toastError } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<Date>(new Date());

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current hour
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const targetTime = `${currentHour.toString().padStart(2, '0')}:00`;
      const el = document.getElementById(`slot-${targetTime}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [viewMode, currentDate]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(prev => subDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(prev => addDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      if (selectedProfId !== 'all' && app.professional_id !== selectedProfId) return false;
      if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;
      return true;
    });
  }, [appointments, selectedProfId, selectedStatus]);

  // 24 Hours available (00:00 to 23:30 - 48 slots)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h <= 23; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Helper to check if slot is within configured free business hours
  const isSlotInBusinessHours = (date: Date, timeStr: string) => {
    if (!settings?.business_hours) return true;
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[date.getDay()];
    const config = settings.business_hours[dayKey];
    if (!config || !config.active) return false;
    const closeTime = config.close === '23:59' ? '24:00' : config.close;
    return timeStr >= config.open && timeStr < closeTime;
  };

  // Week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Starts Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Month days
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handleCreateAtSlot = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const slotStartMins = hours * 60 + minutes;
    const slotEndMins = slotStartMins + 30;

    // Check if slot has active appointment
    const hasActiveAppointment = filteredAppointments.some(app => {
      if (app.status === 'cancelled' || app.status === 'no_show') return false;
      const appStart = parseISO(app.start_time);
      const appEnd = parseISO(app.end_time);
      if (!isSameDay(appStart, date)) return false;
      if (selectedProfId !== 'all' && app.professional_id !== selectedProfId) return false;
      const appStartMins = appStart.getHours() * 60 + appStart.getMinutes();
      const appEndMins = appEnd.getHours() * 60 + appEnd.getMinutes();
      return slotStartMins < appEndMins && slotEndMins > appStartMins;
    });

    if (hasActiveAppointment) {
      toastError('Horário Bloqueado! Já existe um atendimento agendado para este período.');
      return;
    }

    const targetDate = new Date(date);
    targetDate.setHours(hours, minutes, 0, 0);
    setModalInitialDate(targetDate);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Header: Controls, Filters & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shrink-0 shadow-xs">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} title="Anterior">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} title="Próximo">
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="ml-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-none">
              {viewMode === 'day' && `${getDayOfWeekName(currentDate)}, ${formatDateBR(currentDate)}`}
              {viewMode === 'week' && `Semana de ${formatDateBR(weekDays[0])} a ${formatDateBR(weekDays[6])}`}
              {viewMode === 'month' && getMonthYearName(currentDate)}
            </h2>
          </div>
        </div>

        {/* View Mode & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Professional Selector */}
          <select
            value={selectedProfId}
            onChange={e => setSelectedProfId(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
          >
            <option value="all">Todas as Profissionais</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
          >
            <option value="all">Todos os Status</option>
            {Object.entries(APPOINTMENT_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600' : 'text-slate-500'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600' : 'text-slate-500'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600' : 'text-slate-500'
              }`}
            >
              Mês
            </button>
          </div>

          {/* Config Free Schedule Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigModalOpen(true)}
            icon={<SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />}
            title="Configurar Horários Livres (24h / Expediente)"
          >
            Agenda Livre
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setModalInitialDate(currentDate);
              setSelectedAppointment(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Agendar
          </Button>
        </div>
      </div>

      {/* Main Agenda Grid Container */}
      <Card className="flex-1 p-0 overflow-hidden flex flex-col min-h-0 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* ================= DAY VIEW ================= */}
        {viewMode === 'day' && (
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {timeSlots.map(timeStr => {
              const [slotH, slotM] = timeStr.split(':').map(Number);
              const slotStartMins = slotH * 60 + slotM;
              const slotEndMins = slotStartMins + 30;
              const inBusinessHours = isSlotInBusinessHours(currentDate, timeStr);

              const startingApps = filteredAppointments.filter(app => {
                if (app.status === 'cancelled' || app.status === 'no_show') return false;
                const appDate = parseISO(app.start_time);
                return isSameDay(appDate, currentDate) && format(appDate, 'HH:mm') === timeStr;
              });

              const ongoingApps = filteredAppointments.filter(app => {
                if (app.status === 'cancelled' || app.status === 'no_show') return false;
                const appStart = parseISO(app.start_time);
                const appEnd = parseISO(app.end_time);
                if (!isSameDay(appStart, currentDate)) return false;
                if (format(appStart, 'HH:mm') === timeStr) return false;
                const appStartMins = appStart.getHours() * 60 + appStart.getMinutes();
                const appEndMins = appEnd.getHours() * 60 + appEnd.getMinutes();
                return slotStartMins < appEndMins && slotEndMins > appStartMins;
              });

              const isOccupied = startingApps.length > 0 || ongoingApps.length > 0;

              return (
                <div
                  id={`slot-${timeStr}`}
                  key={timeStr}
                  className={`flex items-start min-h-[4.25rem] group transition-colors ${
                    isOccupied
                      ? 'bg-rose-50/25 dark:bg-rose-950/15'
                      : inBusinessHours
                      ? 'hover:bg-slate-50/70 dark:hover:bg-slate-850/50'
                      : 'bg-slate-50/40 dark:bg-slate-950/30 hover:bg-slate-100/50 dark:hover:bg-slate-850/30'
                  }`}
                >
                  {/* Left Time Column */}
                  <div className="w-20 sm:w-24 p-3 text-right text-xs font-bold border-r border-slate-100 dark:border-slate-800 shrink-0 flex flex-col items-end justify-start">
                    <span className={inBusinessHours ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                      {timeStr}
                    </span>
                    {!inBusinessHours && (
                      <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">
                        extra
                      </span>
                    )}
                  </div>

                  {/* Appointments in this slot */}
                  <div className="flex-1 p-2 flex flex-wrap gap-2 items-center">
                    {startingApps.map(app => {
                      const statusInfo = APPOINTMENT_STATUS_MAP[app.status] || APPOINTMENT_STATUS_MAP.scheduled;

                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedAppointment(app);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl border shadow-xs hover:shadow-md cursor-pointer transition-all max-w-md w-full bg-white dark:bg-slate-850"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: app.professional?.color || '#bf3f57',
                          }}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {app.client?.name || 'Cliente'}
                              </span>
                              <Badge className={`${statusInfo.bg} ${statusInfo.text} text-[10px]`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400">
                              {app.service?.name} • {app.duration_minutes} min • {app.professional?.nickname || app.professional?.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                              {formatCurrency(app.final_price)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              {formatTimeBR(app.start_time)} - {formatTimeBR(app.end_time)}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {ongoingApps.map(app => (
                      <div
                        key={`ongoing-${app.id}`}
                        onClick={() => {
                          setSelectedAppointment(app);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs cursor-pointer hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors w-full max-w-md shadow-xs"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: app.professional?.color || '#bf3f57',
                        }}
                        title={`Horário Bloqueado: ${app.professional?.name} em atendimento até ${formatTimeBR(app.end_time)}`}
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="truncate">
                          🔒 <strong>Horário Bloqueado:</strong> {app.professional?.nickname || app.professional?.name} em atendimento ({app.client?.name} — {app.service?.name}) até às <strong>{formatTimeBR(app.end_time)}</strong>
                        </span>
                      </div>
                    ))}

                    {!isOccupied && (
                      <button
                        onClick={() => handleCreateAtSlot(currentDate, timeStr)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agendar às {timeStr}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= WEEK VIEW ================= */}
        {viewMode === 'week' && (
          <div className="flex-1 overflow-auto flex flex-col">
            {/* Header Columns: Days of Week */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/70 text-center text-xs font-bold shrink-0">
              <div className="p-3 text-slate-400">Horário</div>
              {weekDays.map(day => (
                <div
                  key={day.toISOString()}
                  className={`p-2.5 border-l border-slate-200 dark:border-slate-800 ${
                    isToday(day) ? 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-600' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-wider">{format(day, 'EEE', { locale: ptBR })}</div>
                  <div className={`text-base font-extrabold ${isToday(day) ? 'text-rose-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {timeSlots.map(timeStr => {
                const [slotH, slotM] = timeStr.split(':').map(Number);
                const slotStartMins = slotH * 60 + slotM;
                const slotEndMins = slotStartMins + 30;

                return (
                  <div id={`slot-${timeStr}`} key={timeStr} className="grid grid-cols-8 min-h-[3.75rem]">
                    <div className="p-2 text-right text-[11px] font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
                      {timeStr}
                    </div>
                    {weekDays.map(day => {
                      const inBusinessHours = isSlotInBusinessHours(day, timeStr);

                      const startingApps = filteredAppointments.filter(app => {
                        if (app.status === 'cancelled' || app.status === 'no_show') return false;
                        const appDate = parseISO(app.start_time);
                        return isSameDay(appDate, day) && format(appDate, 'HH:mm') === timeStr;
                      });

                      const ongoingApps = filteredAppointments.filter(app => {
                        if (app.status === 'cancelled' || app.status === 'no_show') return false;
                        const appStart = parseISO(app.start_time);
                        const appEnd = parseISO(app.end_time);
                        if (!isSameDay(appStart, day)) return false;
                        if (format(appStart, 'HH:mm') === timeStr) return false;
                        const appStartMins = appStart.getHours() * 60 + appStart.getMinutes();
                        const appEndMins = appEnd.getHours() * 60 + appEnd.getMinutes();
                        return slotStartMins < appEndMins && slotEndMins > appStartMins;
                      });

                      const isOccupied = startingApps.length > 0 || ongoingApps.length > 0;

                      return (
                        <div
                          key={day.toISOString()}
                          className={`p-1 border-l border-slate-100 dark:border-slate-800 relative group transition-colors flex flex-col gap-1 ${
                            isOccupied
                              ? 'bg-rose-50/30 dark:bg-rose-950/20'
                              : inBusinessHours
                              ? 'hover:bg-slate-50/80 dark:hover:bg-slate-850/50'
                              : 'bg-slate-50/30 dark:bg-slate-950/30'
                          }`}
                        >
                          {startingApps.map(app => (
                            <div
                              key={app.id}
                              onClick={() => {
                                setSelectedAppointment(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border text-[10px] cursor-pointer shadow-xs bg-white dark:bg-slate-850 truncate"
                              style={{
                                borderLeftWidth: '3px',
                                borderLeftColor: app.professional?.color || '#bf3f57',
                              }}
                              title={`${app.client?.name} - ${app.service?.name} (${formatTimeBR(app.start_time)} às ${formatTimeBR(app.end_time)})`}
                            >
                              <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                {app.client?.name}
                              </div>
                              <div className="text-slate-500 truncate">{app.service?.name}</div>
                            </div>
                          ))}

                          {ongoingApps.map(app => (
                            <div
                              key={`ongoing-wk-${app.id}`}
                              onClick={() => {
                                setSelectedAppointment(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1 rounded-md border border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 text-[9px] text-rose-800 dark:text-rose-300 truncate cursor-pointer font-medium"
                              title={`Horário Bloqueado até ${formatTimeBR(app.end_time)} (${app.client?.name})`}
                            >
                              🔒 Bloqueado ({formatTimeBR(app.end_time)})
                            </div>
                          ))}

                          {!isOccupied && (
                            <button
                              onClick={() => handleCreateAtSlot(day, timeStr)}
                              className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-300 hover:text-rose-600 text-xs transition-opacity"
                              title={`Agendar ${timeStr}`}
                            >
                              +
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= MONTH VIEW ================= */}
        {viewMode === 'month' && (
          <div className="flex-1 overflow-auto flex flex-col">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center text-xs font-bold py-2.5 text-slate-500">
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100 dark:divide-slate-800">
              {monthDays.map(day => {
                const dayApps = filteredAppointments.filter(app => isSameDay(parseISO(app.start_time), day));

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('day');
                    }}
                    className={`min-h-[5.5rem] p-2 flex flex-col justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
                      isToday(day) ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday(day)
                            ? 'w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayApps.length > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded-full">
                          {dayApps.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayApps.slice(0, 2).map(app => (
                        <div
                          key={app.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {formatTimeBR(app.start_time)} {app.client?.name?.split(' ')[0]}
                        </div>
                      ))}
                      {dayApps.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-semibold pl-1">
                          +{dayApps.length - 2} outros
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        initialDate={modalInitialDate}
        initialProfessionalId={selectedProfId !== 'all' ? selectedProfId : undefined}
      />

      {/* Free Schedule Configuration Modal */}
      <ScheduleConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
};
