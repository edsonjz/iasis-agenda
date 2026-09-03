import { supabase, isSupabaseConfigured } from './supabase';
import {
  initialBusinessSettings,
  initialCategories,
  initialServices,
  initialProfessionals,
  initialClients,
  initialAppointments,
  initialTemplates,
  initialAnamnesisTemplates,
  initialAnamnesisRecords,
  initialProducts,
  initialEvolutions,
  initialPhotos,
  initialTransactions,
  initialCashRegisters,
  initialCashMovements,
  initialPackages,
  initialClientPackages,
  initialPromotions,
  initialLoyaltyAccounts,
  initialCommissions,
  initialFollowUps,
  initialRecoveryLogs,
} from './mockData';
import { defaultCRMConfig } from './crmEngine';
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

// Helper for Local Storage persistence keys
const STORAGE_KEYS = {
  SETTINGS: 'iasis_settings',
  CATEGORIES: 'iasis_categories',
  SERVICES: 'iasis_services',
  PROFESSIONALS: 'iasis_professionals',
  CLIENTS: 'iasis_clients',
  APPOINTMENTS: 'iasis_appointments',
  TEMPLATES: 'iasis_templates',
  ANAMNESIS_TEMPLATES: 'iasis_anamnesis_templates',
  ANAMNESIS_RECORDS: 'iasis_anamnesis_records',
  PRODUCTS: 'iasis_products',
  EVOLUTIONS: 'iasis_evolutions',
  PHOTOS: 'iasis_photos',
  TRANSACTIONS: 'iasis_transactions',
  CASH_REGISTERS: 'iasis_cash_registers',
  CASH_MOVEMENTS: 'iasis_cash_movements',
  PACKAGES: 'iasis_packages',
  CLIENT_PACKAGES: 'iasis_client_packages',
  PROMOTIONS: 'iasis_promotions',
  LOYALTY_ACCOUNTS: 'iasis_loyalty_accounts',
  COMMISSIONS: 'iasis_commissions',
  CRM_CONFIG: 'iasis_crm_config',
  FOLLOW_UPS: 'iasis_follow_ups',
  RECOVERY_LOGS: 'iasis_recovery_logs',
  THEME: 'iasis_theme',
};

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving to localStorage ${key}:`, err);
  }
}

export const DataService = {
  // Business Settings
  async getSettings(): Promise<BusinessSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('business_settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return getLocal<BusinessSettings>(STORAGE_KEYS.SETTINGS, initialBusinessSettings);
  },

  async saveSettings(settings: BusinessSettings): Promise<BusinessSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('business_settings').upsert(settings).select().single();
      if (!error && data) return data;
    }
    setLocal(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // Categories
  async getCategories(): Promise<ServiceCategory[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_categories').select('*').order('sort_order');
      if (!error && data) return data;
    }
    return getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  async saveCategory(cat: ServiceCategory): Promise<ServiceCategory> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('service_categories').upsert(cat).select().single();
      if (data) return data;
    }
    const list = getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const idx = list.findIndex(c => c.id === cat.id);
    let updated: ServiceCategory[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = cat;
    } else {
      updated = [...list, cat];
    }
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
    return cat;
  },

  // Services
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('services').select('*, category:service_categories(*)').order('name');
      if (!error && data) return data;
    }
    const services = getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const categories = getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    return services.map(s => ({
      ...s,
      category: categories.find(c => c.id === s.category_id),
    }));
  },

  async saveService(service: Service): Promise<Service> {
    if (isSupabaseConfigured && supabase) {
      const { category, ...cleanService } = service;
      const { data } = await supabase.from('services').upsert(cleanService).select().single();
      if (data) return data;
    }
    const list = getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const idx = list.findIndex(s => s.id === service.id);
    let updated: Service[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = service;
    } else {
      updated = [...list, service];
    }
    setLocal(STORAGE_KEYS.SERVICES, updated);
    return service;
  },

  async deleteService(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('services').delete().eq('id', id);
    }
    const list = getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    setLocal(STORAGE_KEYS.SERVICES, list.filter(s => s.id !== id));
    return true;
  },

  // Professionals
  async getProfessionals(): Promise<Professional[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('professionals').select('*').order('name');
      if (!error && data) return data;
    }
    return getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
  },

  async saveProfessional(prof: Professional): Promise<Professional> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('professionals').upsert(prof).select().single();
      if (data) return data;
    }
    const list = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
    const idx = list.findIndex(p => p.id === prof.id);
    let updated: Professional[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = prof;
    } else {
      updated = [...list, prof];
    }
    setLocal(STORAGE_KEYS.PROFESSIONALS, updated);
    return prof;
  },

  async deleteProfessional(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('professionals').delete().eq('id', id);
    }
    const list = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
    setLocal(STORAGE_KEYS.PROFESSIONALS, list.filter(p => p.id !== id));
    return true;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clients').select('*').order('name');
      if (!error && data) return data;
    }
    return getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
  },

  async saveClient(client: Client): Promise<Client> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('clients').upsert(client).select().single();
      if (data) return data;
    }
    const list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
    const idx = list.findIndex(c => c.id === client.id);
    let updated: Client[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = client;
    } else {
      updated = [client, ...list];
    }
    setLocal(STORAGE_KEYS.CLIENTS, updated);
    return client;
  },

  async deleteClient(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').delete().eq('id', id);
    }
    const list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
    setLocal(STORAGE_KEYS.CLIENTS, list.filter(c => c.id !== id));
    return true;
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:clients(*), professional:professionals(*), service:services(*)')
        .order('start_time');
      if (!error && data) return data;
    }
    const appointments = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const clients = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
    const professionals = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
    const services = getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);

    return appointments.map(app => ({
      ...app,
      client: clients.find(c => c.id === app.client_id),
      professional: professionals.find(p => p.id === app.professional_id),
      service: services.find(s => s.id === app.service_id),
    }));
  },

  async saveAppointment(app: Appointment): Promise<Appointment> {
    if (isSupabaseConfigured && supabase) {
      const { client, professional, service, ...cleanPayload } = app;
      const { data } = await supabase.from('appointments').upsert(cleanPayload).select().single();
      if (data) return data;
    }
    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const idx = list.findIndex(a => a.id === app.id);
    let updated: Appointment[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = app;
    } else {
      updated = [...list, app];
    }
    setLocal(STORAGE_KEYS.APPOINTMENTS, updated);
    return app;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('appointments').delete().eq('id', id);
    }
    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    setLocal(STORAGE_KEYS.APPOINTMENTS, list.filter(a => a.id !== id));
    return true;
  },

  // Templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notification_templates').select('*');
      if (!error && data) return data;
    }
    return getLocal<NotificationTemplate[]>(STORAGE_KEYS.TEMPLATES, initialTemplates);
  },

  async saveTemplate(tpl: NotificationTemplate): Promise<NotificationTemplate> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('notification_templates').upsert(tpl).select().single();
      if (data) return data;
    }
    const list = getLocal<NotificationTemplate[]>(STORAGE_KEYS.TEMPLATES, initialTemplates);
    const idx = list.findIndex(t => t.id === tpl.id);
    let updated: NotificationTemplate[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = tpl;
    } else {
      updated = [...list, tpl];
    }
    setLocal(STORAGE_KEYS.TEMPLATES, updated);
    return tpl;
  },

  // Anamnesis Templates
  async getAnamnesisTemplates(): Promise<AnamnesisTemplate[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('anamnesis_templates').select('*').order('title');
      if (!error && data) return data;
    }
    return getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, initialAnamnesisTemplates);
  },

  async saveAnamnesisTemplate(tpl: AnamnesisTemplate): Promise<AnamnesisTemplate> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('anamnesis_templates').upsert(tpl).select().single();
      if (data) return data;
    }
    const list = getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, initialAnamnesisTemplates);
    const idx = list.findIndex(t => t.id === tpl.id);
    let updated: AnamnesisTemplate[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = tpl;
    } else {
      updated = [...list, tpl];
    }
    setLocal(STORAGE_KEYS.ANAMNESIS_TEMPLATES, updated);
    return tpl;
  },

  async deleteAnamnesisTemplate(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('anamnesis_templates').delete().eq('id', id);
    }
    const list = getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, initialAnamnesisTemplates);
    setLocal(STORAGE_KEYS.ANAMNESIS_TEMPLATES, list.filter(t => t.id !== id));
    return true;
  },

  // Anamnesis Records
  async getAnamnesisRecords(): Promise<AnamnesisRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('anamnesis_records').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, initialAnamnesisRecords);
  },

  async saveAnamnesisRecord(rec: AnamnesisRecord): Promise<AnamnesisRecord> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('anamnesis_records').upsert(rec).select().single();
      if (data) return data;
    }
    const list = getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, initialAnamnesisRecords);
    const idx = list.findIndex(r => r.id === rec.id);
    let updated: AnamnesisRecord[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = rec;
    } else {
      updated = [rec, ...list];
    }
    setLocal(STORAGE_KEYS.ANAMNESIS_RECORDS, updated);
    return rec;
  },

  async deleteAnamnesisRecord(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('anamnesis_records').delete().eq('id', id);
    }
    const list = getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, initialAnamnesisRecords);
    setLocal(STORAGE_KEYS.ANAMNESIS_RECORDS, list.filter(r => r.id !== id));
    return true;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data) return data;
    }
    return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  },

  async saveProduct(prod: Product): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('products').upsert(prod).select().single();
      if (data) return data;
    }
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const idx = list.findIndex(p => p.id === prod.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = prod;
    } else {
      updated = [...list, prod];
    }
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return prod;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    setLocal(STORAGE_KEYS.PRODUCTS, list.filter(p => p.id !== id));
    return true;
  },

  // Evolutions
  async getEvolutions(): Promise<TreatmentEvolution[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('treatment_evolutions').select('*').order('date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, initialEvolutions);
  },

  async saveEvolution(evo: TreatmentEvolution): Promise<TreatmentEvolution> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('treatment_evolutions').upsert(evo).select().single();
      if (data) return data;
    }
    const list = getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, initialEvolutions);
    const idx = list.findIndex(e => e.id === evo.id);
    let updated: TreatmentEvolution[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = evo;
    } else {
      updated = [evo, ...list];
    }
    setLocal(STORAGE_KEYS.EVOLUTIONS, updated);
    return evo;
  },

  async deleteEvolution(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('treatment_evolutions').delete().eq('id', id);
    }
    const list = getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, initialEvolutions);
    setLocal(STORAGE_KEYS.EVOLUTIONS, list.filter(e => e.id !== id));
    return true;
  },

  // Photos
  async getPhotos(): Promise<TreatmentPhoto[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('treatment_photos').select('*').order('date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, initialPhotos);
  },

  async savePhoto(photo: TreatmentPhoto): Promise<TreatmentPhoto> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('treatment_photos').upsert(photo).select().single();
      if (data) return data;
    }
    const list = getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, initialPhotos);
    const idx = list.findIndex(p => p.id === photo.id);
    let updated: TreatmentPhoto[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = photo;
    } else {
      updated = [photo, ...list];
    }
    setLocal(STORAGE_KEYS.PHOTOS, updated);
    return photo;
  },

  async deletePhoto(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('treatment_photos').delete().eq('id', id);
    }
    const list = getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, initialPhotos);
    setLocal(STORAGE_KEYS.PHOTOS, list.filter(p => p.id !== id));
    return true;
  },

  // Financial Transactions
  async getTransactions(): Promise<FinancialTransaction[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('financial_transactions').select('*').order('paid_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  },

  async saveTransaction(tr: FinancialTransaction): Promise<FinancialTransaction> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('financial_transactions').upsert(tr).select().single();
      if (data) return data;
    }
    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    const idx = list.findIndex(t => t.id === tr.id);
    let updated: FinancialTransaction[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = tr;
    } else {
      updated = [tr, ...list];
    }
    setLocal(STORAGE_KEYS.TRANSACTIONS, updated);
    return tr;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('financial_transactions').delete().eq('id', id);
    }
    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    setLocal(STORAGE_KEYS.TRANSACTIONS, list.filter(t => t.id !== id));
    return true;
  },

  // Cash Registers
  async getCashRegisters(): Promise<CashRegister[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_registers').select('*').order('opened_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, initialCashRegisters);
  },

  async saveCashRegister(cr: CashRegister): Promise<CashRegister> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('cash_registers').upsert(cr).select().single();
      if (data) return data;
    }
    const list = getLocal<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, initialCashRegisters);
    const idx = list.findIndex(c => c.id === cr.id);
    let updated: CashRegister[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = cr;
    } else {
      updated = [cr, ...list];
    }
    setLocal(STORAGE_KEYS.CASH_REGISTERS, updated);
    return cr;
  },

  async getCashMovements(): Promise<CashMovement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_movements').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, initialCashMovements);
  },

  async saveCashMovement(cm: CashMovement): Promise<CashMovement> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('cash_movements').upsert(cm).select().single();
      if (data) return data;
    }
    const list = getLocal<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, initialCashMovements);
    const updated = [cm, ...list];
    setLocal(STORAGE_KEYS.CASH_MOVEMENTS, updated);
    return cm;
  },

  // Packages
  async getPackages(): Promise<Package[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('packages').select('*').order('name');
      if (!error && data) return data;
    }
    return getLocal<Package[]>(STORAGE_KEYS.PACKAGES, initialPackages);
  },

  async savePackage(pkg: Package): Promise<Package> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('packages').upsert(pkg).select().single();
      if (data) return data;
    }
    const list = getLocal<Package[]>(STORAGE_KEYS.PACKAGES, initialPackages);
    const idx = list.findIndex(p => p.id === pkg.id);
    let updated: Package[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = pkg;
    } else {
      updated = [...list, pkg];
    }
    setLocal(STORAGE_KEYS.PACKAGES, updated);
    return pkg;
  },

  async deletePackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('packages').delete().eq('id', id);
    }
    const list = getLocal<Package[]>(STORAGE_KEYS.PACKAGES, initialPackages);
    setLocal(STORAGE_KEYS.PACKAGES, list.filter(p => p.id !== id));
    return true;
  },

  async getClientPackages(): Promise<ClientPackage[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_packages').select('*').order('purchased_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, initialClientPackages);
  },

  async saveClientPackage(cpkg: ClientPackage): Promise<ClientPackage> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('client_packages').upsert(cpkg).select().single();
      if (data) return data;
    }
    const list = getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, initialClientPackages);
    const idx = list.findIndex(c => c.id === cpkg.id);
    let updated: ClientPackage[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = cpkg;
    } else {
      updated = [cpkg, ...list];
    }
    setLocal(STORAGE_KEYS.CLIENT_PACKAGES, updated);
    return cpkg;
  },

  async deleteClientPackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('client_packages').delete().eq('id', id);
    }
    const list = getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, initialClientPackages);
    setLocal(STORAGE_KEYS.CLIENT_PACKAGES, list.filter(c => c.id !== id));
    return true;
  },

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('promotions').select('*').order('start_date');
      if (!error && data) return data;
    }
    return getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
  },

  async savePromotion(promo: Promotion): Promise<Promotion> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('promotions').upsert(promo).select().single();
      if (data) return data;
    }
    const list = getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    const idx = list.findIndex(p => p.id === promo.id);
    let updated: Promotion[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = promo;
    } else {
      updated = [...list, promo];
    }
    setLocal(STORAGE_KEYS.PROMOTIONS, updated);
    return promo;
  },

  async deletePromotion(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('promotions').delete().eq('id', id);
    }
    const list = getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    setLocal(STORAGE_KEYS.PROMOTIONS, list.filter(p => p.id !== id));
    return true;
  },

  // Loyalty
  async getLoyaltyAccounts(): Promise<LoyaltyAccount[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('loyalty_accounts').select('*');
      if (!error && data) return data;
    }
    return getLocal<LoyaltyAccount[]>(STORAGE_KEYS.LOYALTY_ACCOUNTS, initialLoyaltyAccounts);
  },

  async saveLoyaltyAccount(acc: LoyaltyAccount): Promise<LoyaltyAccount> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('loyalty_accounts').upsert(acc).select().single();
      if (data) return data;
    }
    const list = getLocal<LoyaltyAccount[]>(STORAGE_KEYS.LOYALTY_ACCOUNTS, initialLoyaltyAccounts);
    const idx = list.findIndex(a => a.id === acc.id);
    let updated: LoyaltyAccount[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = acc;
    } else {
      updated = [acc, ...list];
    }
    setLocal(STORAGE_KEYS.LOYALTY_ACCOUNTS, updated);
    return acc;
  },

  // Commissions
  async getCommissions(): Promise<CommissionRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('commission_records').select('*').order('appointment_date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<CommissionRecord[]>(STORAGE_KEYS.COMMISSIONS, initialCommissions);
  },

  async saveCommission(com: CommissionRecord): Promise<CommissionRecord> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('commission_records').upsert(com).select().single();
      if (data) return data;
    }
    const list = getLocal<CommissionRecord[]>(STORAGE_KEYS.COMMISSIONS, initialCommissions);
    const idx = list.findIndex(c => c.id === com.id);
    let updated: CommissionRecord[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = com;
    } else {
      updated = [com, ...list];
    }
    setLocal(STORAGE_KEYS.COMMISSIONS, updated);
    return com;
  },

  // ==========================================
  // CRM CONFIG & FOLLOW-UPS
  // ==========================================
  async getCRMConfig(): Promise<CRMConfig> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('crm_settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return getLocal<CRMConfig>(STORAGE_KEYS.CRM_CONFIG, defaultCRMConfig);
  },

  async saveCRMConfig(cfg: CRMConfig): Promise<CRMConfig> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('crm_settings').upsert(cfg).select().single();
      if (!error && data) return data;
    }
    setLocal(STORAGE_KEYS.CRM_CONFIG, cfg);
    return cfg;
  },

  async getFollowUps(): Promise<ClientFollowUp[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_follow_ups').select('*').order('recommended_date');
      if (!error && data) return data;
    }
    return getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
  },

  async saveFollowUp(flw: ClientFollowUp): Promise<ClientFollowUp> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('client_follow_ups').upsert(flw).select().single();
      if (data) return data;
    }
    const list = getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
    const idx = list.findIndex(f => f.id === flw.id);
    let updated: ClientFollowUp[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = flw;
    } else {
      updated = [flw, ...list];
    }
    setLocal(STORAGE_KEYS.FOLLOW_UPS, updated);
    return flw;
  },

  async deleteFollowUp(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('client_follow_ups').delete().eq('id', id);
    }
    const list = getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
    setLocal(STORAGE_KEYS.FOLLOW_UPS, list.filter(f => f.id !== id));
    return true;
  },

  async getRecoveryLogs(): Promise<ClientRecoveryLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_recovery_logs').select('*').order('recovered_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<ClientRecoveryLog[]>(STORAGE_KEYS.RECOVERY_LOGS, initialRecoveryLogs);
  },

  async saveRecoveryLog(log: ClientRecoveryLog): Promise<ClientRecoveryLog> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('client_recovery_logs').upsert(log).select().single();
      if (data) return data;
    }
    const list = getLocal<ClientRecoveryLog[]>(STORAGE_KEYS.RECOVERY_LOGS, initialRecoveryLogs);
    const updated = [log, ...list];
    setLocal(STORAGE_KEYS.RECOVERY_LOGS, updated);
    return log;
  },
};
