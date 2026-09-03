import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { isSupabaseConfigured } from '@/lib/supabase';
import { BusinessSettings } from '@/types';
import {
  Settings,
  Building,
  CreditCard,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  AlertTriangle
} from 'lucide-react';

export const Configuracoes: React.FC = () => {
  const { settings, saveSettings } = useBusiness();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [instagram, setInstagram] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState('Email');
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [depositFixed, setDepositFixed] = useState(50);
  const [inactiveDays, setInactiveDays] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setTradeName(settings.trade_name || '');
      setDocument(settings.document || '');
      setPhone(settings.phone || '');
      setWhatsapp(settings.whatsapp || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setCity(settings.city || '');
      setState(settings.state || 'SP');
      setInstagram(settings.instagram || '');
      setPixKey(settings.pix_key || '');
      setPixType(settings.pix_type || 'Email');
      setRequireDeposit(settings.require_deposit_by_default ?? false);
      setDepositPercent(settings.default_deposit_percentage ?? 30);
      setDepositFixed(settings.default_deposit_fixed_amount ?? 50);
      setInactiveDays(settings.inactive_client_days ?? 60);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const updated: BusinessSettings = {
        id: settings?.id || 'a0000000-0000-0000-0000-000000000001',
        name,
        trade_name: tradeName || undefined,
        document: document || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp.replace(/\D/g, ''),
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        instagram: instagram || undefined,
        pix_key: pixKey || undefined,
        pix_type: pixType,
        require_deposit_by_default: requireDeposit,
        default_deposit_percentage: depositPercent,
        default_deposit_fixed_amount: depositFixed,
        business_hours: settings?.business_hours || {},
        inactive_client_days: inactiveDays,
      };

      await saveSettings(updated);
      success('Configurações salvas com sucesso!');
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar configurações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-600" /> Configurações da Estética
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dados cadastrais da clínica, chaves PIX, sinal de reserva e regras operacionais
          </p>
        </div>
      </div>

      {/* Database Connection Status Card */}
      <Card className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Status da Conexão
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Demonstração / Local'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSupabaseConfigured
                ? 'Seus dados estão sincronizados com o banco PostgreSQL no Supabase.'
                : 'Operando localmente com persistência segura. Para conectar ao Supabase em produção, configure seu .env.'}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Clinic Identity */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-rose-600" /> Dados da Clínica / Estética
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Fantasia da Estética"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="IASIS Estética Avançada"
              required
            />
            <Input
              label="Razão Social / Nome da Proprietária"
              value={tradeName}
              onChange={e => setTradeName(e.target.value)}
              placeholder="Iasis Clinic Ltda"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="CNPJ ou CPF"
              value={document}
              onChange={e => setDocument(e.target.value)}
              placeholder="00.000.000/0001-00"
            />
            <Input
              label="WhatsApp Principal"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
            <Input
              label="Telefone Fixo (opcional)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(11) 3456-7890"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail de Contato"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contato@iasisagenda.com.br"
            />
            <Input
              label="Instagram (@)"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="@iasis.estetica"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Endereço Completo"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Av. Paulista, 1000 - Sala 42"
              />
            </div>
            <div>
              <Input
                label="Cidade / UF"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="São Paulo - SP"
              />
            </div>
          </div>
        </Card>

        {/* PIX & Deposit Rules */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-600" /> PIX & Sinal de Reserva
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Chave PIX da Clínica"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="pix@iasisagenda.com.br"
              />
            </div>
            <Select
              label="Tipo de Chave"
              value={pixType}
              onChange={e => setPixType(e.target.value)}
            >
              <option value="Email">E-mail</option>
              <option value="CNPJ">CNPJ</option>
              <option value="CPF">CPF</option>
              <option value="Telefone">Telefone</option>
              <option value="Aleatória">Chave Aleatória</option>
            </Select>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requireDeposit"
                checked={requireDeposit}
                onChange={e => setRequireDeposit(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <label htmlFor="requireDeposit" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Sempre solicitar sinal de reserva por padrão ao abrir novo agendamento
              </label>
            </div>

            {requireDeposit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Percentual Padrão do Sinal (%)"
                  type="number"
                  min={0}
                  max={100}
                  value={depositPercent}
                  onChange={e => setDepositPercent(Number(e.target.value))}
                />
                <Input
                  label="Valor Fixo Alternativo (R$)"
                  type="number"
                  step="0.01"
                  value={depositFixed}
                  onChange={e => setDepositFixed(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Operational Metrics */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-purple-600" /> Regras Operacionais & Inatividade
          </h3>

          <div className="max-w-sm">
            <Input
              label="Período para considerar Cliente Inativa (dias)"
              type="number"
              min={15}
              max={365}
              value={inactiveDays}
              onChange={e => setInactiveDays(Number(e.target.value))}
              helperText="Clientes sem atendimento após esse prazo receberão alerta de recuperação no Dashboard."
            />
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            icon={<Save className="w-4 h-4" />}
          >
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
};
