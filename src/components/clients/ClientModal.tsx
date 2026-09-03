import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Client } from '@/types';
import { DEFAULT_TAGS } from '@/lib/constants';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client }) => {
  const { saveClient, professionals } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [howDidYouFindUs, setHowDidYouFindUs] = useState('Instagram');
  const [preferredProfessionalId, setPreferredProfessionalId] = useState('');
  const [allowContact, setAllowContact] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setNickname(client.nickname || '');
      setCpf(client.cpf || '');
      setWhatsapp(client.whatsapp);
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setBirthDate(client.birth_date || '');
      setAddress(client.address || '');
      setCity(client.city || '');
      setState(client.state || '');
      setHowDidYouFindUs(client.how_did_you_find_us || 'Instagram');
      setPreferredProfessionalId(client.preferred_professional_id || '');
      setAllowContact(client.allow_contact ?? true);
      setSelectedTags(client.tags || []);
      setNotes(client.notes || '');
    } else {
      setName('');
      setNickname('');
      setCpf('');
      setWhatsapp('');
      setPhone('');
      setEmail('');
      setBirthDate('');
      setAddress('');
      setCity('');
      setState('');
      setHowDidYouFindUs('Instagram');
      setPreferredProfessionalId('');
      setAllowContact(true);
      setSelectedTags(['Nova cliente']);
      setNotes('');
    }
  }, [client, isOpen]);

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Nome completo é obrigatório');
      return;
    }
    if (!whatsapp.trim()) {
      toastError('WhatsApp é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanWhatsApp = whatsapp.replace(/\D/g, '');

      const clientData: Client = {
        id: client?.id || Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        cpf: cpf.trim() || undefined,
        whatsapp: cleanWhatsApp,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        birth_date: birthDate || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        how_did_you_find_us: howDidYouFindUs,
        preferred_professional_id: preferredProfessionalId || undefined,
        allow_contact: allowContact,
        tags: selectedTags,
        notes: notes.trim() || undefined,
        total_appointments: client?.total_appointments || 0,
        total_spent: client?.total_spent || 0,
        active: true,
        created_at: client?.created_at || new Date().toISOString(),
        last_appointment_date: client?.last_appointment_date,
      };

      await saveClient(clientData);
      success(client ? 'Cliente atualizada com sucesso!' : 'Cliente cadastrada com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Editar Cliente' : 'Nova Cliente'}
      subtitle="Cadastre os dados pessoais, contato e tags da cliente"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Name & Nickname */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Nome Completo"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Mariana Alcantara"
              required
            />
          </div>
          <div>
            <Input
              label="Apelido / Social"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Ex: Mari"
            />
          </div>
        </div>

        {/* Row 2: WhatsApp & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="Ex: (11) 98765-4321"
            required
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Ex: mariana@email.com"
          />
        </div>

        {/* Row 3: CPF & Birth Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data de Nascimento"
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
          />
          <Input
            label="CPF (opcional)"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            placeholder="000.000.000-00"
          />
        </div>

        {/* Row 4: Commercial preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Como conheceu a clínica?"
            value={howDidYouFindUs}
            onChange={e => setHowDidYouFindUs(e.target.value)}
          >
            <option value="Instagram">Instagram</option>
            <option value="Google">Google / Pesquisa</option>
            <option value="Indicação de amiga">Indicação de amiga</option>
            <option value="Passou em frente">Passou em frente</option>
            <option value="TikTok">TikTok</option>
            <option value="Outro">Outro</option>
          </Select>

          <Select
            label="Profissional Preferencial"
            value={preferredProfessionalId}
            onChange={e => setPreferredProfessionalId(e.target.value)}
          >
            <option value="">Sem preferência específica</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Tags Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Tags da Cliente
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes & Observations */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Observações e Preferências Internas
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Tem sensibilidade nos olhos, prefere atendimento à tarde, cafezinho com açúcar..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
          />
        </div>

        {/* Allow Contact Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="allowContact"
            checked={allowContact}
            onChange={e => setAllowContact(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
          />
          <label htmlFor="allowContact" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            Autoriza receber lembretes e mensagens de confirmação via WhatsApp
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
