import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isRecoveryMode: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isRecoveryMode: false,
  authError: null,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_profile');

    if (error) {
      console.warn('get_my_profile error:', error.message);
      return null;
    }

    if (Array.isArray(data)) return data[0] ?? null;
    return data ?? null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = async () => {
    const p = await fetchProfile();
    setProfile(p);
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        const s = data.session;

        if (!mounted) return;

        if (s) {
          setSession(s);
          setUser(s.user);

          // 🔥 NÃO BLOQUEIA O APP
          fetchProfile().then(p => {
            if (mounted) setProfile(p);
          });
        }
      } catch (e) {
        console.error('init auth error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (s) {
        setSession(s);
        setUser(s.user);

        fetchProfile().then(p => {
          if (mounted) setProfile(p);
        });

        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw new Error(error.message);

      setSession(data.session);
      setUser(data.session.user);

      // 🔥 NÃO BLOQUEIA
      fetchProfile().then(setProfile);

    } catch (err: any) {
      setAuthError(err.message || 'Erro ao autenticar.');
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('signOut error:', e);
    }

    // 🔥 RESET FORÇADO
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        isRecoveryMode,
        authError,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
