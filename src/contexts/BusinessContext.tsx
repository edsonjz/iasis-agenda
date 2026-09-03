import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  DashboardMetrics,
} from '@/types';
import { DataService } from '@/lib/storage';
import { isSameDay, parseISO, isThisMonth, differenceInDays } from 'date-fns';

interface BusinessContextType {
  settings: BusinessSettings | null;
  categories: ServiceCategory[];
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: Appointment[];
  templates: NotificationTemplate[];
  anamnesisTemplates: AnamnesisTemplate[];
  anamnesisRecords: AnamnesisRecord[];
  products: Product[];
  evolutions: TreatmentEvolution[];
  photos: TreatmentPhoto[];
  metrics: DashboardMetrics;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Mutations & Deletions
  saveSettings: (settings: BusinessSettings) => Promise<void>;
  saveCategory: (cat: ServiceCategory) => Promise<void>;
  saveService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveProfessional: (prof: Professional) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  saveClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  saveAppointment: (app: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  saveTemplate: (tpl: NotificationTemplate) => Promise<void>;
  
  // Phase 3 Mutations
  saveAnamnesisTemplate: (tpl: AnamnesisTemplate) => Promise<void>;
  deleteAnamnesisTemplate: (id: string) => Promise<void>;
  saveAnamnesisRecord: (rec: AnamnesisRecord) => Promise<void>;
  deleteAnamnesisRecord: (id: string) => Promise<void>;
  saveProduct: (prod: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveEvolution: (evo: TreatmentEvolution) => Promise<void>;
  deleteEvolution: (id: string) => Promise<void>;
  savePhoto: (photo: TreatmentPhoto) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [anamnesisTemplates, setAnamnesisTemplates] = useState<AnamnesisTemplate[]>([]);
  const [anamnesisRecords, setAnamnesisRecords] = useState<AnamnesisRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [evolutions, setEvolutions] = useState<TreatmentEvolution[]>([]);
  const [photos, setPhotos] = useState<TreatmentPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [
        sett,
        cats,
        servs,
        profs,
        cls,
        apps,
        tpls,
        anaTpls,
        anaRecs,
        prds,
        evos,
        phtos
      ] = await Promise.all([
        DataService.getSettings(),
        DataService.getCategories(),
        DataService.getServices(),
        DataService.getProfessionals(),
        DataService.getClients(),
        DataService.getAppointments(),
        DataService.getTemplates(),
        DataService.getAnamnesisTemplates(),
        DataService.getAnamnesisRecords(),
        DataService.getProducts(),
        DataService.getEvolutions(),
        DataService.getPhotos(),
      ]);

      setSettings(sett);
      setCategories(cats);
      setServices(servs);
      setProfessionals(profs);
      setClients(cls);
      setAppointments(apps);
      setTemplates(tpls);
      setAnamnesisTemplates(anaTpls);
      setAnamnesisRecords(anaRecs);
      setProducts(prds);
      setEvolutions(evos);
      setPhotos(phtos);
    } catch (err) {
      console.error('Error loading business data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Settings & Category
  const handleSaveSettings = async (newSettings: BusinessSettings) => {
    const res = await DataService.saveSettings(newSettings);
    setSettings(res);
  };

  const handleSaveCategory = async (cat: ServiceCategory) => {
    const res = await DataService.saveCategory(cat);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  // Services
  const handleSaveService = async (service: Service) => {
    const res = await DataService.saveService(service);
    setServices(prev => {
      const idx = prev.findIndex(s => s.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleDeleteService = async (id: string) => {
    await DataService.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Professionals
  const handleSaveProfessional = async (prof: Professional) => {
    const res = await DataService.saveProfessional(prof);
    setProfessionals(prev => {
      const idx = prev.findIndex(p => p.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleDeleteProfessional = async (id: string) => {
    await DataService.deleteProfessional(id);
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  // Clients
  const handleSaveClient = async (client: Client) => {
    const res = await DataService.saveClient(client);
    setClients(prev => {
      const idx = prev.findIndex(c => c.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeleteClient = async (id: string) => {
    await DataService.deleteClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Appointments
  const handleSaveAppointment = async (app: Appointment) => {
    const enriched: Appointment = {
      ...app,
      client: clients.find(c => c.id === app.client_id) || app.client,
      professional: professionals.find(p => p.id === app.professional_id) || app.professional,
      service: services.find(s => s.id === app.service_id) || app.service,
    };

    const res = await DataService.saveAppointment(enriched);
    setAppointments(prev => {
      const idx = prev.findIndex(a => a.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = enriched;
        return copy;
      }
      return [...prev, enriched];
    });
  };

  const handleDeleteAppointment = async (id: string) => {
    await DataService.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Templates
  const handleSaveTemplate = async (tpl: NotificationTemplate) => {
    const res = await DataService.saveTemplate(tpl);
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  // Anamnesis Templates
  const handleSaveAnamnesisTemplate = async (tpl: AnamnesisTemplate) => {
    const res = await DataService.saveAnamnesisTemplate(tpl);
    setAnamnesisTemplates(prev => {
      const idx = prev.findIndex(t => t.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleDeleteAnamnesisTemplate = async (id: string) => {
    await DataService.deleteAnamnesisTemplate(id);
    setAnamnesisTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Anamnesis Records
  const handleSaveAnamnesisRecord = async (rec: AnamnesisRecord) => {
    const res = await DataService.saveAnamnesisRecord(rec);
    setAnamnesisRecords(prev => {
      const idx = prev.findIndex(r => r.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeleteAnamnesisRecord = async (id: string) => {
    await DataService.deleteAnamnesisRecord(id);
    setAnamnesisRecords(prev => prev.filter(r => r.id !== id));
  };

  // Products
  const handleSaveProduct = async (prod: Product) => {
    const res = await DataService.saveProduct(prod);
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleDeleteProduct = async (id: string) => {
    await DataService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Evolutions
  const handleSaveEvolution = async (evo: TreatmentEvolution) => {
    const res = await DataService.saveEvolution(evo);
    setEvolutions(prev => {
      const idx = prev.findIndex(e => e.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeleteEvolution = async (id: string) => {
    await DataService.deleteEvolution(id);
    setEvolutions(prev => prev.filter(e => e.id !== id));
  };

  // Photos
  const handleSavePhoto = async (photo: TreatmentPhoto) => {
    const res = await DataService.savePhoto(photo);
    setPhotos(prev => {
      const idx = prev.findIndex(p => p.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeletePhoto = async (id: string) => {
    await DataService.deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Metrics calculation
  const metrics: DashboardMetrics = useMemo(() => {
    const today = new Date();
    const todayApps = appointments.filter(a => isSameDay(parseISO(a.start_time), today) && a.status !== 'cancelled');
    
    const todayRevenue = todayApps
      .filter(a => a.payment_status === 'paid' || a.status === 'completed')
      .reduce((sum, a) => sum + (a.final_price || 0), 0);

    const todayPendingAmount = todayApps
      .filter(a => a.payment_status === 'pending' && a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.final_price || 0), 0);

    const monthApps = appointments.filter(a => isThisMonth(parseISO(a.start_time)) && a.status !== 'cancelled');
    const monthRevenue = monthApps.reduce((sum, a) => sum + (a.final_price || 0), 0);

    const activeClientsCount = clients.filter(c => c.active).length;
    const newClientsThisMonth = clients.filter(c => isThisMonth(parseISO(c.created_at))).length;

    const completedApps = appointments.filter(a => a.status === 'completed');
    const averageTicket = completedApps.length > 0
      ? completedApps.reduce((sum, a) => sum + a.final_price, 0) / completedApps.length
      : 180;

    const noShowApps = appointments.filter(a => a.status === 'no_show').length;
    const noShowRate = appointments.length > 0 ? (noShowApps / appointments.length) * 100 : 0;

    const inactiveCutoff = settings?.inactive_client_days || 60;
    const inactiveClientsCount = clients.filter(c => {
      if (!c.last_appointment_date) return true;
      return differenceInDays(today, parseISO(c.last_appointment_date)) >= inactiveCutoff;
    }).length;

    // Count clients without anamnesis records
    const clientsWithAnamnesis = new Set(anamnesisRecords.map(r => r.client_id));
    const pendingAnamnesisCount = clients.filter(c => !clientsWithAnamnesis.has(c.id)).length;

    return {
      todayAppointmentsCount: todayApps.length,
      todayRevenue,
      todayPendingAmount,
      monthRevenue,
      activeClientsCount,
      newClientsThisMonth,
      averageTicket,
      noShowRate,
      pendingAnamnesisCount,
      upcomingBirthdaysCount: 3,
      inactiveClientsCount,
    };
  }, [appointments, clients, settings, anamnesisRecords]);

  return (
    <BusinessContext.Provider
      value={{
        settings,
        categories,
        services,
        professionals,
        clients,
        appointments,
        templates,
        anamnesisTemplates,
        anamnesisRecords,
        products,
        evolutions,
        photos,
        metrics,
        loading,
        refreshData: loadAll,
        saveSettings: handleSaveSettings,
        saveCategory: handleSaveCategory,
        saveService: handleSaveService,
        deleteService: handleDeleteService,
        saveProfessional: handleSaveProfessional,
        deleteProfessional: handleDeleteProfessional,
        saveClient: handleSaveClient,
        deleteClient: handleDeleteClient,
        saveAppointment: handleSaveAppointment,
        deleteAppointment: handleDeleteAppointment,
        saveTemplate: handleSaveTemplate,
        saveAnamnesisTemplate: handleSaveAnamnesisTemplate,
        deleteAnamnesisTemplate: handleDeleteAnamnesisTemplate,
        saveAnamnesisRecord: handleSaveAnamnesisRecord,
        deleteAnamnesisRecord: handleDeleteAnamnesisRecord,
        saveProduct: handleSaveProduct,
        deleteProduct: handleDeleteProduct,
        saveEvolution: handleSaveEvolution,
        deleteEvolution: handleDeleteEvolution,
        savePhoto: handleSavePhoto,
        deletePhoto: handleDeletePhoto,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
