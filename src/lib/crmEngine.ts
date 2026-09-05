import {
  Client,
  Appointment,
  TreatmentEvolution,
  TreatmentPhoto,
  AnamnesisRecord,
  FinancialTransaction,
  ClientPackage,
  ClientFollowUp,
  CRMConfig,
  ClientBehaviorMetrics,
  ClientRelationshipCategory,
  LoyaltyTier,
  ClientTimelineEvent,
  ClientRecoveryLog,
} from '@/types';
import {
  parseISO,
  differenceInDays,
  differenceInMonths,
  isFuture,
  isPast,
  isAfter,
  format,
} from 'date-fns';

export const defaultCRMConfig: CRMConfig = {
  id: 'crm-config-default',
  new_client_max_days: 60,
  new_client_max_appointments: 1,
  active_client_max_days: 60,
  loyal_min_appointments: 4,
  loyal_period_months: 12,
  loyal_max_gap_days: 90,
  vip_min_spent: 1000.0,
  vip_min_appointments: 8,
  risk_tolerance_percentage: 25,
  risk_min_days_overdue: 10,
  inactive_days: 90,
  abandoned_days: 180,
  service_configs: [
    { service_id: 's1', service_name: 'Extensão Volume Brasileiro', recommended_return_days: 20, post_procedure_followup_days: 3 },
    { service_id: 's2', service_name: 'Manutenção de Cílios', recommended_return_days: 20, post_procedure_followup_days: 3 },
    { service_id: 's3', service_name: 'Microblading Fio a Fio', recommended_return_days: 30, post_procedure_followup_days: 7 },
    { service_id: 's4', service_name: 'Hydra Gloss Lips', recommended_return_days: 30, post_procedure_followup_days: 4 },
    { service_id: 's5', service_name: 'Design com Henna', recommended_return_days: 18, post_procedure_followup_days: 2 },
    { service_id: 's6', service_name: 'Limpeza de Pele Profunda', recommended_return_days: 35, post_procedure_followup_days: 5 },
  ],
};

/**
 * Calculates behavioral metrics, habitual return interval, risk level and dynamic classification.
 */
