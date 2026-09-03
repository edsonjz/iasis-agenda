import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, Sun, Moon, Bell, Plus, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface HeaderProps {
  onOpenSearch: () => void;
  onNewAppointment: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onNewAppointment }) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      {/* Left: Mobile Title or Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Buscar clientes, serviços...</span>
          <span className="sm:hidden">Buscar...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Appointment Button */}
        <Button
          size="sm"
          onClick={onNewAppointment}
          className="hidden sm:flex"
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Agendamento
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-rose-500/30">
            {profile?.display_name?.charAt(0) || profile?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {profile?.display_name || profile?.full_name || 'Usuária'}
            </div>
            <div className="text-[10px] text-slate-400 capitalize">
              {profile?.role === 'admin' ? 'Administradora' : 'Profissional'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
