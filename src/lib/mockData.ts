import {
  BusinessSettings,
  ServiceCategory,
  Service,
  Professional,
  Client,
  Appointment,
  NotificationTemplate,
  AnamnesisTemplate,
  AnamnesisRecord,
  TreatmentEvolution,
  TreatmentPhoto,
  Product,
  FinancialTransaction,
  CashRegister,
  CashMovement,
  Package,
  ClientPackage,
  Promotion,
  LoyaltyAccount,
  CommissionRecord,
  CRMConfig,
  ClientFollowUp,
  ClientRecoveryLog,
} from '@/types';

export const initialBusinessSettings: BusinessSettings = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Studio Jaque Souza',
  trade_name: 'Studio Jaque Souza',
  phone: '',
  whatsapp: '',
  email: 'studiojaquesouza@gmail.com',
  address: '',
  city: '',
  state: 'SP',
  zip_code: '',
  instagram: '@studiojaquesouza',
  pix_key: 'studiojaquesouza@gmail.com',
  pix_type: 'Email',
  require_deposit_by_default: false,
  default_deposit_percentage: 30,
  default_deposit_fixed_amount: 50,
  business_hours: {
    monday: { open: '00:00', close: '23:59', active: true },
    tuesday: { open: '00:00', close: '23:59', active: true },
    wednesday: { open: '00:00', close: '23:59', active: true },
    thursday: { open: '00:00', close: '23:59', active: true },
    friday: { open: '00:00', close: '23:59', active: true },
    saturday: { open: '00:00', close: '23:59', active: true },
    sunday: { open: '00:00', close: '23:59', active: true },
  },
  inactive_client_days: 60,
};

export const initialCategories: ServiceCategory[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Extensão de Cílios', description: 'Técnicas clássica, volume russo, híbrido e manutenção', color: '#bf3f57', sort_order: 1, active: true },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Micropigmentação', description: 'Sobrancelhas, shadow line, fios realistas e retoques', color: '#9333ea', sort_order: 2, active: true },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Lábios & Revitalização', description: 'Neutralização labial, efeito batom e hidragloss', color: '#db2777', sort_order: 3, active: true },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Design de Sobrancelhas', description: 'Design personalizado com pinça, linha e aplicação de henna', color: '#ca8a04', sort_order: 4, active: true },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'Tratamentos Faciais', description: 'Limpeza de pele profunda, peeling e hidratação', color: '#059669', sort_order: 5, active: true },
];

