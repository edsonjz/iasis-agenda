import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Professional } from '@/types';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional | null;
}

const COLOR_PRESETS = [
  '#bf3f57', // Rose
  '#7c3aed', // Purple
  '#0284c7', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#db2777', // Pink
  '#4f46e5', // Indigo
];

export const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  isOpen,
  onClose,
  professional,
}) => {
  const { saveProfessional, deleteProfessional } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [color, setColor] = useState('#bf3f57');
  const [specialtiesInput, setSpecialtiesInput] = useState('');
  const [commissionRate, setCommissionRate] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (professional) {
      setName(professional.name);
      setNickname(professional.nickname || '');
      setEmail(professional.email || '');
      setPhone(professional.phone || '');
      setCpf(professional.cpf || '');
      setColor(professional.color || '#bf3f57');
      setSpecialtiesInput(professional.specialties.join(', '));
      setCommissionRate(professional.default_commission_rate || 40);
    } else {
      setName('');
      setNickname('');
      setEmail('');
      setPhone('');
      setCpf('');
      setColor('#bf3f57');
      setSpecialtiesInput('Extensão de Cílios, Lash Lifting');
      setCommissionRate(40);
    }
  }, [professional, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome da profissional é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      const specialties = specialtiesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const profData: Professional = {
        id: professional?.id || Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        cpf: cpf.trim() || undefined,
        color,
        specialties,
        commission_type: 'percentage',
        default_commission_rate: commissionRate,
        active: true,
        created_at: professional?.created_at || new Date().toISOString(),
      };

      await saveProfessional(profData);
      success(professional ? 'Profissional atualizada!' : 'Profissional cadastrada!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar profissional.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!professional) return;
    if (confirm(`Deseja remover a profissional "${professional.name}"?`)) {
      await deleteProfessional(professional.id);
      success('Profissional removida');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={professional ? 'Editar Profissional' : 'Nova Profissional'}
      subtitle="Cadastre membros da equipe e configure especialidades e comissão"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome Completo"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Dra. Camila Ribeiro"
            required
          />
          <Input
            label="Apelido / Nome de Atendimento"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Ex: Camila"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Telefone / WhatsApp"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(11) 98765-4321"
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="camila@iasisagenda.com.br"
          />
        </div>

        <Input
          label="Especialidades (separadas por vírgula)"
          value={specialtiesInput}
          onChange={e => setSpecialtiesInput(e.target.value)}
          placeholder="Ex: Extensão de Cílios, Micropigmentação, Design"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Comissão Padrão (%)"
            type="number"
            min={0}
            max={100}
            value={commissionRate}
            onChange={e => setCommissionRate(Number(e.target.value))}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Cor na Agenda
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === preset ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {professional ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Excluir Profissional
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              Salvar Profissional
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
