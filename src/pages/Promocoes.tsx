import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { PromotionModal } from '@/components/promotions/PromotionModal';
import { formatDateBR } from '@/lib/dateUtils';
import { Promotion } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import {
  Tag,
  Plus,
  Edit,
  Copy,
  Calendar,
  Percent,
  Sparkles,
  Trash2
} from 'lucide-react';

export const Promocoes: React.FC = () => {
  const { promotions, deletePromotion } = useBusiness();
  const { success } = useToast();

  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success(`Cupom ${code} copiado para a área de transferência!`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta promoção?')) {
      await deletePromotion(id);
      success('Promoção excluída');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-6 h-6 text-rose-600" /> Promoções & Cupons de Desconto
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Crie campanhas sazonais, cupons de primeira visita e descontos especiais
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedPromotion(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Nova Promoção
        </Button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map(promo => (
          <Card
            key={promo.id}
            className="p-5 flex flex-col justify-between space-y-4 border-slate-200 dark:border-slate-800"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="primary" className="text-[10px] mb-2">
                    {promo.discount_type === 'percentage'
                      ? `${promo.discount_value}% OFF`
                      : `R$ ${promo.discount_value.toFixed(2)} OFF`}
                  </Badge>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {promo.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedPromotion(promo);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Coupon Code Block */}
              {promo.code && (
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-rose-500 block">Cupom</span>
                    <span className="font-mono font-extrabold text-rose-700 dark:text-rose-300 text-xs">
                      {promo.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(promo.code!)}
                    className="text-xs text-rose-600 hover:text-rose-700 p-1 flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </button>
                </div>
              )}

              <div className="text-[11px] text-slate-400 mt-3 space-y-1">
                <div>Vigência: {formatDateBR(promo.start_date)} até {formatDateBR(promo.end_date)}</div>
                <div>Utilizações registradas: {promo.usage_count} vezes</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Badge variant="success" className="text-[10px]">
                Campanha Ativa
              </Badge>
              <span className="text-[10px] text-slate-400">Aplicável no agendamento</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPromotion(null);
        }}
        promotion={selectedPromotion}
      />
    </div>
  );
};
