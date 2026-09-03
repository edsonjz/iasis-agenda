import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProfessionalModal } from '@/components/professionals/ProfessionalModal';
import { formatPhone } from '@/lib/utils';
import { Professional } from '@/types';
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  Percent,
  Edit,
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react';

export const Profissionais: React.FC = () => {
  const { professionals, appointments } = useBusiness();
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-rose-600" /> Equipe & Profissionais
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre especialistas, horários de atendimento semanais e taxas de comissão
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedProf(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Nova Profissional
        </Button>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {professionals.map(prof => {
          const profAppointmentsCount = appointments.filter(a => a.professional_id === prof.id).length;

          return (
            <Card
              key={prof.id}
              className="p-5 flex flex-col justify-between space-y-4 border-t-4"
              style={{ borderTopColor: prof.color }}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-extrabold text-base shadow-sm"
                      style={{ backgroundColor: prof.color }}
                    >
                      {prof.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {prof.name}
                      </h3>
                      {prof.nickname && (
                        <div className="text-xs text-slate-400 font-medium">"{prof.nickname}"</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProf(prof);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {prof.specialties.map(spec => (
                    <Badge key={spec} variant="default" className="text-[10px]">
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Contact info */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {prof.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatPhone(prof.phone)}</span>
                    </div>
                  )}
                  {prof.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{prof.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom commission & stats */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{prof.default_commission_rate}% comissão</span>
                </div>
                <div className="text-slate-400 font-medium">
                  {profAppointmentsCount} atendimentos
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Professional Edit Modal */}
      <ProfessionalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProf(null);
        }}
        professional={selectedProf}
      />
    </div>
  );
};
