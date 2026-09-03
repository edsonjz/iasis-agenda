import { supabase, isSupabaseConfigured } from './supabase';
import {
  initialBusinessSettings,
  initialCategories,
  initialServices,
  initialProfessionals,
  initialClients,
  initialAppointments,
  initialTemplates,
} from './mockData';
import {
  BusinessSettings,
  ServiceCategory,
  Service,
  Professional,
  Client,
  Appointment,
  NotificationTemplate,
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
      const { data } = await supabase.from('services').upsert(service).select().single();
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
      // Stripping joined relational entities before upserting
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
      updated = [app, ...list];
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
};
