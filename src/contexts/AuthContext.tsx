import React, { createContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { isEmailAllowed } from '../config/allowedEmails';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);



  const signIn = async (email: string, password: string) => {
    // Überprüfe, ob die E-Mail erlaubt ist
    if (!isEmailAllowed(email)) {
      return { 
        error: { 
          message: 'Diese E-Mail-Adresse ist nicht berechtigt, auf diese Website zuzugreifen.' 
        } as AuthError 
      };
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    return { error: result.error };
  };

  const signUp = async (email: string, password: string) => {
    // Überprüfe, ob die E-Mail erlaubt ist
    if (!isEmailAllowed(email)) {
      return { 
        error: { 
          message: 'Diese E-Mail-Adresse ist nicht berechtigt, sich zu registrieren.' 
        } as AuthError 
      };
    }

    const result = await supabase.auth.signUp({ email, password });
    return { error: result.error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 