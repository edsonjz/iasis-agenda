import { supabase, isSupabaseConfigured } from './supabase';
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
import { defaultCRMConfig } from './crmEngine';
import { generateUUID, isValidUUID } from './utils';

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

// Known Fictitious/Demo Data IDs & Names to filter and purge permanently
export const DEMO_IDS = {
  PROFESSIONALS: [
    'd1000000-0000-0000-0000-000000000001', // Dra. Camila Ribeiro
    'd2000000-0000-0000-0000-000000000002', // Juliana Santos
    'd3000000-0000-0000-0000-000000000003', // Beatriz Lima
    'p1',
    'p2',
    'p3',
  ],
  PROFESSIONAL_NAMES: [
    'Dra. Camila Ribeiro',
    'Camila Ribeiro',
    'Juliana Santos',
    'Beatriz Lima',
  ],
  CLIENTS: [
    'b1000000-0000-0000-0000-000000000001', // Mariana Alcantara
    'b2000000-0000-0000-0000-000000000002', // Fernanda Souza Costa
    'b3000000-0000-0000-0000-000000000003', // Carolina Oliveira Martins
    'b4000000-0000-0000-0000-000000000004', // Patricia Guimarães
    'b5000000-0000-0000-0000-000000000005', // Juliana Moreira Neves
    'b6000000-0000-0000-0000-000000000006', // Renata Albuquerque
    'u1',
    'u2',
    'u3',
    'u4',
    'u5',
    'u6',
  ],
  CLIENT_NAMES: [
    'Mariana Alcantara',
    'Fernanda Souza Costa',
    'Carolina Oliveira Martins',
    'Patricia Guimarães',
    'Juliana Moreira Neves',
    'Renata Albuquerque',
  ],
  APPOINTMENTS: [
    'aa100000-0000-0000-0000-000000000001',
    'aa200000-0000-0000-0000-000000000002',
    'aa300000-0000-0000-0000-000000000003',
    'aa400000-0000-0000-0000-000000000004',
    'aa500000-0000-0000-0000-000000000005',
    'a1',
    'a2',
    'a3',
    'a4',
    'a5',
    'a6',
    'a7',
  ],
  TRANSACTIONS: [
    'fa100000-0000-0000-0000-000000000001',
    'fa200000-0000-0000-0000-000000000002',
    'fa300000-0000-0000-0000-000000000003',
    'fa400000-0000-0000-0000-000000000004',
    'fa500000-0000-0000-0000-000000000005',
    'tr-1',
    'tr-2',
    'tr-3',
    'tr-4',
    'tr-5',
    'tr-6',
  ],
  PRODUCTS: [
    'ba100000-0000-0000-0000-000000000001',
    'ba200000-0000-0000-0000-000000000002',
    'ba300000-0000-0000-0000-000000000003',
    'ba400000-0000-0000-0000-000000000004',
    'prd-1',
    'prd-2',
    'prd-3',
    'prd-4',
  ],
  PACKAGES: [
    'ca100000-0000-0000-0000-000000000001',
    'ca200000-0000-0000-0000-000000000002',
    'pkg-1',
    'pkg-2',
    'pkg-3',
  ],
  CLIENT_PACKAGES: [
    'cb100000-0000-0000-0000-000000000001',
    'cpkg-1',
    'cpkg-2',
  ],
  LOYALTY: [
    'cc100000-0000-0000-0000-000000000001',
    'cc200000-0000-0000-0000-000000000002',
    'cc300000-0000-0000-0000-000000000003',
    'loy-1',
    'loy-2',
    'loy-3',
    'loy-4',
  ],
  FOLLOW_UPS: [
    'cd100000-0000-0000-0000-000000000001',
    'cd200000-0000-0000-0000-000000000002',
    'cd300000-0000-0000-0000-000000000003',
    'flw-1',
    'flw-2',
    'flw-3',
  ],
};

function ensureUUID(id?: string | null): string {
  if (id && isValidUUID(id)) return id;
  return generateUUID();
}

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

