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
    return getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
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
    const list = getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
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
    const services = getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const categories = getLocal<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
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
      const { category, ...cleanService } = validService;
      const { data, error } = await supabase.from('services').upsert(cleanService).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar serviço:', error);
      } else if (data) {
        validService.id = data.id;
      }
    }
    const list = getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const idx = list.findIndex(s => s.id === validService.id);
    const updated = idx >= 0 ? list.map(s => (s.id === validService.id ? validService : s)) : [...list, validService];
    setLocal(STORAGE_KEYS.SERVICES, updated);
    return validService;
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
    const list = getLocal<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
    const idx = list.findIndex(p => p.id === validProf.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validProf.id ? validProf : p)) : [...list, validProf];
    setLocal(STORAGE_KEYS.PROFESSIONALS, updated);
    return validProf;
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
    const list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
    const idx = list.findIndex(c => c.id === validClient.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validClient.id ? validClient : c)) : [validClient, ...list];
    setLocal(STORAGE_KEYS.CLIENTS, updated);
    return validClient;
  },

  async deleteClient(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').delete().eq('id', id);
    }
    const list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
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
    const validId = ensureUUID(app.id);
    const calculatedFinalPrice = Math.max(0, (app.price || 0) - (app.discount || 0));
    
    const validApp: Appointment = {
      ...app,
      id: validId,
      final_price: calculatedFinalPrice,
    };

    if (isSupabaseConfigured && supabase) {
      // Remover final_price (coluna calculada/generated no Postgres) e relacionamentos
      const { client, professional, service, final_price, ...cleanPayload } = validApp;
      
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
        const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
        const idx = list.findIndex(a => a.id === savedApp.id);
        const updated = idx >= 0 ? list.map(a => (a.id === savedApp.id ? savedApp : a)) : [savedApp, ...list];
        setLocal(STORAGE_KEYS.APPOINTMENTS, updated);
        return savedApp;
      }
    }

    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const idx = list.findIndex(a => a.id === validApp.id);
    const updated = idx >= 0 ? list.map(a => (a.id === validApp.id ? validApp : a)) : [validApp, ...list];
    setLocal(STORAGE_KEYS.APPOINTMENTS, updated);
    return validApp;
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
    const list = getLocal<NotificationTemplate[]>(STORAGE_KEYS.TEMPLATES, initialTemplates);
    const idx = list.findIndex(t => t.id === validTpl.id);
    const updated = idx >= 0 ? list.map(t => (t.id === validTpl.id ? validTpl : t)) : [...list, validTpl];
    setLocal(STORAGE_KEYS.TEMPLATES, updated);
    return validTpl;
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
    const list = getLocal<AnamnesisTemplate[]>(STORAGE_KEYS.ANAMNESIS_TEMPLATES, initialAnamnesisTemplates);
    const idx = list.findIndex(t => t.id === validTpl.id);
    const updated = idx >= 0 ? list.map(t => (t.id === validTpl.id ? validTpl : t)) : [...list, validTpl];
    setLocal(STORAGE_KEYS.ANAMNESIS_TEMPLATES, updated);
    return validTpl;
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
    const validRec: AnamnesisRecord = {
      ...rec,
      id: ensureUUID(rec.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('anamnesis_records').upsert(validRec).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar registro de anamnese:', error);
      } else if (data) {
        validRec.id = data.id;
      }
    }
    const list = getLocal<AnamnesisRecord[]>(STORAGE_KEYS.ANAMNESIS_RECORDS, initialAnamnesisRecords);
    const idx = list.findIndex(r => r.id === validRec.id);
    const updated = idx >= 0 ? list.map(r => (r.id === validRec.id ? validRec : r)) : [validRec, ...list];
    setLocal(STORAGE_KEYS.ANAMNESIS_RECORDS, updated);
    return validRec;
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
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const idx = list.findIndex(p => p.id === validProd.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validProd.id ? validProd : p)) : [...list, validProd];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return validProd;
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
    const list = getLocal<TreatmentEvolution[]>(STORAGE_KEYS.EVOLUTIONS, initialEvolutions);
    const idx = list.findIndex(e => e.id === validEvo.id);
    const updated = idx >= 0 ? list.map(e => (e.id === validEvo.id ? validEvo : e)) : [validEvo, ...list];
    setLocal(STORAGE_KEYS.EVOLUTIONS, updated);
    return validEvo;
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
    const list = getLocal<TreatmentPhoto[]>(STORAGE_KEYS.PHOTOS, initialPhotos);
    const idx = list.findIndex(p => p.id === validPhoto.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validPhoto.id ? validPhoto : p)) : [validPhoto, ...list];
    setLocal(STORAGE_KEYS.PHOTOS, updated);
    return validPhoto;
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
    const validTr: FinancialTransaction = {
      ...tr,
      id: ensureUUID(tr.id),
    };
    if (isSupabaseConfigured && supabase) {
      // Remove joined properties if any
      const { appointment, client, professional, category, ...cleanTr } = validTr as any;
      const { data, error } = await supabase.from('financial_transactions').upsert(cleanTr).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar transação financeira:', error);
      } else if (data) {
        validTr.id = data.id;
      }
    }
    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    const idx = list.findIndex(t => t.id === validTr.id);
    const updated = idx >= 0 ? list.map(t => (t.id === validTr.id ? validTr : t)) : [validTr, ...list];
    setLocal(STORAGE_KEYS.TRANSACTIONS, updated);
    return validTr;
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
    const validCr: CashRegister = {
      ...cr,
      id: ensureUUID(cr.id),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_registers').upsert(validCr).select().single();
      if (error) {
        console.error('[Supabase] Erro ao salvar caixa:', error);
      } else if (data) {
        validCr.id = data.id;
      }
    }
    const list = getLocal<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, initialCashRegisters);
    const idx = list.findIndex(c => c.id === validCr.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validCr.id ? validCr : c)) : [validCr, ...list];
    setLocal(STORAGE_KEYS.CASH_REGISTERS, updated);
    return validCr;
  },

  async getCashMovements(): Promise<CashMovement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_movements').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, initialCashMovements);
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
    const list = getLocal<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, initialCashMovements);
    const updated = [validCm, ...list];
    setLocal(STORAGE_KEYS.CASH_MOVEMENTS, updated);
    return validCm;
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
    const list = getLocal<Package[]>(STORAGE_KEYS.PACKAGES, initialPackages);
    const idx = list.findIndex(p => p.id === validPkg.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validPkg.id ? validPkg : p)) : [...list, validPkg];
    setLocal(STORAGE_KEYS.PACKAGES, updated);
    return validPkg;
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
    const list = getLocal<ClientPackage[]>(STORAGE_KEYS.CLIENT_PACKAGES, initialClientPackages);
    const idx = list.findIndex(c => c.id === validCpkg.id);
    const updated = idx >= 0 ? list.map(c => (c.id === validCpkg.id ? validCpkg : c)) : [validCpkg, ...list];
    setLocal(STORAGE_KEYS.CLIENT_PACKAGES, updated);
    return validCpkg;
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
    const list = getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    const idx = list.findIndex(p => p.id === validPromo.id);
    const updated = idx >= 0 ? list.map(p => (p.id === validPromo.id ? validPromo : p)) : [...list, validPromo];
    setLocal(STORAGE_KEYS.PROMOTIONS, updated);
    return validPromo;
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
    const list = getLocal<LoyaltyAccount[]>(STORAGE_KEYS.LOYALTY_ACCOUNTS, initialLoyaltyAccounts);
    const idx = list.findIndex(a => a.id === validAcc.id);
    const updated = idx >= 0 ? list.map(a => (a.id === validAcc.id ? validAcc : a)) : [validAcc, ...list];
    setLocal(STORAGE_KEYS.LOYALTY_ACCOUNTS, updated);
    return validAcc;
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
    const list = getLocal<CommissionRecord[]>(STORAGE_KEYS.COMMISSIONS, initialCommissions);
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('client_follow_ups').select('*').order('recommended_date');
      if (!error && data) return data;
    }
    return getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
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
    const list = getLocal<ClientFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
    const idx = list.findIndex(f => f.id === validFlw.id);
    const updated = idx >= 0 ? list.map(f => (f.id === validFlw.id ? validFlw : f)) : [validFlw, ...list];
    setLocal(STORAGE_KEYS.FOLLOW_UPS, updated);
    return validFlw;
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
    const list = getLocal<ClientRecoveryLog[]>(STORAGE_KEYS.RECOVERY_LOGS, initialRecoveryLogs);
    const updated = [validLog, ...list];
    setLocal(STORAGE_KEYS.RECOVERY_LOGS, updated);
    return validLog;
  },
};
