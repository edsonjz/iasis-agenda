import React from 'react';
import { NavLink } from 'react-router-dom';
import { Modal } from '../common/Modal';
import {
  UserCheck,
  Sparkles,
  MessageSquare,
  Settings,
  LogOut,
  FileText,
  Package,
  DollarSign,
  Wallet,
  Percent,
  Layers,
  Tag,
  Award,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const { logout, profile } = useAuth();

  const links = [
    { name: 'Fichas de Anamnese', to: '/anamnese', icon: FileText },
    { name: 'Pacotes de Procedimentos', to: '/pacotes', icon: Layers },
    { name: 'Gestão Financeira', to: '/financeiro', icon: DollarSign },
    { name: 'Caixa da Recepção', to: '/caixa', icon: Wallet },
    { name: 'Comissões da Equipe', to: '/comissoes', icon: Percent },
    { name: 'Promoções & Cupons', to: '/promocoes', icon: Tag },
    { name: 'Fidelidade & Cashback', to: '/fidelizacao', icon: Award },
    { name: 'Produtos & Estoque', to: '/produtos', icon: Package },
    { name: 'Profissionais & Equipe', to: '/profissionais', icon: UserCheck },
    { name: 'Serviços & Procedimentos', to: '/servicos', icon: Sparkles },
    { name: 'Lembretes WhatsApp', to: '/lembretes', icon: MessageSquare },
    { name: 'Relatórios DRE & Indicadores', to: '/relatorios', icon: BarChart3 },
    { name: 'Configurações da Estética', to: '/configuracoes', icon: Settings },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm">
            {profile?.display_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{profile?.display_name || profile?.full_name}</div>
            <div className="text-xs text-slate-500">{profile?.role === 'admin' ? 'Administradora' : 'Profissional'}</div>
          </div>
        </div>

        <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
