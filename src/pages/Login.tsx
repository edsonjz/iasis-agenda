import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck2, Lock, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('studiojaquesouza@gmail.com');
  const [password, setPassword] = useState('Agenda@2026');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toastError('Informe seu e-mail de acesso');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.error) {
        toastError(res.error, 'Falha no Login');
      } else {
        success('Bem-vinda ao IASIS AGENDA!');
        navigate('/');
      }
    } catch (err) {
      toastError('Não foi possível realizar o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    await login('admin@iasisagenda.com.br', 'demo123');
    success('Acesso concedido como Administradora');
    navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-xl shadow-rose-600/30 mb-2">
            <CalendarCheck2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
            IASIS <span className="text-rose-500">AGENDA</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Gestão Interna para Clínicas de Estética & Beleza
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Acessar Painel</h2>
            <p className="text-xs text-slate-400">Entre com suas credenciais de equipe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seuemail@estetica.com.br"
              leftIcon={<Mail className="w-4 h-4" />}
              className="bg-slate-850 border-slate-700 text-white placeholder:text-slate-500"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              className="bg-slate-850 border-slate-700 text-white placeholder:text-slate-500"
              required
            />

            <Button
              type="submit"
              className="w-full h-11 text-sm bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/30"
              loading={loading}
            >
              Entrar no Sistema
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-rose-400 hover:text-rose-300 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Entrar em Modo Demonstração (1 Clique)
            </button>
          </div>
        </Card>

        {/* Footer Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Ambiente Seguro • Conexão Criptografada</span>
        </div>
      </div>
    </div>
  );
};
