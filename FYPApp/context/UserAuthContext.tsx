import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserAuthContextType = {
  isLoggedIn: boolean;
  user: { username: string; id: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);

  useEffect(() => {
    const checkPersistedLogin = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('loggedInUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking persisted login:', error);
      }
    };
    checkPersistedLogin();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('User')
      .select('id, username')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      throw new Error('Login failed: Invalid email or password');
    }

    const userData = { username: data.username, id: data.id };
    setUser(userData);
    setIsLoggedIn(true);
    await AsyncStorage.setItem('loggedInUser', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('loggedInUser');
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase
      .from('User')
      .insert([{ email, password, username }])
      .select('id, username')
      .single();

    if (error || !data) {
      throw new Error('Sign-up failed: ' + (error?.message || 'Unknown error'));
    }

    const userData = { username: data.username, id: data.id };
    setUser(userData);
    setIsLoggedIn(true);
    await AsyncStorage.setItem('loggedInUser', JSON.stringify(userData));
  };

  return (
    <UserAuthContext.Provider value={{ isLoggedIn, user, login, logout, signUp }}>
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