import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const defaultMockProfile: Profile = {
  id: 'a0000000-0000-0000-0000-000000000002',
  role: 'admin',
  full_name: 'Jaque Souza',
  display_name: 'Jaque Souza',
  phone: '(11) 98765-4321',
  active: true,
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (data) {
            setProfile(data);
          } else {
            setProfile({
              id: session.user.id,
              role: 'admin',
              full_name: session.user.user_metadata?.full_name || 'Jaque Souza',
              display_name: 'Jaque Souza',
              active: true,
              created_at: new Date().toISOString(),
            });
          }
        }
        
        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          if (!session?.user) setProfile(null);
        });
      } else {
        // Modo Local / Demo
        const storedProfile = localStorage.getItem('iasis_mock_profile');
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
          setUser({ id: 'demo-user-id', email: 'studiojaquesouza@gmail.com' });
        } else {
          setProfile(defaultMockProfile);
          setUser({ id: 'demo-user-id', email: 'studiojaquesouza@gmail.com' });
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, _pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: _pass,
      });
      if (error) return { error: error.message };
      setUser(data.user);
      return { error: null };
    } else {
      // Local demo login
      const mock = { ...defaultMockProfile, full_name: email.split('@')[0] || 'Jaque Souza' };
      setProfile(mock);
      setUser({ id: 'demo-user-id', email });
      localStorage.setItem('iasis_mock_profile', JSON.stringify(mock));
      return { error: null };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('iasis_mock_profile');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(data).eq('id', profile.id);
    } else {
      localStorage.setItem('iasis_mock_profile', JSON.stringify(updated));
    }
  };

  const changePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    // Client-side strength validation
    if (newPassword.length < 8) {
      return { error: 'A senha deve ter no mínimo 8 caracteres.' };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return { error: 'A senha deve conter ao menos uma letra maiúscula.' };
    }
    if (!/[0-9]/.test(newPassword)) {
      return { error: 'A senha deve conter ao menos um número.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } else {
      // Local storage mock simulation
      localStorage.setItem('iasis_mock_password', newPassword);
      return { error: null };
    }
  };

  const role: UserRole = profile?.role || 'admin';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isAdmin,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
