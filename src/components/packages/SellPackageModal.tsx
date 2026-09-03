import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { ClientPackage, PaymentMethod } from '@/types';
import { addDays, format } from 'date-fns';

interface SellPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export const SellPackageModal: React.FC<SellPackageModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
}) => {
  const { packages, clients, saveClientPackage, saveTransaction } = useBusiness();
  const { success, error: toastError } = useToast();

  const [clientId, setClientId] = useState(defaultClientId || clients[0]?.id || '');
  const [packageId, setPackageId] = useState(packages[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultClientId) setClientId(defaultClientId);
    else if (clients[0]) setClientId(clients[0].id);
    if (packages[0]) setPackageId(packages[0].id);
  }, [defaultClientId, isOpen, clients, packages]);

  const selectedPkg = packages.find(p => p.id === packageId) || packages[0];
  const selectedClient = clients.find(c => c.id === clientId) || clients[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg || !selectedClient) {
      toastError('Selecione uma cliente e um pacote');
      return;
    }

    try {
      setIsSubmitting(true);
      const expiresAt = addDays(new Date(), selectedPkg.validity_days || 180).toISOString();

      const clientPkg: ClientPackage = {
        id: `cpkg_${Date.now()}`,
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        package_id: selectedPkg.id,
        package_name: selectedPkg.name,
        total_sessions: selectedPkg.total_sessions,
        used_sessions: 0,
        price_paid: selectedPkg.price,
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt,
        status: 'active',
      };

      await saveClientPackage(clientPkg);

      // Auto record financial income
      await saveTransaction({
        id: `tr_pkg_${Date.now()}`,
        type: 'income',
        category_name: 'Venda de Pacote',
        description: `Venda de Pacote: ${selectedPkg.name} para ${selectedClient.name}`,
        amount: selectedPkg.price,
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString(),
      });

      success(`Pacote ${selectedPkg.name} vendido para ${selectedClient.name}!`);
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao vender pacote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Venda de Pacote de Sessões"
      subtitle="Vincule um pacote contratado à cliente com controle de sessões"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Cliente Compradora"
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          required
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.whatsapp})
            </option>
          ))}
        </Select>

        <Select
          label="Pacote Contratado"
          value={packageId}
          onChange={e => setPackageId(e.target.value)}
          required
        >
          {packages.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.total_sessions} sessões (R$ {p.price.toFixed(2)})
            </option>
          ))}
        </Select>

        <Select
          label="Forma de Pagamento"
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
        >
          <option value="credit_card">Cartão de Crédito</option>
          <option value="pix">PIX</option>
          <option value="debit_card">Cartão de Débito</option>
          <option value="cash">Dinheiro em Espécie</option>
        </Select>

        {selectedPkg && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs space-y-1">
            <div className="flex justify-between font-bold">
              <span>Total de Sessões:</span>
              <span className="text-rose-600">{selectedPkg.total_sessions} sessões</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Validade:</span>
              <span>{selectedPkg.validity_days} dias</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Confirmar Venda de Pacote
          </Button>
        </div>
      </form>
    </Modal>
  );
};
