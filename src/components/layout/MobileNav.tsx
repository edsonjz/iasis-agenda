import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, MessageSquare, Plus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onNewAppointment: () => void;
  onOpenMore: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onNewAppointment, onOpenMore }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors',
              isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </NavLink>

        <NavLink
          to="/agenda"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors',
              isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Agenda</span>
        </NavLink>

        {/* Central Prominent FAB */}
        <button
          onClick={onNewAppointment}
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 active:scale-95 transition-transform"
          aria-label="Novo Agendamento"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors',
              isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Clientes</span>
        </NavLink>

        <button
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </div>
    </div>
  );
};
