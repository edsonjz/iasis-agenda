import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Package } from '@/types';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg?: Package | null;
}

export const PackageModal: React.FC<PackageModalProps> = ({ isOpen, onClose, pkg }) => {
  const { services, savePackage, deletePackage } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [totalSessions, setTotalSessions] = useState(5);
  const [price, setPrice] = useState(450);
  const [validityDays, setValidityDays] = useState(180);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setDescription(pkg.description || '');
      setServiceId(pkg.service_id || '');
      setTotalSessions(pkg.total_sessions);
      setPrice(pkg.price);
      setValidityDays(pkg.validity_days || 180);
    } else {
      setName('');
      setDescription('');
      setServiceId(services[0]?.id || '');
      setTotalSessions(5);
      setPrice(450);
      setValidityDays(180);
    }
  }, [pkg, isOpen, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome do pacote é obrigatório');
      return;
    }
    if (price <= 0) {
      toastError('Preço deve ser maior que zero');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedServ = services.find(s => s.id === serviceId);
      const pkgData: Package = {
        id: pkg?.id || `pkg_${Date.now()}`,
        name: name.trim(),
        description: description.trim() || undefined,
        service_id: serviceId || undefined,
        service_name: selectedServ?.name || undefined,
        total_sessions: totalSessions,
        price,
        validity_days: validityDays,
        active: true,
        created_at: pkg?.created_at || new Date().toISOString(),
      };

      await savePackage(pkgData);
      success(pkg ? 'Pacote atualizado!' : 'Pacote criado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar pacote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pkg) return;
    if (confirm(`Deseja excluir o pacote "${pkg.name}"?`)) {
      await deletePackage(pkg.id);
      success('Pacote excluído');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pkg ? 'Editar Pacote de Procedimento' : 'Novo Pacote de Procedimentos'}
      subtitle="Crie combos e planos de sessões para fidelizar clientes"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Pacote"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Pacote 5 Manutenções de Cílios"
          required
        />

        <Select
          label="Procedimento Vinculado"
          value={serviceId}
          onChange={e => setServiceId(e.target.value)}
        >
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Input
          label="Descrição do Pacote (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Válido para sessões quinzenais com garantia de retoque"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Qtd. de Sessões"
            type="number"
            min={2}
            value={totalSessions}
            onChange={e => setTotalSessions(Number(e.target.value))}
            required
          />
          <Input
            label="Valor do Pacote (R$)"
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            required
          />
          <Input
            label="Validade (Dias)"
            type="number"
            value={validityDays}
            onChange={e => setValidityDays(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {pkg ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Excluir Pacote
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {pkg ? 'Salvar Alterações' : 'Criar Pacote'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
