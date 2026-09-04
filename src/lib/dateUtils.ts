import { format, parseISO, isSameDay, isWithinInterval, addMinutes, differenceInMinutes, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data no padrão brasileiro: DD/MM/YYYY
 */
export function formatDateBR(date: string | Date | undefined | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isNaN(d.getTime())) return '-';
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata data e hora no padrão brasileiro: DD/MM/YYYY às HH:mm
 */
export function formatDateTimeBR(date: string | Date | undefined | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isNaN(d.getTime())) return '-';
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Formata apenas hora: HH:mm
 */
export function formatTimeBR(date: string | Date | undefined | null): string {
  if (!date) return '--:--';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isNaN(d.getTime())) return '--:--';
  return format(d, 'HH:mm', { locale: ptBR });
}

/**
 * Retorna o dia da semana por extenso: "Segunda-feira"
 */
export function getDayOfWeekName(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const name = format(d, 'EEEE', { locale: ptBR });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Retorna o mês e ano: "Setembro de 2026"
 */
export function getMonthYearName(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const name = format(d, 'MMMM yyyy', { locale: ptBR });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Validador de Conflito de Horário e Bloqueio de Intervalo:
 * Verifica se um novo intervalo [start, end + buffer] colide com agendamentos existentes do mesmo profissional.
 */
export function checkScheduleConflict({
  professionalId,
  startDateTime,
  durationMinutes,
  bufferMinutes = 0,
  existingAppointments,
  excludeAppointmentId,
}: {
  professionalId: string;
  startDateTime: Date | string;
  durationMinutes: number;
  bufferMinutes?: number;
  existingAppointments: Array<{
    id: string;
    professional_id: string;
    start_time: string;
    end_time: string;
    status: string;
    client?: { name: string };
    service?: { name: string };
  }>;
  excludeAppointmentId?: string;
}): { hasConflict: boolean; conflictingAppointment?: any; details?: string } {
  if (!startDateTime || !professionalId || !durationMinutes) return { hasConflict: false };

  const start = typeof startDateTime === 'string' ? parseISO(startDateTime) : startDateTime;
  if (isNaN(start.getTime())) return { hasConflict: false };

  const totalMinutes = durationMinutes + (bufferMinutes || 0);
  const end = addMinutes(start, totalMinutes);

  for (const app of existingAppointments) {
    // Ignorar o próprio agendamento em edição
    if (excludeAppointmentId && app.id === excludeAppointmentId) continue;
    // Ignorar agendamentos cancelados ou no-show
    if (app.status === 'cancelled' || app.status === 'no_show') continue;
    // Checar apenas mesmo profissional
    if (app.professional_id !== professionalId) continue;

    const appStart = parseISO(app.start_time);
    const appEnd = parseISO(app.end_time);
    if (isNaN(appStart.getTime()) || isNaN(appEnd.getTime())) continue;

    // Checar sobreposição de intervalos: (StartA < EndB) and (EndA > StartB)
    const isOverlapping = start < appEnd && end > appStart;

    if (isOverlapping) {
      const clientName = app.client?.name || 'Cliente';
      const serviceName = app.service?.name || 'Procedimento';
      const timeRange = `${formatTimeBR(app.start_time)} às ${formatTimeBR(app.end_time)}`;

      return {
        hasConflict: true,
        conflictingAppointment: app,
        details: `Conflito com "${serviceName}" de ${clientName} (${timeRange})`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Calcula o horário de término formatado HH:mm
 */
export function calculateEndTimeFormatted(startTimeStr: string, durationMinutes: number): string {
  if (!startTimeStr || !durationMinutes) return '--:--';
  const parts = startTimeStr.split(':');
  if (parts.length !== 2) return '--:--';
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return '--:--';

  const totalMins = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}
