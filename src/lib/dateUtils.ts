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
 * Validador de Conflito de Horário:
 * Verifica se um novo intervalo (newStart até newEnd) colide com agendamentos existentes do mesmo profissional.
 */
export function checkScheduleConflict({
  professionalId,
  startDateTime,
  durationMinutes,
  existingAppointments,
  excludeAppointmentId,
}: {
  professionalId: string;
  startDateTime: Date | string;
  durationMinutes: number;
  existingAppointments: Array<{
    id: string;
    professional_id: string;
    start_time: string;
    end_time: string;
    status: string;
  }>;
  excludeAppointmentId?: string;
}): { hasConflict: boolean; conflictingAppointment?: any } {
  const start = typeof startDateTime === 'string' ? parseISO(startDateTime) : startDateTime;
  const end = addMinutes(start, durationMinutes);

  for (const app of existingAppointments) {
    // Ignorar o próprio agendamento em edição
    if (excludeAppointmentId && app.id === excludeAppointmentId) continue;
    // Ignorar agendamentos cancelados
    if (app.status === 'cancelled') continue;
    // Checar apenas mesmo profissional
    if (app.professional_id !== professionalId) continue;

    const appStart = parseISO(app.start_time);
    const appEnd = parseISO(app.end_time);

    // Checar sobreposição de intervalos: (StartA < EndB) and (EndA > StartB)
    const isOverlapping = start < appEnd && end > appStart;

    if (isOverlapping) {
      return {
        hasConflict: true,
        conflictingAppointment: app,
      };
    }
  }

  return { hasConflict: false };
}
