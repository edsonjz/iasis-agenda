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
} from './mockData';
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
      const { data, error } = await supabase
        .from('business_settings')
        .upsert(settings)
        .select()
        .single();
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
};