export function calculateClientMetrics(
  client: Client,
  appointments: Appointment[],
  crmConfig: CRMConfig = defaultCRMConfig,
  recoveryLogs: ClientRecoveryLog[] = []
): ClientBehaviorMetrics {
  const today = new Date();

  // Filter client's non-cancelled appointments and sort chronologically
  const clientApps = appointments
    .filter(a => a.client_id === client.id)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const completedApps = clientApps.filter(a => a.status === 'completed');
  const cancelledApps = clientApps.filter(a => a.status === 'cancelled');
  const noShowApps = clientApps.filter(a => a.status === 'no_show');

  const firstVisitDate = clientApps.length > 0 ? clientApps[0].start_time : client.created_at;
  
  // Last visited date
  const pastCompleted = completedApps.filter(a => isPast(parseISO(a.start_time)));
  const lastVisitDate = pastCompleted.length > 0
    ? pastCompleted[pastCompleted.length - 1].start_time
    : client.last_appointment_date || client.created_at;

  // Next future appointment
  const nextApp = clientApps.find(a => isFuture(parseISO(a.start_time)) && a.status !== 'cancelled');
  const nextAppointmentDate = nextApp?.start_time;

  // Calculate intervals between completed visits
  const intervalsDays: number[] = [];
  for (let i = 1; i < pastCompleted.length; i++) {
    const prevDate = parseISO(pastCompleted[i - 1].start_time);
    const currDate = parseISO(pastCompleted[i].start_time);
    const diff = Math.max(1, differenceInDays(currDate, prevDate));
    intervalsDays.push(diff);
  }

  const averageIntervalDays =
    intervalsDays.length > 0
      ? Math.round(intervalsDays.reduce((a, b) => a + b, 0) / intervalsDays.length)
      : 30; // default estimated return cycle

  const minIntervalDays = intervalsDays.length > 0 ? Math.min(...intervalsDays) : averageIntervalDays;
  const maxIntervalDays = intervalsDays.length > 0 ? Math.max(...intervalsDays) : averageIntervalDays;

  // Days since last visit
  const lastDateObj = parseISO(lastVisitDate);
  const daysSinceLastVisit = Math.max(0, differenceInDays(today, lastDateObj));

  // Overdue comparison based on personal average interval
  const personalThreshold = averageIntervalDays * (1 + crmConfig.risk_tolerance_percentage / 100);
  const daysOverdue = Math.max(0, Math.round(daysSinceLastVisit - averageIntervalDays));
  const isOverdue = daysSinceLastVisit > personalThreshold && daysSinceLastVisit < crmConfig.inactive_days;

  // Top service & top professional
  const serviceCounts: Record<string, number> = {};
  const profCounts: Record<string, number> = {};

  completedApps.forEach(a => {
    const sList = (a.services && a.services.length > 0)
      ? a.services
      : (a.service ? [a.service] : []);
    if (sList.length > 0) {
      sList.forEach(s => {
        serviceCounts[s.name] = (serviceCounts[s.name] || 0) + 1;
      });
    } else {
      const sName = a.service?.name || 'Procedimento';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    }

    const pName = a.professional?.nickname || a.professional?.name || 'Profissional';
    profCounts[pName] = (profCounts[pName] || 0) + 1;
  });

  const topServiceName =
    Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Procedimento Estético';

  const topProfessionalName =
    Object.entries(profCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Dra. Camila';

  const totalSpent = client.total_spent || completedApps.reduce((sum, a) => sum + (a.final_price || 0), 0);
  const totalCompleted = completedApps.length;
  const averageTicket = totalCompleted > 0 ? totalSpent / totalCompleted : totalSpent || 150;

  // Determine recovery log
  const clientRecovery = recoveryLogs.find(r => r.client_id === client.id);

  // Determine Dynamic Relationship Classification
  let category: ClientRelationshipCategory = 'ativa';
  let categoryLabel = 'Ativa';
  let riskPriority: 'high' | 'medium' | 'low' | undefined = undefined;

  const daysSinceCreated = differenceInDays(today, parseISO(client.created_at));

  // Recovery detection (recovered in last 30 days)
  const isRecentlyRecovered =
    clientRecovery && differenceInDays(today, parseISO(clientRecovery.recovered_at)) <= 30;

  if (isRecentlyRecovered) {
    category = 'recuperada';
    categoryLabel = 'Recuperada';
  } else if (daysSinceLastVisit >= crmConfig.abandoned_days) {
    category = 'abandonou';
    categoryLabel = 'Abandonou';
  } else if (daysSinceLastVisit >= crmConfig.inactive_days) {
    category = 'inativa';
    categoryLabel = 'Inativa';
  } else if (isOverdue && !nextAppointmentDate) {
    category = 'em_risco';
    categoryLabel = 'Em Risco';
    if (daysOverdue > 25 || daysSinceLastVisit > 70) {
      riskPriority = 'high';
    } else if (daysOverdue > 12) {
      riskPriority = 'medium';
    } else {
      riskPriority = 'low';
    }
  } else if (totalSpent >= crmConfig.vip_min_spent || totalCompleted >= crmConfig.vip_min_appointments) {
    category = 'vip';
    categoryLabel = 'Cliente VIP';
  } else if (
    totalCompleted >= crmConfig.loyal_min_appointments &&
    maxIntervalDays <= crmConfig.loyal_max_gap_days
  ) {
    category = 'fiel';
    categoryLabel = 'Cliente Fiel';
  } else if (
    daysSinceCreated <= crmConfig.new_client_max_days ||
    totalCompleted <= crmConfig.new_client_max_appointments
  ) {
    category = 'nova';
    categoryLabel = 'Nova Cliente';
  } else {
    category = 'ativa';
    categoryLabel = 'Ativa';
  }

  // Calculate Loyalty Score (0 - 100)
  // R (Recency): 0 to 30 pts
  let rScore = 30;
  if (daysSinceLastVisit > 90) rScore = 5;
  else if (daysSinceLastVisit > 60) rScore = 12;
  else if (daysSinceLastVisit > 35) rScore = 22;

  // F (Frequency): 0 to 30 pts
  let fScore = Math.min(30, totalCompleted * 5);

  // M (Monetary): 0 to 25 pts
  let mScore = Math.min(25, Math.round(totalSpent / 60));

  // Tenure: 0 to 15 pts
  const tenureMonths = Math.max(1, differenceInMonths(today, parseISO(firstVisitDate)));
  let tScore = Math.min(15, tenureMonths * 2);

  // Penalty for no-shows
  const penalty = noShowApps.length * 10;

  let loyaltyScore = Math.max(5, Math.min(100, rScore + fScore + mScore + tScore - penalty));

  let loyaltyTier: LoyaltyTier = 'baixa';
  if (loyaltyScore >= 81) loyaltyTier = 'excelente';
  else if (loyaltyScore >= 61) loyaltyTier = 'alta';
  else if (loyaltyScore >= 31) loyaltyTier = 'moderada';

  return {
    first_visit_date: firstVisitDate,
    last_visit_date: lastVisitDate,
    next_appointment_date: nextAppointmentDate,
    total_appointments: clientApps.length,
    completed_appointments_count: completedApps.length,
    cancelled_count: cancelledApps.length,
    no_show_count: noShowApps.length,
    total_spent: totalSpent,
    average_ticket: averageTicket,
    top_service_name: topServiceName,
    top_professional_name: topProfessionalName,
    intervals_days: intervalsDays,
    average_interval_days: averageIntervalDays,
    min_interval_days: minIntervalDays,
    max_interval_days: maxIntervalDays,
    days_since_last_visit: daysSinceLastVisit,
    days_overdue: daysOverdue,
    is_overdue: isOverdue,
    category,
    category_label: categoryLabel,
    loyalty_score: loyaltyScore,
    loyalty_tier: loyaltyTier,
    risk_priority: riskPriority,
    recovery_info: clientRecovery,
  };
}

/**
 * Builds the Unified Chronological Timeline aggregating all interactions.
 */
export function buildClientTimelineEvents(
  client: Client,
  appointments: Appointment[],
  anamnesisRecords: AnamnesisRecord[],
  evolutions: TreatmentEvolution[],
  photos: TreatmentPhoto[],
  transactions: FinancialTransaction[],
  clientPackages: ClientPackage[],
  followUps: ClientFollowUp[]
): ClientTimelineEvent[] {
  const events: ClientTimelineEvent[] = [];

  // Appointments
  appointments
    .filter(a => a.client_id === client.id)
    .forEach(a => {
      const sName = (a.services && a.services.length > 0)
        ? a.services.map(s => s.name).join(' + ')
        : (a.service?.name || 'Procedimento');
      let eventType: ClientTimelineEvent['type'] = 'appointment_completed';
      let title = `Atendimento: ${sName}`;
      let icon = 'calendar';

      if (a.status === 'cancelled') {
        eventType = 'appointment_cancelled';
        title = `Agendamento Cancelado: ${sName}`;
        icon = 'x-circle';
      } else if (a.status === 'no_show') {
        eventType = 'appointment_no_show';
        title = `Falta / No-Show: ${sName}`;
        icon = 'alert-triangle';
      } else if (isFuture(parseISO(a.start_time))) {
        eventType = 'appointment_scheduled';
        title = `Agendado: ${sName}`;
        icon = 'clock';
      }

      events.push({
        id: `timeline_app_${a.id}`,
        date: a.start_time,
        type: eventType,
        title,
        description: a.notes || `Com ${a.professional?.name || 'Profissional'}`,
        amount: a.final_price,
        professional_name: a.professional?.name,
        icon_type: icon,
        metadata: { appointment: a },
      });
    });

  // Anamnesis
  anamnesisRecords
    .filter(r => r.client_id === client.id)
    .forEach(r => {
      events.push({
        id: `timeline_ana_${r.id}`,
        date: r.signed_at || r.created_at,
        type: 'anamnesis_signed',
        title: `Ficha de Anamnese Assinada`,
        description: `${r.template_title} preenchida e assinada digitalmente`,
        icon_type: 'file-text',
      });
    });

  // Evolutions
  evolutions
    .filter(e => e.client_id === client.id)
    .forEach(e => {
      events.push({
        id: `timeline_evo_${e.id}`,
        date: `${e.date}T12:00:00Z`,
        type: 'evolution_logged',
        title: `Evolução: ${e.procedure_name} (Sessão #${e.session_number || 1})`,
        description: e.description,
        icon_type: 'activity',
        metadata: { products: e.products_used },
      });
    });

  // Photos
  photos
    .filter(p => p.client_id === client.id)
    .forEach(p => {
      events.push({
        id: `timeline_pho_${p.id}`,
        date: `${p.date}T12:00:00Z`,
        type: 'photo_added',
        title: `Foto Registrada: ${p.photo_type.toUpperCase()} (${p.procedure_name})`,
        description: p.notes || 'Registro fotográfico em cabine',
        icon_type: 'camera',
        metadata: { image_url: p.image_url },
      });
    });

  // Packages
  clientPackages
    .filter(p => p.client_id === client.id)
    .forEach(p => {
      events.push({
        id: `timeline_pkg_${p.id}`,
        date: p.purchased_at,
        type: 'package_purchased',
        title: `Pacote Contratado: ${p.package_name}`,
        description: `${p.total_sessions} sessões adquiridas por R$ ${p.price_paid.toFixed(2)}`,
        amount: p.price_paid,
        icon_type: 'layers',
      });
    });

  // Follow-ups
  followUps
    .filter(f => f.client_id === client.id)
    .forEach(f => {
      events.push({
        id: `timeline_flw_${f.id}`,
        date: f.contacted_at || f.created_at,
        type: f.contacted_at ? 'followup_contacted' : 'followup_created',
        title: `Follow-up: ${f.reason}`,
        description: f.notes || f.result || `Status: ${f.status}`,
        icon_type: 'message-circle',
      });
    });

  // Sort chronological descending
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Generates personalized message template with replacement variables.
 */
export function generateFollowUpMessage(
  templateString: string,
  variables: {
    cliente: string;
    procedimento: string;
    dias_sem_visita: number | string;
    profissional: string;
  }
): string {
  let msg = templateString;
  msg = msg.replace(/{{cliente}}/g, variables.cliente);
  msg = msg.replace(/{{procedimento}}/g, variables.procedimento);
  msg = msg.replace(/{{dias_sem_visita}}/g, String(variables.dias_sem_visita));
  msg = msg.replace(/{{profissional}}/g, variables.profissional);
  return msg;
}
