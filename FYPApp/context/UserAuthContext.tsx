// UserAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addUserToSupabase } from '@/datafiles/userData';

type User = {
  id: string; // Keep as string for now, converted to number when needed
  username: string;
  email: string;
};

type UserAuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  signUp: (email: string, password: string, username: string, challengeDays: number) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          const userData = JSON.parse(session);
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, username, email')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Invalid email or password.');
      }

      const userData = { id: data.id.toString(), username: data.username, email: data.email };
      setUser(userData);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string, challengeDays: number) => {
    try {
      // Check for existing email
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('User')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        throw new Error('Sign-up check failed: ' + emailCheckError.message);
      }

      if (existingEmail) {
        throw new Error('Email already exists. Please use a different email.');
      }

      // Check for existing username
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('User')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .single();

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        throw new Error('Sign-up check failed: ' + usernameCheckError.message);
      }

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Call addUserToSupabase to handle data insertion
      const userId = await addUserToSupabase(email, password, username, challengeDays);
      if (!userId) {
        throw new Error('Failed to sign up user.');
      }

      const userDataToStore = { id: userId.toString(), username: username.trim(), email: email.trim() };
      setUser(userDataToStore);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('userSession', JSON.stringify(userDataToStore));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsLoggedIn(false);
      await AsyncStorage.removeItem('userSession');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <UserAuthContext.Provider value={{ user, isLoggedIn, signUp, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};