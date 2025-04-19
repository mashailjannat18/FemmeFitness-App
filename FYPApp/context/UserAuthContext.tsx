import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addUserToSupabase } from '@/datafiles/userData';
import { sendConfirmationEmail } from '@/lib/email';
import { resetUserData, initializeSignup } from '@/datafiles/userData';

type User = {
  id: string;
  username: string;
  email: string;
};

type UserAuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  signUp: (email: string, password: string, username: string, challengeDays: number) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
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

  const generateCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  };

  const signUp = async (email: string, password: string, username: string, challengeDays: number) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedUsername = username.trim().toLowerCase();

      // Check for existing email
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('User')
        .select('id')
        .eq('email', trimmedEmail)
        .single();

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Email check error:', emailCheckError);
        throw new Error('This email has already been signed up with');
      }

      if (existingEmail) {
        throw new Error('This email has already been signed up with');
      }

      // Check for existing username
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('User')
        .select('id')
        .eq('username', trimmedUsername)
        .single();

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        console.error('Username check error:', usernameCheckError);
        throw new Error('This username is taken');
      }

      if (existingUser) {
        throw new Error('This username is taken');
      }

      // Generate and send confirmation code
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

      // Delete any existing codes for this email
      await supabase.from('ConfirmationCodes').delete().eq('email', trimmedEmail);

      // Store new code and user data
      const { error: insertError, data } = await supabase
        .from('ConfirmationCodes')
        .insert({
          email: trimmedEmail,
          code,
          expires_at: expiresAt,
          user_data: { username: trimmedUsername, password, challengeDays },
          resend_count: 0,
          last_resend_at: new Date().toISOString(), // Track last resend time
        });

      if (insertError) {
        console.error('Error storing confirmation code:', JSON.stringify(insertError, null, 2));
        throw new Error('Failed to initiate signup: ' + (insertError.message || 'Unknown error'));
      }

      console.log('Confirmation code stored:', data);

      // Send confirmation email
      await sendConfirmationEmail(trimmedEmail, code);
    } catch (error: any) {
      console.error('Signup error:', error);
      if (
        error.message === 'This email has already been signed up with' ||
        error.message === 'This username is taken'
      ) {
        throw error;
      }
      throw new Error('Failed to send confirmation code.');
    }
  };

  const resendCode = async (email: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Check existing code
      const { data, error } = await supabase
        .from('ConfirmationCodes')
        .select('resend_count, user_data, last_resend_at')
        .eq('email', trimmedEmail)
        .single();

      if (error || !data) {
        throw new Error('No pending signup found for this email.');
      }

      const resendCount = data.resend_count || 0;
      if (resendCount >= 3) {
        // Delete the confirmation code and reset user data
        await supabase.from('ConfirmationCodes').delete().eq('email', trimmedEmail);
        initializeSignup(); // Reset all signup data
        throw new Error('Maximum resend attempts reached. Please restart the signup process.');
      }

      const lastResendAt = new Date(data.last_resend_at);
      const now = new Date();
      const timeSinceLastResend = (now.getTime() - lastResendAt.getTime()) / 1000; // in seconds

      if (timeSinceLastResend < 60) { // 1 minute cooldown
        throw new Error(`Please wait ${Math.ceil(60 - timeSinceLastResend)} seconds before requesting a new code.`);
      }

      // Generate new code
      const newCode = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Reset to 10 minutes

      // Update existing record
      const { error: updateError } = await supabase
        .from('ConfirmationCodes')
        .update({
          code: newCode,
          expires_at: expiresAt,
          resend_count: resendCount + 1,
          last_resend_at: new Date().toISOString(),
        })
        .eq('email', trimmedEmail);

      if (updateError) {
        console.error('Error updating confirmation code:', updateError.message);
        throw new Error('Failed to resend confirmation code.');
      }

      // Send new confirmation email
      await sendConfirmationEmail(trimmedEmail, newCode);
    } catch (error: any) {
      console.error('Resend code error:', error.message);
      throw error;
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Retrieve the confirmation code
      const { data, error } = await supabase
        .from('ConfirmationCodes')
        .select('code, expires_at, user_data')
        .eq('email', trimmedEmail)
        .eq('code', code)
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired confirmation code.');
      }

      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (now > expiresAt) {
        // Delete expired code
        await supabase.from('ConfirmationCodes').delete().eq('email', trimmedEmail);
        throw new Error('Confirmation code has expired.');
      }

      // Extract user data
      const { username, password, challengeDays } = data.user_data;

      // Complete signup by adding user to Supabase
      const userId = await addUserToSupabase(trimmedEmail, password, username, challengeDays);
      if (!userId) {
        throw new Error('Failed to complete signup.');
      }

      // Store user session
      const userDataToStore = { id: userId.toString(), username, email: trimmedEmail };
      setUser(userDataToStore);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('userSession', JSON.stringify(userDataToStore));

      // Delete the confirmation code
      await supabase.from('ConfirmationCodes').delete().eq('email', trimmedEmail);
    } catch (error: any) {
      console.error('Code verification error:', error.message);
      throw error;
    }
  };

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
    <UserAuthContext.Provider value={{ user, isLoggedIn, signUp, verifyCode, resendCode, login, logout }}>
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