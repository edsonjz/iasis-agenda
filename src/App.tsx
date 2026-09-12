import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Clientes } from './pages/Clientes';
import { Profissionais } from './pages/Profissionais';
import { Servicos } from './pages/Servicos';
import { Anamnese } from './pages/Anamnese';
import { Produtos } from './pages/Produtos';
import { Financeiro } from './pages/Financeiro';
import { Caixa } from './pages/Caixa';
import { Comissoes } from './pages/Comissoes';
import { Pacotes } from './pages/Pacotes';
import { Promocoes } from './pages/Promocoes';
import { Fidelizacao } from './pages/Fidelizacao';
import { Relatorios } from './pages/Relatorios';
import { Lembretes } from './pages/Lembretes';
import { CRM } from './pages/CRM';
import { Configuracoes } from './pages/Configuracoes';
import { Login } from './pages/Login';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Only Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/agenda" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BusinessProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected App Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="crm" element={<CRM />} />
                  <Route path="profissionais" element={<Profissionais />} />
                  <Route path="servicos" element={<Servicos />} />
                  <Route path="anamnese" element={<Anamnese />} />
                  <Route path="produtos" element={<Produtos />} />
                  <Route path="financeiro" element={<AdminRoute><Financeiro /></AdminRoute>} />
                  <Route path="caixa" element={<AdminRoute><Caixa /></AdminRoute>} />
                  <Route path="comissoes" element={<AdminRoute><Comissoes /></AdminRoute>} />
                  <Route path="pacotes" element={<Pacotes />} />
                  <Route path="promocoes" element={<Promocoes />} />
                  <Route path="fidelizacao" element={<Fidelizacao />} />
                  <Route path="relatorios" element={<AdminRoute><Relatorios /></AdminRoute>} />
                  <Route path="lembretes" element={<Lembretes />} />
                  <Route path="configuracoes" element={<AdminRoute><Configuracoes /></AdminRoute>} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </BusinessProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
