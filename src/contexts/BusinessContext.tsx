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
  FinancialTransaction,
  CashRegister,
  CashMovement,
  Package,
  ClientPackage,
  Promotion,
  LoyaltyAccount,
  CommissionRecord,
  PaymentMethod,
  CRMConfig,
  ClientFollowUp,
  ClientRecoveryLog,
} from '@/types';
import { DataService, DEMO_IDS } from '@/lib/storage';
import { defaultCRMConfig, calculateClientMetrics } from '@/lib/crmEngine';
import { isSameDay, parseISO, isThisMonth, differenceInDays, format } from 'date-fns';
import { generateUUID } from '@/lib/utils';

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
  transactions: FinancialTransaction[];
  cashRegisters: CashRegister[];
  cashMovements: CashMovement[];
  packages: Package[];
  clientPackages: ClientPackage[];
  promotions: Promotion[];
  loyaltyAccounts: LoyaltyAccount[];
  commissions: CommissionRecord[];
  crmConfig: CRMConfig;
  followUps: ClientFollowUp[];
  recoveryLogs: ClientRecoveryLog[];
  metrics: DashboardMetrics;
  loading: boolean;
  refreshData: () => Promise<void>;
  purgeDemoData: () => Promise<void>;
  
  // Core Mutations & Deletions
  saveSettings: (settings: BusinessSettings) => Promise<void>;
  saveCategory: (cat: ServiceCategory) => Promise<void>;
  saveService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveProfessional: (prof: Professional) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  saveClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  importClientsBatch: (clientsToSave: Partial<Client>[], updateDuplicates?: boolean) => Promise<{ created: number; updated: number }>;
  saveAppointment: (app: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  saveTemplate: (tpl: NotificationTemplate) => Promise<void>;
  
  // Anamnesis & Procedures
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

  // Financial & Cash Register
  saveTransaction: (tr: FinancialTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  openCashRegister: (initialAmount: number, openedByName: string, notes?: string) => Promise<CashRegister>;
  closeCashRegister: (id: string, reportedAmount: number, closedByName: string, notes?: string) => Promise<void>;
  addCashMovement: (type: 'income' | 'expense' | 'sangria' | 'reforco', amount: number, description: string, paymentMethod: PaymentMethod) => Promise<void>;

  // Packages
  savePackage: (pkg: Package) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  saveClientPackage: (cpkg: ClientPackage) => Promise<void>;
  deleteClientPackage: (id: string) => Promise<void>;
  usePackageSession: (clientPackageId: string, appointmentId?: string) => Promise<void>;

  // Promotions
  savePromotion: (promo: Promotion) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;

  // Loyalty
  saveLoyaltyAccount: (acc: LoyaltyAccount) => Promise<void>;
  addLoyaltyPoints: (clientId: string, clientName: string, points: number, cashback: number, description: string) => Promise<void>;
  redeemLoyaltyPoints: (clientId: string, pointsToRedeem: number, cashbackToRedeem: number, description: string) => Promise<void>;

  // Commissions
  saveCommission: (com: CommissionRecord) => Promise<void>;
  payCommission: (id: string) => Promise<void>;

  // CRM & Follow-ups
  saveCRMConfig: (cfg: CRMConfig) => Promise<void>;
  saveFollowUp: (flw: ClientFollowUp) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;
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
  
  // Financial, Packages, Loyalty
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);

  // CRM & Follow-ups
  const [crmConfig, setCRMConfig] = useState<CRMConfig>(defaultCRMConfig);
  const [followUps, setFollowUps] = useState<ClientFollowUp[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<ClientRecoveryLog[]>([]);

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
        phtos,
        trs,
        crs,
        cms,
        pkgs,
        cpkgs,
        prms,
        loys,
        comms,
        crmCfg,
        flws,
        recLogs,
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
        DataService.getTransactions(),
        DataService.getCashRegisters(),
        DataService.getCashMovements(),
        DataService.getPackages(),
        DataService.getClientPackages(),
        DataService.getPromotions(),
        DataService.getLoyaltyAccounts(),
        DataService.getCommissions(),
        DataService.getCRMConfig(),
        DataService.getFollowUps(),
        DataService.getRecoveryLogs(),
      ]);

      // Automatically purge any remaining demo records in Supabase and cache
      await DataService.purgeDemoData();

      // Ensure Jaque Souza exists as the active professional
      let finalProfs = profs.filter(p => !DEMO_IDS.PROFESSIONALS.includes(p.id) && !DEMO_IDS.PROFESSIONAL_NAMES.includes(p.name));
      const hasJaque = finalProfs.some(p => p.name.toLowerCase().includes('jaque'));
      if (!hasJaque) {
        const jaqueProf: Professional = {
          id: 'a0000000-0000-0000-0000-000000000002',
          name: 'Jaque Souza',
          nickname: 'Jaque',
          email: 'studiojaquesouza@gmail.com',
          phone: '(11) 98765-4321',
          color: '#bf3f57',
          specialties: ['Estética Avançada', 'Micropigmentação', 'Extensão de Cílios', 'Tratamentos Faciais'],
          commission_type: 'percentage',
          default_commission_rate: 100,
          active: true,
        };
        await DataService.saveProfessional(jaqueProf);
        finalProfs = [jaqueProf, ...finalProfs];
      }

      setSettings(sett);
      setCategories(cats);
      setServices(servs);
      setProfessionals(finalProfs);
      setClients(cls);
      setAppointments(apps);
      setTemplates(tpls);
      setAnamnesisTemplates(anaTpls);
      setAnamnesisRecords(anaRecs);
      setProducts(prds);
      setEvolutions(evos);
      setPhotos(phtos);
      setTransactions(trs);
      setCashRegisters(crs);
      setCashMovements(cms);
      setPackages(pkgs);
      setClientPackages(cpkgs);
      setPromotions(prms);
      setLoyaltyAccounts(loys);
      setCommissions(comms);
      setCRMConfig(crmCfg || defaultCRMConfig);
      setFollowUps(flws);
      setRecoveryLogs(recLogs);
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

  const handleImportClientsBatch = async (clientsToSave: Partial<Client>[], updateDuplicates: boolean = true) => {
    const res = await DataService.saveBatchClients(clientsToSave, updateDuplicates);
    setClients(res.savedClients);
    return { created: res.created, updated: res.updated };
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

    // Auto-generate commission if appointment completed
    if (app.status === 'completed' && app.final_price > 0 && app.professional_id) {
      const prof = professionals.find(p => p.id === app.professional_id);
      const rate = prof?.default_commission_rate || 40;
      const commissionAmount = (app.final_price * rate) / 100;

      const commRecord: CommissionRecord = {
        id: generateUUID(),
        professional_id: app.professional_id,
        professional_name: prof?.name || 'Profissional',
        appointment_id: app.id,
        client_name: enriched.client?.name || 'Cliente',
        service_name: enriched.service?.name || 'Procedimento',
        appointment_date: app.start_time.split('T')[0],
        gross_amount: app.final_price,
        commission_rate: rate,
        commission_amount: commissionAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      await handleSaveCommission(commRecord);

      // Check if client was previously inactive (> crmConfig.inactive_days) to record recovery log
      if (enriched.client?.last_appointment_date) {
        const daysGap = differenceInDays(parseISO(app.start_time), parseISO(enriched.client.last_appointment_date));
        if (daysGap >= crmConfig.inactive_days) {
          const recovery: ClientRecoveryLog = {
            id: generateUUID(),
            client_id: enriched.client.id,
            recovered_at: new Date().toISOString(),
            inactive_days_count: daysGap,
            previous_status: daysGap >= crmConfig.abandoned_days ? 'abandonou' : 'inativa',
            procedure_name: enriched.service?.name || 'Procedimento',
            amount: app.final_price,
            professional_name: prof?.name || 'Profissional',
            created_at: new Date().toISOString(),
          };
          const savedLog = await DataService.saveRecoveryLog(recovery);
          setRecoveryLogs(prev => [savedLog, ...prev]);
        }
      }
    }
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

  // Anamnesis
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

  // Financial Transactions
  const handleSaveTransaction = async (tr: FinancialTransaction) => {
    const res = await DataService.saveTransaction(tr);
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    await DataService.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Cash Register
  const handleOpenCashRegister = async (initialAmount: number, openedByName: string, notes?: string): Promise<CashRegister> => {
    const newRegister: CashRegister = {
      id: generateUUID(),
      opened_at: new Date().toISOString(),
      opened_by_name: openedByName,
      initial_amount: initialAmount,
      status: 'open',
      notes,
    };
    const res = await DataService.saveCashRegister(newRegister);
    setCashRegisters(prev => [res, ...prev]);
    return res;
  };

  const handleCloseCashRegister = async (id: string, reportedAmount: number, closedByName: string, notes?: string) => {
    const reg = cashRegisters.find(c => c.id === id);
    if (!reg) return;

    const movements = cashMovements.filter(m => m.cash_register_id === id);
    const cashIn = movements
      .filter(m => (m.type === 'income' || m.type === 'reforco') && m.payment_method === 'cash')
      .reduce((sum, m) => sum + m.amount, 0);
    const cashOut = movements
      .filter(m => (m.type === 'expense' || m.type === 'sangria') && m.payment_method === 'cash')
      .reduce((sum, m) => sum + m.amount, 0);

    const expected = reg.initial_amount + cashIn - cashOut;
    const diff = reportedAmount - expected;

    const closed: CashRegister = {
      ...reg,
      closed_at: new Date().toISOString(),
      closed_by_name: closedByName,
      closing_expected_amount: expected,
      closing_reported_amount: reportedAmount,
      difference_amount: diff,
      status: 'closed',
      notes: notes || reg.notes,
    };

    await DataService.saveCashRegister(closed);
    setCashRegisters(prev => prev.map(c => (c.id === id ? closed : c)));
  };

  const handleAddCashMovement = async (
    type: 'income' | 'expense' | 'sangria' | 'reforco',
    amount: number,
    description: string,
    paymentMethod: PaymentMethod
  ) => {
    const currentOpen = cashRegisters.find(c => c.status === 'open');
    const move: CashMovement = {
      id: generateUUID(),
      cash_register_id: currentOpen?.id || 'cr-default',
      type,
      amount,
      description,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
    };
    const res = await DataService.saveCashMovement(move);
    setCashMovements(prev => [res, ...prev]);
  };

  // Packages
  const handleSavePackage = async (pkg: Package) => {
    const res = await DataService.savePackage(pkg);
    setPackages(prev => {
      const idx = prev.findIndex(p => p.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleDeletePackage = async (id: string) => {
    await DataService.deletePackage(id);
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveClientPackage = async (cpkg: ClientPackage) => {
    const res = await DataService.saveClientPackage(cpkg);
    setClientPackages(prev => {
      const idx = prev.findIndex(c => c.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeleteClientPackage = async (id: string) => {
    await DataService.deleteClientPackage(id);
    setClientPackages(prev => prev.filter(c => c.id !== id));
  };

  const handleUsePackageSession = async (clientPackageId: string, appointmentId?: string) => {
    const cpkg = clientPackages.find(c => c.id === clientPackageId);
    if (!cpkg || cpkg.used_sessions >= cpkg.total_sessions) return;

    const newUsed = cpkg.used_sessions + 1;
    const isCompleted = newUsed >= cpkg.total_sessions;

    const updated: ClientPackage = {
      ...cpkg,
      used_sessions: newUsed,
      status: isCompleted ? 'completed' : 'active',
    };

    await DataService.saveClientPackage(updated);
    setClientPackages(prev => prev.map(c => (c.id === clientPackageId ? updated : c)));
  };

  // Promotions
  const handleSavePromotion = async (promo: Promotion) => {
    const res = await DataService.savePromotion(promo);
    setPromotions(prev => {
      const idx = prev.findIndex(p => p.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleDeletePromotion = async (id: string) => {
    await DataService.deletePromotion(id);
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  // Loyalty
  const handleSaveLoyaltyAccount = async (acc: LoyaltyAccount) => {
    const res = await DataService.saveLoyaltyAccount(acc);
    setLoyaltyAccounts(prev => {
      const idx = prev.findIndex(a => a.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [...prev, res];
    });
  };

  const handleAddLoyaltyPoints = async (
    clientId: string,
    clientName: string,
    points: number,
    cashback: number,
    description: string
  ) => {
    let acc = loyaltyAccounts.find(a => a.client_id === clientId);
    if (!acc) {
      acc = {
        id: `loy_${clientId}`,
        client_id: clientId,
        client_name: clientName,
        points_balance: 0,
        cashback_balance: 0,
        tier: 'Bronze',
        total_earned_points: 0,
        total_cashback_earned: 0,
        updated_at: new Date().toISOString(),
      };
    }

    const newPoints = acc.points_balance + points;
    const newCashback = acc.cashback_balance + cashback;
    const totalEarned = acc.total_earned_points + points;

    let tier: 'Bronze' | 'Prata' | 'Ouro' | 'VIP' = 'Bronze';
    if (totalEarned >= 1000) tier = 'VIP';
    else if (totalEarned >= 500) tier = 'Ouro';
    else if (totalEarned >= 200) tier = 'Prata';

    const updated: LoyaltyAccount = {
      ...acc,
      points_balance: newPoints,
      cashback_balance: newCashback,
      tier,
      total_earned_points: totalEarned,
      total_cashback_earned: acc.total_cashback_earned + cashback,
      updated_at: new Date().toISOString(),
    };

    await handleSaveLoyaltyAccount(updated);
  };

  const handleRedeemLoyaltyPoints = async (
    clientId: string,
    pointsToRedeem: number,
    cashbackToRedeem: number,
    description: string
  ) => {
    const acc = loyaltyAccounts.find(a => a.client_id === clientId);
    if (!acc) return;

    const updated: LoyaltyAccount = {
      ...acc,
      points_balance: Math.max(0, acc.points_balance - pointsToRedeem),
      cashback_balance: Math.max(0, acc.cashback_balance - cashbackToRedeem),
      updated_at: new Date().toISOString(),
    };

    await handleSaveLoyaltyAccount(updated);
  };

  // Commissions
  const handleSaveCommission = async (com: CommissionRecord) => {
    const res = await DataService.saveCommission(com);
    setCommissions(prev => {
      const idx = prev.findIndex(c => c.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handlePayCommission = async (id: string) => {
    const com = commissions.find(c => c.id === id);
    if (!com) return;
    const paid: CommissionRecord = {
      ...com,
      status: 'paid',
      paid_at: new Date().toISOString(),
    };
    await handleSaveCommission(paid);
  };

  // CRM & Follow-ups
  const handleSaveCRMConfig = async (cfg: CRMConfig) => {
    const res = await DataService.saveCRMConfig(cfg);
    setCRMConfig(res);
  };

  const handleSaveFollowUp = async (flw: ClientFollowUp) => {
    const res = await DataService.saveFollowUp(flw);
    setFollowUps(prev => {
      const idx = prev.findIndex(f => f.id === res.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res;
        return copy;
      }
      return [res, ...prev];
    });
  };

  const handleDeleteFollowUp = async (id: string) => {
    await DataService.deleteFollowUp(id);
    setFollowUps(prev => prev.filter(f => f.id !== id));
  };

  // Metrics calculation with CRM Intelligence
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

    const inactiveCutoff = crmConfig?.inactive_days || 90;
    const inactiveClientsCount = clients.filter(c => {
      if (!c.last_appointment_date) return true;
      return differenceInDays(today, parseISO(c.last_appointment_date)) >= inactiveCutoff;
    }).length;

    const clientsWithAnamnesis = new Set(anamnesisRecords.map(r => r.client_id));
    const pendingAnamnesisCount = clients.filter(c => !clientsWithAnamnesis.has(c.id)).length;

    // Count clients in risk
    const riskClientsCount = clients.filter(c => {
      const m = calculateClientMetrics(c, appointments, crmConfig, recoveryLogs);
      return m.category === 'em_risco';
    }).length;

    // Follow-ups scheduled for today
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayFollowUpsCount = followUps.filter(f => f.recommended_date === todayStr && f.status === 'pending').length;

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
      riskClientsCount,
      todayFollowUpsCount,
    };
  }, [appointments, clients, crmConfig, anamnesisRecords, followUps, recoveryLogs]);

  const handlePurgeDemoData = async () => {
    try {
      setLoading(true);
      await DataService.purgeDemoData();
      await loadAll();
    } catch (err) {
      console.error('Erro ao purgar dados demo:', err);
    } finally {
      setLoading(false);
    }
  };

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
        transactions,
        cashRegisters,
        cashMovements,
        packages,
        clientPackages,
        promotions,
        loyaltyAccounts,
        commissions,
        crmConfig,
        followUps,
        recoveryLogs,
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
        importClientsBatch: handleImportClientsBatch,
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
        saveTransaction: handleSaveTransaction,
        deleteTransaction: handleDeleteTransaction,
        openCashRegister: handleOpenCashRegister,
        closeCashRegister: handleCloseCashRegister,
        addCashMovement: handleAddCashMovement,
        savePackage: handleSavePackage,
        deletePackage: handleDeletePackage,
        saveClientPackage: handleSaveClientPackage,
        deleteClientPackage: handleDeleteClientPackage,
        usePackageSession: handleUsePackageSession,
        savePromotion: handleSavePromotion,
        deletePromotion: handleDeletePromotion,
        saveLoyaltyAccount: handleSaveLoyaltyAccount,
        addLoyaltyPoints: handleAddLoyaltyPoints,
        redeemLoyaltyPoints: handleRedeemLoyaltyPoints,
        saveCommission: handleSaveCommission,
        payCommission: handlePayCommission,
        saveCRMConfig: handleSaveCRMConfig,
        saveFollowUp: handleSaveFollowUp,
        deleteFollowUp: handleDeleteFollowUp,
        purgeDemoData: handlePurgeDemoData,
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
