/**
 * @module    AuthContext
 * @summary   React Context and Hook for Supabase Authentication (Google OAuth, Session State, User Profiles).
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase/supabaseClient.ts';
import type { ProfileRow } from '../services/supabase/database.types.ts';
import { storageService } from '../services/storage/StorageService.ts';

interface AuthContextType {
  user: User | null;
  profile: ProfileRow | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading user profile from Supabase:', error);
      } else if (data) {
        setProfile(data as ProfileRow);
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      storageService.initializeForUser(null);
      setIsLoading(false);
      return;
    }

    // 1. Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await storageService.initializeForUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // 2. Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      await storageService.initializeForUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }

    // Redirect back to current window location after Google OAuth completes
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    return { error };
  };

  const signOut = async () => {
    if (!isConfigured) {
      await storageService.initializeForUser(null);
      return { error: null };
    }

    await storageService.initializeForUser(null);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: !!user,
        isConfigured,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
