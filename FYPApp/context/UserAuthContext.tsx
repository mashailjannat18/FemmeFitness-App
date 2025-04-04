import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetUserData, userData } from '@/datafiles/userData'; // Import userData directly

type User = {
  id: string;
  username: string;
  email: string;
};

type UserAuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username: string, challengeDays: number) => Promise<void>;
  updateUser: (username: string, id: string) => void;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('User')
      .select('id, username, email, password')
      .eq('email', email.trim())
      .eq('password', password.trim())
      .single();

    if (error || !data) {
      throw new Error('Invalid email or password.');
    }

    setUser({ id: data.id.toString(), username: data.username, email: data.email });
    setIsLoggedIn(true);
    await AsyncStorage.setItem('userSession', JSON.stringify({ id: data.id.toString(), username: data.username, email: data.email }));
  };

  const logout = async () => {
    try {
      if (user && user.id) {
        const { error } = await supabase
          .from('WorkoutPlans')
          .update({ status: 'inactive' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) {
          console.error('Error marking WorkoutPlans as inactive:', error);
        }
      }

      setUser(null);
      setIsLoggedIn(false);
      resetUserData();
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('completedExercises');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string, challengeDays: number) => {
    // Use userData directly instead of getUserData()
    console.log('userData in signUp:', userData); // Log to verify contents

    // Check for existing email
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email.trim())
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
      .eq('username', username.trim())
      .single();

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      throw new Error('Sign-up check failed: ' + usernameCheckError.message);
    }

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Prepare all parameters for the RPC call using userData
    const payload = {
      p_username: username.trim(),
      p_email: email.trim(),
      p_password: password.trim(),
      p_age: userData.age,
      p_weight: userData.weight,
      p_height: userData.height,
      p_diseases: userData.diseases.length > 0 ? userData.diseases.join(', ') : null,
      p_goal: userData.goal,
      p_areas_of_focus: userData.areasOfFocus.length > 0 ? userData.areasOfFocus.join(', ') : null,
      p_activity_level: parseInt(userData.activityLevel.toString(), 10), // Convert to integer
      p_preferred_rest_days: userData.restDays.length > 0 ? userData.restDays.join(', ') : 'Sunday',
      p_challenge_days: challengeDays,
      p_workout_plan: null, // We'll generate this in the backend or modify the function to handle it
    };

    // Insert user and create workout plan
    const { data, error: insertError } = await supabase.rpc('insert_user_and_workout_plan', payload);

    if (insertError || !data) {
      console.error('Supabase RPC error:', insertError);
      throw new Error('Sign-up failed: ' + (insertError?.message || 'Unknown error'));
    }

    const newUserId = data[0].id.toString();
    setUser({ id: newUserId, username: username.trim(), email: email.trim() });
    setIsLoggedIn(true);
    await AsyncStorage.setItem('userSession', JSON.stringify({ id: newUserId, username: username.trim(), email: email.trim() }));
  };

  const updateUser = (username: string, id: string) => {
    if (!id) {
      console.error('Cannot update user with empty ID');
      return;
    }
    setUser({ id, username, email: user?.email || '' });
    AsyncStorage.setItem('userSession', JSON.stringify({ id, username, email: user?.email || '' }));
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