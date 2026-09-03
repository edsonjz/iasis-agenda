import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Sparkles,
  FileText,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  CalendarCheck2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Agenda', to: '/agenda', icon: Calendar },
  { name: 'Clientes', to: '/clientes', icon: Users },
  { name: 'Profissionais', to: '/profissionais', icon: UserCheck },
  { name: 'Serviços', to: '/servicos', icon: Sparkles },
  { name: 'Fichas de Anamnese', to: '/anamnese', icon: FileText },
  { name: 'Produtos & Estoque', to: '/produtos', icon: Package },
  { name: 'Lembretes', to: '/lembretes', icon: MessageSquare },
  { name: 'Configurações', to: '/configuracoes', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200/80 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            IASIS <span className="text-rose-600">AGENDA</span>
          </h1>
          <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
            Gestão Estética
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};
