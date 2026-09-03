import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  BusinessSettings,
  ServiceCategory,
  Service,
  Professional,
  Client,
  Appointment,
  NotificationTemplate,
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
  metrics: DashboardMetrics;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Mutations
  saveSettings: (settings: BusinessSettings) => Promise<void>;
  saveCategory: (cat: ServiceCategory) => Promise<void>;
  saveService: (service: Service) => Promise<void>;
  saveProfessional: (prof: Professional) => Promise<void>;
  saveClient: (client: Client) => Promise<void>;
  saveAppointment: (app: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  saveTemplate: (tpl: NotificationTemplate) => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [sett, cats, servs, profs, cls, apps, tpls] = await Promise.all([
        DataService.getSettings(),
        DataService.getCategories(),
        DataService.getServices(),
        DataService.getProfessionals(),
        DataService.getClients(),
        DataService.getAppointments(),
        DataService.getTemplates(),
      ]);

      setSettings(sett);
      setCategories(cats);
      setServices(servs);
      setProfessionals(profs);
      setClients(cls);
      setAppointments(apps);
      setTemplates(tpls);
    } catch (err) {
      console.error('Error loading business data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Mutations
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

  const handleSaveAppointment = async (app: Appointment) => {
    // Populate client/professional/service relations locally if needed
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

    // Update client stats if appointment is completed
    if (app.status === 'completed' && app.client_id) {
      const targetClient = clients.find(c => c.id === app.client_id);
      if (targetClient) {
        const updatedCl: Client = {
          ...targetClient,
          total_appointments: (targetClient.total_appointments || 0) + 1,
          total_spent: (targetClient.total_spent || 0) + (app.final_price || 0),
          last_appointment_date: app.start_time.split('T')[0],
        };
        handleSaveClient(updatedCl);
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    await DataService.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

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

    return {
      todayAppointmentsCount: todayApps.length,
      todayRevenue,
      todayPendingAmount,
      monthRevenue,
      activeClientsCount,
      newClientsThisMonth,
      averageTicket,
      noShowRate,
      pendingAnamnesisCount: 2, // Fichas pendentes
      upcomingBirthdaysCount: 3,
      inactiveClientsCount,
    };
  }, [appointments, clients, settings]);

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
        metrics,
        loading,
        refreshData: loadAll,
        saveSettings: handleSaveSettings,
        saveCategory: handleSaveCategory,
        saveService: handleSaveService,
        saveProfessional: handleSaveProfessional,
        saveClient: handleSaveClient,
        saveAppointment: handleSaveAppointment,
        deleteAppointment: handleDeleteAppointment,
        saveTemplate: handleSaveTemplate,
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
