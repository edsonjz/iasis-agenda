import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { PackageModal } from '@/components/packages/PackageModal';
import { SellPackageModal } from '@/components/packages/SellPackageModal';
import { formatCurrency } from '@/lib/utils';
import { formatDateBR } from '@/lib/dateUtils';
import { Package, ClientPackage } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import {
  Layers,
  Plus,
  Edit,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Trash2,
  User
} from 'lucide-react';

export const Pacotes: React.FC = () => {
  const { packages, clientPackages, usePackageSession, deleteClientPackage } = useBusiness();
  const { success } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'client_packages' | 'catalog'>('client_packages');

  const handleDeductSession = async (cpkg: ClientPackage) => {
    if (cpkg.used_sessions >= cpkg.total_sessions) return;
    if (confirm(`Confirmar realização e baixa de 1 sessão do pacote "${cpkg.package_name}" para ${cpkg.client_name}?`)) {
      await usePackageSession(cpkg.id);
      success('Sessão debitada do pacote com sucesso!');
    }
  };

  const handleDeleteClientPkg = async (id: string) => {
    if (confirm('Deseja excluir este pacote da cliente?')) {
      await deleteClientPackage(id);
      success('Pacote da cliente excluído');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-600" /> Pacotes de Procedimentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Planos de múltiplas sessões, controle de saldo e dedução de atendimentos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedPackage(null);
              setIsPackageModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Modelo de Pacote
          </Button>

          <Button
            size="sm"
            onClick={() => setIsSellModalOpen(true)}
            icon={<ShoppingCart className="w-4 h-4" />}
          >
            Vender Pacote para Cliente
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-4">
        <button
          onClick={() => setActiveTab('client_packages')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 ${
            activeTab === 'client_packages'
              ? 'text-rose-600 font-bold border-b-2 border-rose-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Pacotes Ativos de Clientes ({clientPackages.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-2.5 px-1 transition-colors flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'text-rose-600 font-bold border-b-2 border-rose-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Catálogo de Modelos ({packages.length})
        </button>
      </div>

      {/* ================= TAB 1: CLIENT PACKAGES IN USE ================= */}
      {activeTab === 'client_packages' && (
        <div className="space-y-4">
          {clientPackages.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              Nenhum pacote vendido em andamento no momento.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientPackages.map(cpkg => {
                const remaining = cpkg.total_sessions - cpkg.used_sessions;
                const percentage = Math.round((cpkg.used_sessions / cpkg.total_sessions) * 100);

                return (
                  <Card
                    key={cpkg.id}
                    className="p-5 flex flex-col justify-between space-y-4 border-slate-200 dark:border-slate-800"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-rose-600 block">
                            {cpkg.client_name}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {cpkg.package_name}
                          </h3>
                        </div>

                        <Badge
                          variant={cpkg.status === 'completed' ? 'default' : 'success'}
                          className="text-[10px]"
                        >
                          {cpkg.status === 'completed' ? 'Concluído' : 'Ativo'}
                        </Badge>
                      </div>

                      {/* Sessions Progress Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>
                            {cpkg.used_sessions} de {cpkg.total_sessions} sessões utilizadas
                          </span>
                          <span className="text-rose-600">{remaining} restante(s)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-3 space-y-0.5">
                        <div>Adquirido em: {formatDateBR(cpkg.purchased_at)}</div>
                        <div>Válido até: {formatDateBR(cpkg.expires_at)}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleDeleteClientPkg(cpkg.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Excluir pacote da cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {cpkg.status === 'active' && remaining > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleDeductSession(cpkg)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Dar Baixa em 1 Sessão
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Todas as sessões concluídas</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: CATALOG OF PACKAGES ================= */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <Card
              key={pkg.id}
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {pkg.name}
                    </h3>
                    {pkg.service_name && (
                      <span className="text-xs text-rose-600 font-semibold">{pkg.service_name}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setIsPackageModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {pkg.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {pkg.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sessões</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{pkg.total_sessions} sessões</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Validade</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{pkg.validity_days} dias</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Valor do Pacote</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(pkg.price)}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSellModalOpen(true)}
                  icon={<ShoppingCart className="w-3.5 h-3.5" />}
                >
                  Vender
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Package Modal */}
      <PackageModal
        isOpen={isPackageModalOpen}
        onClose={() => {
          setIsPackageModalOpen(false);
          setSelectedPackage(null);
        }}
        pkg={selectedPackage}
      />

      {/* Sell Modal */}
      <SellPackageModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
      />
    </div>
  );
};
