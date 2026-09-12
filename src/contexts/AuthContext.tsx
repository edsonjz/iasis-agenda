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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          // Always verify session freshness with the server
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session?.user) {
            // No valid session — user must log in
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }

          setUser(session.user);
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data) {
            setProfile(data);
          }
        } catch (err) {
          console.warn('Supabase auth session error:', err);
          setUser(null);
          setProfile(null);
        }

        // Listen for auth state changes (login, logout, token refresh)
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            setProfile(null);
            return;
          }

          setUser(session.user);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (supabase) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              if (profileData) setProfile(profileData);
            }
          }
        });

        subscription = data.subscription;
      } else {
        // Supabase not configured — no access without it
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    }

    initAuth();

    // Cleanup: unsubscribe from auth state changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, _pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Sistema de autenticação não configurado. Contate o administrador.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: _pass,
      });

      if (error) {
        // Do NOT attempt auto-signup — only existing users can log in
        return { error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
      }

      if (data.user) {
        setUser(data.user);

        // Load or create profile for this authenticated user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
          // Create profile for legitimately registered user with principle of least privilege
          const isOwnerAdmin = cleanEmail === 'studiojaquesouza@gmail.com';
          const newProf: Profile = {
            id: data.user.id,
            role: isOwnerAdmin ? 'admin' : 'professional',
            full_name: data.user.user_metadata?.full_name || (isOwnerAdmin ? 'Jaque Souza' : 'Profissional'),
            display_name: data.user.user_metadata?.full_name || (isOwnerAdmin ? 'Jaque Souza' : 'Profissional'),
            active: true,
            created_at: new Date().toISOString(),
          };
          setProfile(newProf);
          await supabase.from('profiles').upsert(newProf);
        }

        return { error: null };
      }

      return { error: 'Falha na autenticação' };
    } catch (err: any) {
      return { error: err.message || 'Erro ao conectar com o serviço de autenticação' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);

    // Clear all Supabase and app session data from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.startsWith('iasis_mock'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    // Impede alteração de privilégio da própria role via cliente
    const { role: _role, ...safeData } = data;
    const updated = { ...profile, ...safeData };
    setProfile(updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(safeData).eq('id', profile.id);
    }
  };

  const changePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (newPassword.length < 8) {
      return { error: 'A senha deve ter no mínimo 8 caracteres.' };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return { error: 'A senha deve conter ao menos uma letra maiúscula.' };
    }
    if (!/[0-9]/.test(newPassword)) {
      return { error: 'A senha deve conter ao menos um número.' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return { error: 'A senha deve conter ao menos um caractere especial.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    }

    return { error: 'Sistema de autenticação não configurado.' };
  };

  const role: UserRole = profile?.role || 'professional';
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
