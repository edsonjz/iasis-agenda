import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Client } from '@/types';
import { formatPhone } from '@/lib/utils';
import { Search, User, X, Plus, Check, Phone, Tag } from 'lucide-react';

interface ClientSearchComboboxProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (client: Client | null) => void;
  onOpenQuickCreate?: (initialName?: string) => void;
  required?: boolean;
}

export const ClientSearchCombobox: React.FC<ClientSearchComboboxProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenQuickCreate,
  required = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Filter clients based on query (name, nickname, phone, email)
  const filteredClients = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return clients.slice(0, 15); // Show first 15 by default

    const cleanQueryDigits = q.replace(/\D/g, '');

    return clients.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const nicknameMatch = c.nickname && c.nickname.toLowerCase().includes(q);
      const emailMatch = c.email && c.email.toLowerCase().includes(q);
      const phoneDigits = (c.whatsapp || c.phone || '').replace(/\D/g, '');
      const phoneMatch = cleanQueryDigits ? phoneDigits.includes(cleanQueryDigits) : false;

      return nameMatch || nicknameMatch || emailMatch || phoneMatch;
    }).slice(0, 20);
  }, [clients, query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectClient(null);
    setQuery('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredClients.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredClients.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredClients[highlightedIndex]) {
        handleSelect(filteredClients[highlightedIndex]);
      } else if (onOpenQuickCreate && query.trim()) {
        onOpenQuickCreate(query.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* If a client is selected, show selected card with switch/clear button */}
      {selectedClient && !isOpen ? (
        <div className="flex items-center justify-between p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
              {selectedClient.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {selectedClient.name}
                </span>
                {selectedClient.nickname && (
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium shrink-0">
                    ({selectedClient.nickname})
                  </span>
                )}
                {selectedClient.tags?.includes('VIP') && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded shrink-0">
                    VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                <Phone className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{formatPhone(selectedClient.whatsapp || selectedClient.phone || '')}</span>
                {selectedClient.city && <span>• {selectedClient.city}</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors ml-2 shrink-0"
            title="Trocar cliente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Search input field */
        <div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite o nome ou WhatsApp da cliente..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              required={required && !selectedClientId}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in zoom-in-95 duration-100">
              {filteredClients.length > 0 ? (
                filteredClients.map((c, index) => {
                  const isSelected = c.id === selectedClientId;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-rose-50 dark:bg-rose-950/40'
                          : isSelected
                          ? 'bg-slate-50 dark:bg-slate-850'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {c.name}
                            </span>
                            {c.nickname && (
                              <span className="text-xs text-slate-400">({c.nickname})</span>
                            )}
                            {c.tags?.map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {formatPhone(c.whatsapp || c.phone || '')}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })
              ) : (
                /* No client found with this name/phone */
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Nenhuma cliente encontrada com <strong className="text-slate-700 dark:text-slate-300">"{query}"</strong>
                  </p>
                  {onOpenQuickCreate && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenQuickCreate(query.trim());
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Cadastrar "{query.trim()}" agora
                    </button>
                  )}
                </div>
              )}

              {/* Footer Quick Action */}
              {onOpenQuickCreate && filteredClients.length > 0 && (
                <div
                  onClick={() => {
                    onOpenQuickCreate(query.trim());
                    setIsOpen(false);
                  }}
                  className="p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border-t border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Cadastrar nova cliente
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