// Default empty initial values (Studio Jaque Souza)
const emptySettings: BusinessSettings = {
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

export const DataService = {
  // Purge all demo/fictitious records from Supabase and LocalStorage
  async purgeDemoData(): Promise<void> {
    // 1. Wipe demo items from LocalStorage
    const cleanStorageList = (key: string, idsToRemove: string[], nameField?: string, namesToRemove?: string[]) => {
      const list = getLocal<any[]>(key, []);
      const filtered = list.filter(item => {
        if (!item) return false;
        if (item.id && idsToRemove.includes(item.id)) return false;
        if (nameField && item[nameField] && namesToRemove && namesToRemove.includes(item[nameField])) return false;
        return true;
      });
      setLocal(key, filtered);
      return filtered;
    };

    cleanStorageList(STORAGE_KEYS.PROFESSIONALS, DEMO_IDS.PROFESSIONALS, 'name', DEMO_IDS.PROFESSIONAL_NAMES);
    cleanStorageList(STORAGE_KEYS.CLIENTS, DEMO_IDS.CLIENTS, 'name', DEMO_IDS.CLIENT_NAMES);
    cleanStorageList(STORAGE_KEYS.APPOINTMENTS, DEMO_IDS.APPOINTMENTS);
    cleanStorageList(STORAGE_KEYS.TRANSACTIONS, DEMO_IDS.TRANSACTIONS);
    cleanStorageList(STORAGE_KEYS.PRODUCTS, DEMO_IDS.PRODUCTS);
    cleanStorageList(STORAGE_KEYS.PACKAGES, DEMO_IDS.PACKAGES);
    cleanStorageList(STORAGE_KEYS.CLIENT_PACKAGES, DEMO_IDS.CLIENT_PACKAGES);
    cleanStorageList(STORAGE_KEYS.LOYALTY_ACCOUNTS, DEMO_IDS.LOYALTY);
    cleanStorageList(STORAGE_KEYS.FOLLOW_UPS, DEMO_IDS.FOLLOW_UPS);
    cleanStorageList(STORAGE_KEYS.COMMISSIONS, []);
    cleanStorageList(STORAGE_KEYS.CASH_REGISTERS, ['cr-today']);
    cleanStorageList(STORAGE_KEYS.CASH_MOVEMENTS, ['cm-1', 'cm-2', 'cm-3']);

    // 2. Cascade delete from Supabase (dependent foreign keys first)
    if (isSupabaseConfigured && supabase) {
      try {
        // Appointments
        await supabase.from('appointments').delete().in('id', DEMO_IDS.APPOINTMENTS);
        await supabase.from('appointments').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('appointments').delete().in('professional_id', DEMO_IDS.PROFESSIONALS);

        // Transactions & Commissions
        await supabase.from('financial_transactions').delete().in('id', DEMO_IDS.TRANSACTIONS);
        await supabase.from('financial_transactions').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('commission_records').delete().in('professional_id', DEMO_IDS.PROFESSIONALS);

        // Follow-ups & Loyalty & Packages
        await supabase.from('client_follow_ups').delete().in('id', DEMO_IDS.FOLLOW_UPS);
        await supabase.from('client_follow_ups').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('client_recovery_logs').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('loyalty_accounts').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('client_packages').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('packages').delete().in('id', DEMO_IDS.PACKAGES);

        // Products
        await supabase.from('products').delete().in('id', DEMO_IDS.PRODUCTS);

        // Schedules & Blocks
        await supabase.from('schedule_blocks').delete().in('professional_id', DEMO_IDS.PROFESSIONALS);
        await supabase.from('professional_schedules').delete().in('professional_id', DEMO_IDS.PROFESSIONALS);

        // Evolutions & Photos
        await supabase.from('treatment_evolutions').delete().in('client_id', DEMO_IDS.CLIENTS);
        await supabase.from('treatment_photos').delete().in('client_id', DEMO_IDS.CLIENTS);

        // Clients — delete ONLY the demo clients (Excel-imported clients are 100% untouched)
        await supabase.from('clients').delete().in('id', DEMO_IDS.CLIENTS);
        await supabase.from('clients').delete().in('name', DEMO_IDS.CLIENT_NAMES);

        // Professionals — delete ONLY fictitious professionals
        await supabase.from('professionals').delete().in('id', DEMO_IDS.PROFESSIONALS);
        await supabase.from('professionals').delete().in('name', DEMO_IDS.PROFESSIONAL_NAMES);

        // Cash registers
        await supabase.from('cash_movements').delete().like('cash_register_id', 'cr-%');
        await supabase.from('cash_registers').delete().like('id', 'cr-%');
      } catch (err) {
        console.warn('[Supabase] Warning during demo purge:', err);
      }
    }
  },

  // Business Settings
  async getSettings(): Promise<BusinessSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('business_settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return getLocal<BusinessSettings>(STORAGE_KEYS.SETTINGS, emptySettings);
  },

  async saveSettings(settings: BusinessSettings): Promise<BusinessSettings> {
    const validSettings: BusinessSettings = {
      ...settings,
      id: ensureUUID(settings.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('business_settings').upsert(validSettings).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar configurações:', error);
      } else if (data) {
        setLocal(STORAGE_KEYS.SETTINGS, data);
        return data;
      }
    }
    setLocal(STORAGE_KEYS.SETTINGS, validSettings);
    return validSettings;
  },

  // Categories
  async getCategories(): Promise<ServiceCategory[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_categories').select('*').order('sort_order');
      if (!error && data) return data;
    }
    return getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, []);
  },

  async saveCategory(cat: ServiceCategory): Promise<ServiceCategory> {
    const validCat: ServiceCategory = {
      ...cat,
      id: ensureUUID(cat.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_categories').upsert(validCat).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar categoria:', error);
      } else if (data) {
        validCat.id = data.id;
      }
    }
    const list = getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    const idx = list.findIndex(c => c.id === validCat.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validCat.id ? validCat : c)) : [...list, validCat];
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
    return validCat;
  },

  // Services
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('services').select('*, category:service_categories(*)').order('name');
      if (!error && data) return data;
    }
    const services = getLocal<Service[]>(STORAGE_KEYS.SERVICES, []);
    const categories = getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    return services.map(s => ({
      ...s,
      category: categories.find(c => c.id === s.category_id),
    }));
  },

  async saveService(service: Service): Promise<Service> {
    const validService: Service = {
      ...service,
      id: ensureUUID(service.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { category, recommended_return_days, post_procedure_followup_days, ...cleanService } = validService as any;
      const { data, error } = await supabase.from('services').upsert(cleanService).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar serviço:', error);
      } else if (data) {
        validService.id = data.id;
      }
    }
    const list = getLocal<Service[]>(STORAGE_KEYS.SERVICES, []);
    const idx = list.findIndex(s => s.id === validService.id);
    const updated = idx >= 0 ? list.map(s => (s.id === validService.id ? validService : s)) : [...list, validService];
    setLocal(STORAGE_KEYS.SERVICES, updated);
    return validService;
  },

  async deleteService(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      // Disassociate / delete dependent appointments
      await supabase.from('appointments').delete().eq('service_id', id);
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao deletar serviço:', error);
        await supabase.from('services').update({ active: false }).eq('id', id);
      }
    }
    const list = getLocal<Service[]>(STORAGE_KEYS.SERVICES, []);
    setLocal(STORAGE_KEYS.SERVICES, list.filter(s => s.id !== id));
    return true;
  },

  // Professionals
  async getProfessionals(): Promise<Professional[]> {
    let result: Professional[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('professionals').select('*').order('name');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, []);
    }
    // Always filter out fictitious professionals
    const clean = result.filter(p =>
      !DEMO_IDS.PROFESSIONALS.includes(p.id) &&
      !DEMO_IDS.PROFESSIONAL_NAMES.includes(p.name)
    );
    setLocal(STORAGE_KEYS.PROFESSIONALS, clean);
    return clean;
  },

  async saveProfessional(prof: Professional): Promise<Professional> {
    const validProf: Professional = {
      ...prof,
      id: ensureUUID(prof.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('professionals').upsert(validProf).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar profissional:', error);
      } else if (data) {
        validProf.id = data.id;
      }
    }
    const list = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, []);
    const idx = list.findIndex(p => p.id === validProf.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validProf.id ? validProf : p)) : [...list, validProf];
    setLocal(STORAGE_KEYS.PROFESSIONALS, updated);
    return validProf;
  },

  async deleteProfessional(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      // 1. Cascade delete or nullify foreign key dependents in Supabase first
      await supabase.from('schedule_blocks').delete().eq('professional_id', id);
      await supabase.from('professional_schedules').delete().eq('professional_id', id);
      await supabase.from('commission_records').delete().eq('professional_id', id);
      await supabase.from('treatment_evolutions').delete().eq('professional_id', id);
      await supabase.from('appointments').delete().eq('professional_id', id);
      await supabase.from('clients').update({ preferred_professional_id: null }).eq('preferred_professional_id', id);
      await supabase.from('financial_transactions').update({ professional_id: null }).eq('professional_id', id);

      // 2. Delete professional
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao deletar profissional:', error);
        // Fallback: soft delete so it never appears
        await supabase.from('professionals').update({ active: false }).eq('id', id);
      }
    }
    const list = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, []);
    setLocal(STORAGE_KEYS.PROFESSIONALS, list.filter(p => p.id !== id));
    return true;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    let result: Client[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clients').select('*').order('name');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, []);
    }
    // Always filter out fictitious clients (preserving Excel-imported and user-created clients)
    const clean = result.filter(c =>
      !DEMO_IDS.CLIENTS.includes(c.id) &&
      !DEMO_IDS.CLIENT_NAMES.includes(c.name)
    );
    setLocal(STORAGE_KEYS.CLIENTS, clean);
    return clean;
  },

  async saveClient(client: Client): Promise<Client> {
    const validClient: Client = {
      ...client,
      id: ensureUUID(client.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clients').upsert(validClient).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar cliente:', error);
      } else if (data) {
        validClient.id = data.id;
      }
    }
    const list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, []);
    const idx = list.findIndex(c => c.id === validClient.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validClient.id ? validClient : c)) : [validClient, ...list];
    setLocal(STORAGE_KEYS.CLIENTS, updated);
    return validClient;
  },

  async deleteClient(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      // Cascade delete foreign key dependents first to prevent Postgres foreign key violation
      await supabase.from('client_follow_ups').delete().eq('client_id', id);
      await supabase.from('client_recovery_logs').delete().eq('client_id', id);
      await supabase.from('loyalty_accounts').delete().eq('client_id', id);
      await supabase.from('client_packages').delete().eq('client_id', id);
      await supabase.from('anamnesis_records').delete().eq('client_id', id);
      await supabase.from('treatment_photos').delete().eq('client_id', id);
      await supabase.from('treatment_evolutions').delete().eq('client_id', id);
      await supabase.from('financial_transactions').delete().eq('client_id', id);
      await supabase.from('commission_records').delete().eq('client_id', id);
      await supabase.from('appointments').delete().eq('client_id', id);

      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao deletar cliente:', error);
        await supabase.from('clients').update({ active: false }).eq('id', id);
      }
    }
    const list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, []);
    setLocal(STORAGE_KEYS.CLIENTS, list.filter(c => c.id !== id));
    return true;
  },

  async saveBatchClients(clientsToSave: Partial<Client>[], updateDuplicates: boolean = true): Promise<{ created: number; updated: number; savedClients: Client[] }> {
    const existingList = await this.getClients();
    let createdCount = 0;
    let updatedCount = 0;
    const finalClients: Client[] = [...existingList];

    for (const item of clientsToSave) {
      const cleanPhone = (item.whatsapp || item.phone || '').replace(/\D/g, '');
      const existingIdx = finalClients.findIndex(c => {
        const cPhone = (c.whatsapp || c.phone || '').replace(/\D/g, '');
        return (cPhone && cleanPhone && cPhone === cleanPhone) || (c.name.toLowerCase().trim() === (item.name || '').toLowerCase().trim());
      });

      if (existingIdx >= 0) {
        if (updateDuplicates) {
          const merged: Client = {
            ...finalClients[existingIdx],
            ...item,
            id: ensureUUID(finalClients[existingIdx].id),
            name: item.name || finalClients[existingIdx].name,
            whatsapp: item.whatsapp || finalClients[existingIdx].whatsapp,
            updated_at: new Date().toISOString(),
          };
          if (isSupabaseConfigured && supabase) {
            await supabase.from('clients').upsert(merged);
          }
          finalClients[existingIdx] = merged;
          updatedCount++;
        }
      } else {
        const newClient: Client = {
          id: ensureUUID(item.id),
          name: item.name || '',
          whatsapp: item.whatsapp || item.phone || '',
          phone: item.phone || item.whatsapp,
          nickname: item.nickname,
          email: item.email,
          cpf: item.cpf,
          birth_date: item.birth_date,
          address: item.address,
          city: item.city,
          state: item.state,
          how_did_you_find_us: item.how_did_you_find_us,
          allow_contact: item.allow_contact ?? true,
          tags: item.tags || [],
          notes: item.notes,
          total_appointments: 0,
          total_spent: 0,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (isSupabaseConfigured && supabase) {
          await supabase.from('clients').insert(newClient);
        }
        finalClients.unshift(newClient);
        createdCount++;
      }
    }

    setLocal(STORAGE_KEYS.CLIENTS, finalClients);
    return { created: createdCount, updated: updatedCount, savedClients: finalClients };
  },

  // Appointments — with date range filter for performance
  async getAppointments(daysBack: number = 60, daysForward: number = 60): Promise<Appointment[]> {
    let result: Appointment[] = [];
    if (isSupabaseConfigured && supabase) {
      const now = new Date();
      const from = new Date(now.getTime() - daysBack * 86400000).toISOString();
      const to = new Date(now.getTime() + daysForward * 86400000).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:clients(id, name, nickname, whatsapp, phone), professional:professionals(id, name, nickname, color), service:services(id, name, duration_minutes, price, promotional_price, buffer_minutes)')
        .gte('start_time', from)
        .lte('start_time', to)
        .order('start_time');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    }
    // Always filter out demo appointments
    const clean = result.filter(a =>
      !DEMO_IDS.APPOINTMENTS.includes(a.id) &&
      !DEMO_IDS.CLIENTS.includes(a.client_id) &&
      !DEMO_IDS.PROFESSIONALS.includes(a.professional_id)
    );
    setLocal(STORAGE_KEYS.APPOINTMENTS, clean);
    return clean;
  },

  async saveAppointment(app: Appointment): Promise<Appointment> {
    const validId = ensureUUID(app.id);
    const calculatedFinalPrice = Math.max(0, (app.price || 0) - (app.discount || 0));
    
    const validApp: Appointment = {
      ...app,
      id: validId,
      final_price: calculatedFinalPrice,
    };

    if (isSupabaseConfigured && supabase) {
      const cleanPayload: Record<string, any> = {
        id: validApp.id,
        client_id: validApp.client_id,
        professional_id: validApp.professional_id,
        service_id: validApp.service_id,
        start_time: validApp.start_time,
        end_time: validApp.end_time,
        duration_minutes: validApp.duration_minutes,
        status: validApp.status,
        price: validApp.price,
        discount: validApp.discount,
        deposit_requested: validApp.deposit_requested,
        deposit_amount: validApp.deposit_amount,
        deposit_paid: validApp.deposit_paid,
        deposit_paid_at: validApp.deposit_paid_at || null,
        payment_method: validApp.payment_method || null,
        payment_status: validApp.payment_status,
        notes: validApp.notes || null,
        internal_notes: validApp.internal_notes || null,
        cancellation_reason: validApp.cancellation_reason || null,
        created_at: validApp.created_at,
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .upsert(cleanPayload)
        .select()
        .single();
        
      if (error) {
        console.error('[Supabase Error] Falha ao salvar agendamento:', error);
        throw new Error(`Erro ao salvar no banco Supabase: ${error.message}`);
      }
      
      if (data) {
        const savedApp: Appointment = {
          ...validApp,
          ...data,
          final_price: calculatedFinalPrice,
          client: app.client,
          professional: app.professional,
          service: app.service,
        };
        const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
        const idx = list.findIndex(a => a.id === savedApp.id);
        const updated = idx >= 0 ? list.map(a => (a.id === savedApp.id ? savedApp : a)) : [savedApp, ...list];
        setLocal(STORAGE_KEYS.APPOINTMENTS, updated);
        return savedApp;
      }
    }

    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const idx = list.findIndex(a => a.id === validApp.id);
    const updated = idx >= 0 ? list.map(a => (a.id === validApp.id ? validApp : a)) : [validApp, ...list];
    setLocal(STORAGE_KEYS.APPOINTMENTS, updated);
    return validApp;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      // Disassociate / delete foreign key dependents
      await supabase.from('financial_transactions').delete().eq('appointment_id', id);
      await supabase.from('commission_records').delete().eq('appointment_id', id);
      await supabase.from('anamnesis_records').update({ appointment_id: null }).eq('appointment_id', id);
      await supabase.from('client_packages').update({ appointment_id: null }).eq('appointment_id', id);
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao deletar agendamento:', error);
      }
    }
    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    setLocal(STORAGE_KEYS.APPOINTMENTS, list.filter(a => a.id !== id));
    return true;
  },

  // Templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notification_templates').select('*');
      if (!error && data) return data;
    }
    return getLocal<NotificationTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
  },

  async saveTemplate(tpl: NotificationTemplate): Promise<NotificationTemplate> {
    const validTpl: NotificationTemplate = {
      ...tpl,
      id: ensureUUID(tpl.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notification_templates').upsert(validTpl).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar template:', error);
      } else if (data) {
        validTpl.id = data.id;
      }
    }
    const list = getLocal<NotificationTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
    const idx = list.findIndex(t => t.id === validTpl.id);
    const updated = idx >= 0 ? list.map(t => (t.id === validTpl.id ? validTpl : t)) : [...list, validTpl];
    setLocal(STORAGE_KEYS.TEMPLATES, updated);
    return validTpl;
  },

  // Anamnesis Templates
  async getAnamnesisTemplates(): Promise<AnamnesisTemplate[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('anamnesis_templates').select('*');
      if (!error && data) return data;
    }
    return getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, []);
  },

  async saveAnamnesisTemplate(tpl: AnamnesisTemplate): Promise<AnamnesisTemplate> {
    const validTpl: AnamnesisTemplate = {
      ...tpl,
      id: ensureUUID(tpl.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('anamnesis_templates').upsert(validTpl).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar template de anamnese:', error);
      } else if (data) {
        validTpl.id = data.id;
      }
    }
    const list = getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, []);
    const idx = list.findIndex(t => t.id === validTpl.id);
    const updated = idx >= 0 ? list.map(t => (t.id === validTpl.id ? validTpl : t)) : [...list, validTpl];
    setLocal(STORAGE_KEYS.ANAMNESIS_TEMPLATES, updated);
    return validTpl;
  },

  async deleteAnamnesisTemplate(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('anamnesis_templates').delete().eq('id', id);
    }
    const list = getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, []);
    setLocal(STORAGE_KEYS.ANAMNESIS_TEMPLATES, list.filter(t => t.id !== id));
    return true;
  },

  // Anamnesis Records
  async getAnamnesisRecords(clientId?: string): Promise<AnamnesisRecord[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('anamnesis_records').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const records = getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, []);
    return clientId ? records.filter(r => r.client_id === clientId) : records;
  },

  async saveAnamnesisRecord(rec: AnamnesisRecord): Promise<AnamnesisRecord> {
    const validRec: AnamnesisRecord = {
      ...rec,
      id: ensureUUID(rec.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('anamnesis_records').upsert(validRec).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar ficha de anamnese:', error);
      } else if (data) {
        validRec.id = data.id;
      }
    }
    const list = getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, []);
    const idx = list.findIndex(r => r.id === validRec.id);
    const updated = idx >= 0 ? list.map(r => (r.id === validRec.id ? validRec : r)) : [validRec, ...list];
    setLocal(STORAGE_KEYS.ANAMNESIS_RECORDS, updated);
    return validRec;
  },

  async deleteAnamnesisRecord(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('anamnesis_records').delete().eq('id', id);
    }
    const list = getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, []);
    setLocal(STORAGE_KEYS.ANAMNESIS_RECORDS, list.filter(r => r.id !== id));
    return true;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    let result: Product[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    }
    const clean = result.filter(p => !DEMO_IDS.PRODUCTS.includes(p.id));
    setLocal(STORAGE_KEYS.PRODUCTS, clean);
    return clean;
  },

  async saveProduct(prod: Product): Promise<Product> {
    const validProd: Product = {
      ...prod,
      id: ensureUUID(prod.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').upsert(validProd).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar produto:', error);
      } else if (data) {
        validProd.id = data.id;
      }
    }
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = list.findIndex(p => p.id === validProd.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validProd.id ? validProd : p)) : [...list, validProd];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return validProd;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    setLocal(STORAGE_KEYS.PRODUCTS, list.filter(p => p.id !== id));
    return true;
  },

  // Evolutions
  async getEvolutions(clientId?: string): Promise<TreatmentEvolution[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('treatment_evolutions').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query.order('date', { ascending: false });
      if (!error && data) return data;
    }
    const evos = getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, []);
    return clientId ? evos.filter(e => e.client_id === clientId) : evos;
  },

  async saveEvolution(evo: TreatmentEvolution): Promise<TreatmentEvolution> {
    const validEvo: TreatmentEvolution = {
      ...evo,
      id: ensureUUID(evo.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('treatment_evolutions').upsert(validEvo).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar evolução:', error);
      } else if (data) {
        validEvo.id = data.id;
      }
    }
    const list = getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, []);
    const idx = list.findIndex(e => e.id === validEvo.id);
    const updated = idx >= 0 ? list.map(e => (e.id === validEvo.id ? validEvo : e)) : [validEvo, ...list];
    setLocal(STORAGE_KEYS.EVOLUTIONS, updated);
    return validEvo;
  },

  async deleteEvolution(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('treatment_evolutions').delete().eq('id', id);
    }
    const list = getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, []);
    setLocal(STORAGE_KEYS.EVOLUTIONS, list.filter(e => e.id !== id));
    return true;
  },

  // Photos
  async getPhotos(clientId?: string): Promise<TreatmentPhoto[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('treatment_photos').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query.order('date', { ascending: false });
      if (!error && data) return data;
    }
    const photos = getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, []);
    return clientId ? photos.filter(p => p.client_id === clientId) : photos;
  },

  async savePhoto(photo: TreatmentPhoto): Promise<TreatmentPhoto> {
    const validPhoto: TreatmentPhoto = {
      ...photo,
      id: ensureUUID(photo.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('treatment_photos').upsert(validPhoto).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar foto:', error);
      } else if (data) {
        validPhoto.id = data.id;
      }
    }
    const list = getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, []);
    const idx = list.findIndex(p => p.id === validPhoto.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validPhoto.id ? validPhoto : p)) : [validPhoto, ...list];
    setLocal(STORAGE_KEYS.PHOTOS, updated);
    return validPhoto;
  },

  async deletePhoto(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('treatment_photos').delete().eq('id', id);
    }
    const list = getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, []);
    setLocal(STORAGE_KEYS.PHOTOS, list.filter(p => p.id !== id));
    return true;
  },

  // Financial Transactions
  async getTransactions(): Promise<FinancialTransaction[]> {
    let result: FinancialTransaction[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('financial_transactions').select('*').order('paid_at', { ascending: false }).limit(200);
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    }
    const clean = result.filter(t => !DEMO_IDS.TRANSACTIONS.includes(t.id));
    setLocal(STORAGE_KEYS.TRANSACTIONS, clean);
    return clean;
  },

  async saveTransaction(tr: FinancialTransaction): Promise<FinancialTransaction> {
    const validTr: FinancialTransaction = {
      ...tr,
      id: ensureUUID(tr.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { appointment, client, professional, category, ...cleanTr } = validTr as any;
      const { data, error } = await supabase.from('financial_transactions').upsert(cleanTr).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar transação financeira:', error);
      } else if (data) {
        validTr.id = data.id;
      }
    }
    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const idx = list.findIndex(t => t.id === validTr.id);
    const updated = idx >= 0 ? list.map(t => (t.id === validTr.id ? validTr : t)) : [validTr, ...list];
    setLocal(STORAGE_KEYS.TRANSACTIONS, updated);
    return validTr;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao deletar transação:', error);
      }
    }
    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    setLocal(STORAGE_KEYS.TRANSACTIONS, list.filter(t => t.id !== id));
    return true;
  },

  // Cash Registers
  async getCashRegisters(): Promise<CashRegister[]> {
    let result: CashRegister[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_registers').select('*').order('opened_at', { ascending: false }).limit(30);
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, []);
    }
    const clean = result.filter(c => c.id !== 'cr-today');
    setLocal(STORAGE_KEYS.CASH_REGISTERS, clean);
    return clean;
  },

  async saveCashRegister(cr: CashRegister): Promise<CashRegister> {
    const validCr: CashRegister = {
      ...cr,
      id: ensureUUID(cr.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { opened_by_name, closed_by_name, ...cleanCr } = validCr as any;
      const { data, error } = await supabase.from('cash_registers').upsert(cleanCr).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar caixa:', error);
      } else if (data) {
        validCr.id = data.id;
      }
    }
    const list = getLocal<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, []);
    const idx = list.findIndex(c => c.id === validCr.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validCr.id ? validCr : c)) : [validCr, ...list];
    setLocal(STORAGE_KEYS.CASH_REGISTERS, updated);
    return validCr;
  },

  async getCashMovements(): Promise<CashMovement[]> {
    let result: CashMovement[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_movements').select('*').order('created_at', { ascending: false }).limit(200);
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, []);
    }
    const clean = result.filter(c => !['cm-1', 'cm-2', 'cm-3'].includes(c.id));
    setLocal(STORAGE_KEYS.CASH_MOVEMENTS, clean);
    return clean;
  },

  async saveCashMovement(cm: CashMovement): Promise<CashMovement> {
    const validCm: CashMovement = {
      ...cm,
      id: ensureUUID(cm.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_movements').upsert(validCm).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar movimentação de caixa:', error);
      } else if (data) {
        validCm.id = data.id;
      }
    }
    const list = getLocal<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, []);
    const updated = [validCm, ...list];
    setLocal(STORAGE_KEYS.CASH_MOVEMENTS, updated);
    return validCm;
  },

  // Packages
  async getPackages(): Promise<Package[]> {
    let result: Package[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('packages').select('*').order('name');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<Package[]>(STORAGE_KEYS.PACKAGES, []);
    }
    const clean = result.filter(p => !DEMO_IDS.PACKAGES.includes(p.id));
    setLocal(STORAGE_KEYS.PACKAGES, clean);
    return clean;
  },

  async savePackage(pkg: Package): Promise<Package> {
    const validPkg: Package = {
      ...pkg,
      id: ensureUUID(pkg.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('packages').upsert(validPkg).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar pacote:', error);
      } else if (data) {
        validPkg.id = data.id;
      }
    }
    const list = getLocal<Package[]>(STORAGE_KEYS.PACKAGES, []);
    const idx = list.findIndex(p => p.id === validPkg.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validPkg.id ? validPkg : p)) : [...list, validPkg];
    setLocal(STORAGE_KEYS.PACKAGES, updated);
    return validPkg;
  },

  async deletePackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('client_packages').delete().eq('package_id', id);
      await supabase.from('packages').delete().eq('id', id);
    }
    const list = getLocal<Package[]>(STORAGE_KEYS.PACKAGES, []);
    setLocal(STORAGE_KEYS.PACKAGES, list.filter(p => p.id !== id));
    return true;
  },

  async getClientPackages(): Promise<ClientPackage[]> {
    let result: ClientPackage[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_packages').select('*').order('purchased_at', { ascending: false });
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, []);
    }
    const clean = result.filter(c => !DEMO_IDS.CLIENT_PACKAGES.includes(c.id) && !DEMO_IDS.CLIENTS.includes(c.client_id));
    setLocal(STORAGE_KEYS.CLIENT_PACKAGES, clean);
    return clean;
  },

  async saveClientPackage(cpkg: ClientPackage): Promise<ClientPackage> {
    const validCpkg: ClientPackage = {
      ...cpkg,
      id: ensureUUID(cpkg.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_packages').upsert(validCpkg).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar pacote da cliente:', error);
      } else if (data) {
        validCpkg.id = data.id;
      }
    }
    const list = getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, []);
    const idx = list.findIndex(c => c.id === validCpkg.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validCpkg.id ? validCpkg : c)) : [validCpkg, ...list];
    setLocal(STORAGE_KEYS.CLIENT_PACKAGES, updated);
    return validCpkg;
  },

  async deleteClientPackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('client_packages').delete().eq('id', id);
    }
    const list = getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, []);
    setLocal(STORAGE_KEYS.CLIENT_PACKAGES, list.filter(c => c.id !== id));
    return true;
  },

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('promotions').select('*').order('start_date');
      if (!error && data) return data;
    }
    return getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, []);
  },

  async savePromotion(promo: Promotion): Promise<Promotion> {
    const validPromo: Promotion = {
      ...promo,
      id: ensureUUID(promo.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('promotions').upsert(validPromo).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar promoção:', error);
      } else if (data) {
        validPromo.id = data.id;
      }
    }
    const list = getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, []);
    const idx = list.findIndex(p => p.id === validPromo.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validPromo.id ? validPromo : p)) : [...list, validPromo];
    setLocal(STORAGE_KEYS.PROMOTIONS, updated);
    return validPromo;
  },

  async deletePromotion(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('promotions').delete().eq('id', id);
    }
    const list = getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, []);
    setLocal(STORAGE_KEYS.PROMOTIONS, list.filter(p => p.id !== id));
    return true;
  },

  // Loyalty
  async getLoyaltyAccounts(): Promise<LoyaltyAccount[]> {
    let result: LoyaltyAccount[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('loyalty_accounts').select('*');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<LoyaltyAccount[]>(STORAGE_KEYS.LOYALTY_ACCOUNTS, []);
    }
    const clean = result.filter(l => !DEMO_IDS.LOYALTY.includes(l.id) && !DEMO_IDS.CLIENTS.includes(l.client_id));
    setLocal(STORAGE_KEYS.LOYALTY_ACCOUNTS, clean);
    return clean;
  },

  async saveLoyaltyAccount(acc: LoyaltyAccount): Promise<LoyaltyAccount> {
    const validAcc: LoyaltyAccount = {
      ...acc,
      id: ensureUUID(acc.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('loyalty_accounts').upsert(validAcc).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar conta fidelidade:', error);
      } else if (data) {
        validAcc.id = data.id;
      }
    }
    const list = getLocal<LoyaltyAccount[]>(STORAGE_KEYS.LOYALTY_ACCOUNTS, []);
    const idx = list.findIndex(a => a.id === validAcc.id);
    const updated = idx >= 0 ? list.map(a => (a.id === validAcc.id ? validAcc : a)) : [validAcc, ...list];
    setLocal(STORAGE_KEYS.LOYALTY_ACCOUNTS, updated);
    return validAcc;
  },

  // Commissions
  async getCommissions(): Promise<CommissionRecord[]> {
    let result: CommissionRecord[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('commission_records').select('*').order('appointment_date', { ascending: false }).limit(200);
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<CommissionRecord[]>(STORAGE_KEYS.COMMISSIONS, []);
    }
    const clean = result.filter(c => !DEMO_IDS.PROFESSIONALS.includes(c.professional_id) && !c.id.startsWith('ce1'));
    setLocal(STORAGE_KEYS.COMMISSIONS, clean);
    return clean;
  },

  async saveCommission(com: CommissionRecord): Promise<CommissionRecord> {
    const validCom: CommissionRecord = {
      ...com,
      id: ensureUUID(com.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('commission_records').upsert(validCom).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar comissão:', error);
      } else if (data) {
        validCom.id = data.id;
      }
    }
    const list = getLocal<CommissionRecord[]>(STORAGE_KEYS.COMMISSIONS, []);
    const idx = list.findIndex(c => c.id === validCom.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validCom.id ? validCom : c)) : [validCom, ...list];
    setLocal(STORAGE_KEYS.COMMISSIONS, updated);
    return validCom;
  },

  // CRM CONFIG & FOLLOW-UPS
  async getCRMConfig(): Promise<CRMConfig> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('crm_settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return getLocal<CRMConfig>(STORAGE_KEYS.CRM_CONFIG, defaultCRMConfig);
  },

  async saveCRMConfig(cfg: CRMConfig): Promise<CRMConfig> {
    const validCfg: CRMConfig = {
      ...cfg,
      id: ensureUUID(cfg.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('crm_settings').upsert(validCfg).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar CRM config:', error);
      } else if (data) {
        setLocal(STORAGE_KEYS.CRM_CONFIG, data);
        return data;
      }
    }
    setLocal(STORAGE_KEYS.CRM_CONFIG, validCfg);
    return validCfg;
  },

  async getFollowUps(): Promise<ClientFollowUp[]> {
    let result: ClientFollowUp[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_follow_ups').select('*').order('recommended_date');
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    }
    const clean = result.filter(f => !DEMO_IDS.FOLLOW_UPS.includes(f.id) && !DEMO_IDS.CLIENTS.includes(f.client_id));
    setLocal(STORAGE_KEYS.FOLLOW_UPS, clean);
    return clean;
  },

  async saveFollowUp(flw: ClientFollowUp): Promise<ClientFollowUp> {
    const validFlw: ClientFollowUp = {
      ...flw,
      id: ensureUUID(flw.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_follow_ups').upsert(validFlw).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar follow-up:', error);
      } else if (data) {
        validFlw.id = data.id;
      }
    }
    const list = getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    const idx = list.findIndex(f => f.id === validFlw.id);
    const updated = idx >= 0 ? list.map(f => (f.id === validFlw.id ? validFlw : f)) : [validFlw, ...list];
    setLocal(STORAGE_KEYS.FOLLOW_UPS, updated);
    return validFlw;
  },

  async deleteFollowUp(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('client_follow_ups').delete().eq('id', id);
    }
    const list = getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    setLocal(STORAGE_KEYS.FOLLOW_UPS, list.filter(f => f.id !== id));
    return true;
  },

  async getRecoveryLogs(): Promise<ClientRecoveryLog[]> {
    let result: ClientRecoveryLog[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_recovery_logs').select('*').order('recovered_at', { ascending: false });
      if (!error && data) {
        result = data;
      }
    }
    if (result.length === 0) {
      result = getLocal<ClientRecoveryLog[]>(STORAGE_KEYS.RECOVERY_LOGS, []);
    }
    const clean = result.filter(l => !DEMO_IDS.CLIENTS.includes(l.client_id));
    setLocal(STORAGE_KEYS.RECOVERY_LOGS, clean);
    return clean;
  },

  async saveRecoveryLog(log: ClientRecoveryLog): Promise<ClientRecoveryLog> {
    const validLog: ClientRecoveryLog = {
      ...log,
      id: ensureUUID(log.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_recovery_logs').upsert(validLog).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar histórico de recuperação:', error);
      } else if (data) {
        validLog.id = data.id;
      }
    }
    const list = getLocal<ClientRecoveryLog[]>(STORAGE_KEYS.RECOVERY_LOGS, []);
    const updated = [validLog, ...list];
    setLocal(STORAGE_KEYS.RECOVERY_LOGS, updated);
    return validLog;
  },
};
