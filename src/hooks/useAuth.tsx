import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_my_profile');
      console.log('PROFILE RAW', data);

      let profileData = null;
      if (Array.isArray(data)) {
        profileData = data.length > 0 ? data[0] : null;
      } else if (data) {
        profileData = data;
      }

      if (!profileData) {
        setProfile(null);
        setAuthError('Perfil não encontrado.');
        return;
      }

      setProfile(profileData);
      setAuthError(null);
    } catch (err) {
      console.error('AUTH: refreshProfile error:', err);
      setProfile(null);
      setAuthError('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession.user);

      // Fetch profile immediately after sign in
      const { data: profileDataRaw, error: profileError } = await supabase.rpc('get_my_profile');
      console.log('PROFILE RAW', profileDataRaw);

      let profileData = null;
      if (Array.isArray(profileDataRaw)) {
        profileData = profileDataRaw.length > 0 ? profileDataRaw[0] : null;
      } else if (profileDataRaw) {
        profileData = profileDataRaw;
      }

      if (!profileData) {
        setProfile(null);
        setAuthError('Perfil não encontrado.');
        return;
      }

      setProfile(profileData);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao autenticar');
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsRecoveryMode(false);
    setLoading(false);
  };

  useEffect(() => {
    async function initializeAuth() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("SESSION", session);

        if (!session) {
          setUser(null);
          setProfile(null);
          return;
        }

        setSession(session);
        setUser(session.user);
        
        // Fetch profile
        const { data, error } = await supabase.rpc('get_my_profile');
        console.log('PROFILE RAW', data);

        let profileData = null;
        if (Array.isArray(data)) {
          profileData = data.length > 0 ? data[0] : null;
        } else if (data) {
          profileData = data;
        }

        if (!profileData) {
          setProfile(null);
          setAuthError('Perfil não encontrado.');
          return;
        }

        setProfile(profileData);
        setAuthError(null);
      } catch (err) {
        console.error('AUTH: initializeAuth error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AUTH EVENT:', event);
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (event === 'SIGNED_IN') {
        // Only fetch profile if not already fetching or if session changed
        if (session) {
          const { data } = await supabase.rpc('get_my_profile');
          let profileData = Array.isArray(data) ? data[0] : data;
          setProfile(profileData);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsRecoveryMode(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array as requested

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading, 
      isAuthenticated: !!user, 
      isRecoveryMode,
      authError, 
      signIn, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