export const initialServices: Service[] = [
  { id: 'e1000000-0000-0000-0000-000000000001', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Extensão Volume Brasileiro', description: 'Aplicação de fios em formato Y proporcionando volume delicado e marcante.', duration_minutes: 120, buffer_minutes: 10, price: 180.00, requires_anamnesis: true, active: true },
  { id: 'e2000000-0000-0000-0000-000000000002', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Manutenção de Cílios (até 20 dias)', description: 'Reposição dos fios com higienização prévia.', duration_minutes: 90, buffer_minutes: 10, price: 110.00, requires_anamnesis: true, active: true },
  { id: 'e3000000-0000-0000-0000-000000000003', category_id: 'c1000000-0000-0000-0000-000000000002', name: 'Microblading Fio a Fio', description: 'Procedimento semipermanente para desenho natural dos fios da sobrancelha.', duration_minutes: 150, buffer_minutes: 15, price: 450.00, promotional_price: 390.00, requires_anamnesis: true, active: true },
  { id: 'e4000000-0000-0000-0000-000000000004', category_id: 'c1000000-0000-0000-0000-000000000003', name: 'Hydra Gloss Lips', description: 'Hidratação profunda e regeneração labial com ácido hialurônico.', duration_minutes: 60, buffer_minutes: 10, price: 150.00, requires_anamnesis: true, active: true },
  { id: 'e5000000-0000-0000-0000-000000000005', category_id: 'c1000000-0000-0000-0000-000000000004', name: 'Design de Sobrancelha com Henna', description: 'Alinhamento com visagismo facial e coloração com henna de alta fixação.', duration_minutes: 45, buffer_minutes: 10, price: 65.00, requires_anamnesis: false, active: true },
  { id: 'e6000000-0000-0000-0000-000000000006', category_id: 'c1000000-0000-0000-0000-000000000005', name: 'Limpeza de Pele Profunda', description: 'Higienização, vapor de ozônio, extração manual, alta frequência e máscara calmante.', duration_minutes: 90, buffer_minutes: 15, price: 160.00, requires_anamnesis: true, active: true },
];

export const initialProfessionals: Professional[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Jaque Souza',
    nickname: 'Jaque',
    email: 'studiojaquesouza@gmail.com',
    phone: '',
    color: '#bf3f57',
    specialties: ['Estética Avançada', 'Micropigmentação', 'Extensão de Cílios', 'Tratamentos Faciais'],
    commission_type: 'percentage',
    default_commission_rate: 100,
    active: true,
  },
];

export const initialClients: Client[] = [];
export const initialAppointments: Appointment[] = [];

export const initialTemplates: NotificationTemplate[] = [
  {
    id: 'm1000000-0000-0000-0000-000000000001',
    category: 'reminder_24h',
    title: 'Lembrete de Atendimento (24h antes)',
    content: 'Olá, {{cliente}}! Tudo bem? 😊\n\nPassando para confirmar seu atendimento de amanhã, dia {{data}}, às {{hora}}, para o procedimento: *{{servico}}*.\nSeu atendimento será com {{profissional}} no Studio Jaque Souza.\n\nPor favor, responda com *CONFIRMAR* ou nos avise caso precise reagendar!',
    is_default: true,
  },
  {
    id: 'm1000000-0000-0000-0000-000000000002',
    category: 'confirmation',
    title: 'Confirmação de Agendamento',
    content: 'Oi, {{cliente}}! Seu agendamento foi realizado com sucesso!\n\n📅 Data: {{data}}\n⏰ Horário: {{hora}}\n💅 Procedimento: {{servico}}\n👩‍⚕️ Profissional: {{profissional}}\n💰 Valor: R$ {{valor}}\n\nEstamos ansiosas para te receber no Studio Jaque Souza! ✨',
    is_default: true,
  },
  {
    id: 'm1000000-0000-0000-0000-000000000003',
    category: 'deposit_request',
    title: 'Solicitação de Sinal (PIX)',
    content: 'Olá, {{cliente}}!\n\nPara garantir seu horário reservado para *{{data}} às {{hora}}*, solicitamos o adiantamento do sinal de reserva:\n\n💵 *Valor:* R$ {{valor_sinal}}\n🔑 *Chave PIX:* {{chave_pix}}\n\nPor favor, nos envie o comprovante por aqui assim que efetuar o pagamento. O valor será abatido no total do seu procedimento! 💕',
    is_default: true,
  },
  {
    id: 'm1000000-0000-0000-0000-000000000004',
    category: 'post_treatment',
    title: 'Pós-Procedimento / Cuidados',
    content: 'Oi, {{cliente}}! Como você está se sentindo após o procedimento de {{servico}}? ✨\n\nLembre-se dos cuidados nas primeiras horas:\n- Evite molhar ou esfregar a região\n- Não utilize produtos agressivos ou vapor\n- Siga as orientações passadas pela profissional\n\nQualquer dúvida estamos à disposição!',
    is_default: true,
  },
  {
    id: 'm1000000-0000-0000-0000-000000000005',
    category: 'return',
    title: 'Chamada de Retorno / Manutenção',
    content: 'Olá, {{cliente}}! Já se passaram alguns dias desde seu último procedimento de {{servico}}. Está na hora de renovar seu resultado e manter seu visual impecável!\n\nPodemos reservar seu horário para esta semana? Responda aqui para combinarmos o melhor dia!',
    is_default: true,
  },
];

export const initialAnamnesisTemplates: AnamnesisTemplate[] = [];

export const initialAnamnesisRecords: AnamnesisRecord[] = [];
export const initialProducts: Product[] = [];
export const initialEvolutions: TreatmentEvolution[] = [];
export const initialPhotos: TreatmentPhoto[] = [];
export const initialTransactions: FinancialTransaction[] = [];
export const initialCashRegisters: CashRegister[] = [];
export const initialCashMovements: CashMovement[] = [];
export const initialPackages: Package[] = [];
export const initialClientPackages: ClientPackage[] = [];
export const initialPromotions: Promotion[] = [];
export const initialLoyaltyAccounts: LoyaltyAccount[] = [];
export const initialCommissions: CommissionRecord[] = [];
export const initialFollowUps: ClientFollowUp[] = [];
export const initialRecoveryLogs: ClientRecoveryLog[] = [];
