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
  user: null, session: null, profile: null,
  loading: true, isAuthenticated: false,
  isRecoveryMode: false, authError: null,
  signIn: async () => {}, signOut: async () => {}, refreshProfile: async () => {},
});

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_profile');
    if (error) { console.warn('get_my_profile error:', error.message); return null; }
    if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
    return data ?? null;
  } catch (e) { return null; }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = async () => { setProfile(await fetchProfile()); };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      if (s) { setSession(s); setUser(s.user); setProfile(await fetchProfile()); }
      if (mounted) setLoading(false);
    }).catch(() => { if (mounted) setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') { setSession(null); setUser(null); setProfile(null); setLoading(false); return; }
      if (s) { setSession(s); setUser(s.user); setProfile(await fetchProfile()); setLoading(false); }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) throw new Error('E-mail ou senha incorretos.');
        throw new Error(error.message);
      }
      setSession(data.session);
      setUser(data.session.user);
      setProfile(await fetchProfile());
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao autenticar.');
      setSession(null); setUser(null); setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.removeItem('esquematiza-auth');
      sessionStorage.clear();
    } catch (e) {
      console.error('signOut error:', e);
    } finally {
      setSession(null); setUser(null); setProfile(null);
      setLoading(false);
      // Força navegação para login independente do estado do Router
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isAuthenticated: !!user, isRecoveryMode, authError, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
