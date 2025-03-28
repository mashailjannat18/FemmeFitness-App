import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type UserAuthContextType = {
  isLoggedIn: boolean;
  user: { username: string; id: string } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (username: string, id: string) => void;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('User')
      .select('id, username, password')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      throw new Error('Invalid email or password.');
    }

    setUser({ username: data.username, id: data.id });
    setIsLoggedIn(true);
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id, username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Sign-up check failed: ' + checkError.message);
    }

    if (existingUser) {
      throw new Error('Username already exists');
    }

    setUser({ username, id: '' });
    setIsLoggedIn(true);
  };

  const updateUser = (username: string, id: string) => {
    setUser({ username, id });
  };

  return (
    <UserAuthContext.Provider value={{ isLoggedIn, user, login, logout, signUp, updateUser }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};