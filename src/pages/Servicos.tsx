import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ServiceModal } from '@/components/services/ServiceModal';
import { formatCurrency } from '@/lib/utils';
import { Service } from '@/types';
import {
  Sparkles,
  Plus,
  Clock,
  DollarSign,
  Edit,
  Tag,
  FileCheck2
} from 'lucide-react';

export const Servicos: React.FC = () => {
  const { services, categories } = useBusiness();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category_id === selectedCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-600" /> Serviços & Procedimentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre os procedimentos estéticos, valores, durações e requisitos de anamnese
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedService(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Procedimento
        </Button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Todos ({services.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map(srv => {
          const category = categories.find(c => c.id === srv.category_id);

          return (
            <Card
              key={srv.id}
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {category && (
                      <Badge variant="primary" className="text-[10px] mb-1.5">
                        {category.name}
                      </Badge>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {srv.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedService(srv);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {srv.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {srv.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{srv.duration_minutes} min</span>
                  </div>
                  {srv.requires_anamnesis && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Exige Anamnese</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Price */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  {srv.price <= 0 || !srv.price ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-lg">
                        Valor a definir
                      </span>
                      <span className="text-[10px] text-slate-400">Pós-atendimento</span>
                    </div>
                  ) : srv.promotional_price ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-rose-600">
                        {formatCurrency(srv.promotional_price)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(srv.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(srv.price)}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Buffer: {srv.buffer_minutes || 0} min
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />
    </div>
  );
};
