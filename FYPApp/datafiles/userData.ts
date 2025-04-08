import { supabase } from '@/lib/supabase';

export type UserData = {
  username: string;
  age: number;
  weight: number;
  height: number;
  diseases: string[];
  goal: string;
  areasOfFocus: string[];
  activityLevel: number;
  restDays: string[];
  challengeDays: number;
  email: string;
  password: string; 
  workoutPlan: any[];
};

const defaultUserData: UserData = {
  username: '',
  age: 0,
  weight: 0,
  height: 0,
  diseases: [],
  goal: '',
  areasOfFocus: [],
  activityLevel: 0,
  restDays: [],
  challengeDays: 0,
  email: '',
  password: '',
  workoutPlan: [],
};

export let userData: UserData = { ...defaultUserData };

export const setUserData = (screenKey: keyof UserData, data: number | string | string[] | any[] | null): void => {
  userData = { ...userData, [screenKey]: data };
};

export const getUserData = (): UserData => {
  return { ...userData };
};

export const resetUserData = (): void => {
  console.log('Resetting userData to default values');
  userData = { ...defaultUserData };
};

export const initializeSignup = (): void => {
  console.log('Initializing signup process, resetting userData');
  resetUserData();
};

export const addUserToSupabase = async (
  email: string,
  password: string,
  username: string,
  challengeDays: number
): Promise<number | null> => {
  let userId: number | null = null;

  try {
    console.log('Starting addUserToSupabase with inputs:', { email, password, username, challengeDays });

    setUserData('email', email.trim().toLowerCase());
    setUserData('password', password);
    setUserData('username', username.trim().toLowerCase());
    setUserData('challengeDays', challengeDays);

    console.log('userData after setting provided values:', userData);

    if (userData.age === null) {
      throw new Error('Age is required for workout plan generation.');
    }
    if (userData.weight === null) {
      throw new Error('Weight is required for workout plan generation.');
    }
    if (userData.goal === null) {
      throw new Error('Goal is required for workout plan generation.');
    }
    if (userData.activityLevel === null) {
      throw new Error('Activity level is required for workout plan generation.');
    }
    if (!userData.restDays || userData.restDays.length === 0) {
      throw new Error('At least one rest day is required for workout plan generation.');
    }

    const goalMap: { [key: string]: string } = {
      'Lose weight': 'weight_loss',
      'Gain weight': 'gain_weight',
      'Muscle build': 'build_muscle',
      'Stay fit': 'stay_fit',
    };

    const payload = {
      age: Number(userData.age),
      activityLevel: Number(userData.activityLevel),
      goal: goalMap[userData.goal] || userData.goal,
      weight: Number(userData.weight),
      challengeDays: Number(userData.challengeDays),
      preferredRestDay: userData.restDays[0],
    };
    console.log('Sending payload to backend:', payload);

    console.log('Making fetch request to backend...');
    const response = await fetch('http://192.168.1.10:5000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('Fetch response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response error:', errorText);
      throw new Error(`Failed to generate workout plan: ${response.status} - ${errorText || 'No error message'}`);
    }

    const workoutPlan = await response.json();
    console.log('Workout plan generated:', workoutPlan);

    if (!workoutPlan || !workoutPlan.plan || !Array.isArray(workoutPlan.plan) || workoutPlan.plan.length === 0) {
      console.error('Invalid workout plan structure:', workoutPlan);
      throw new Error('Workout plan is not a non-empty array');
    }

    setUserData('workoutPlan', workoutPlan.plan);
    console.log('Stored workoutPlan in userData:', userData.workoutPlan);

    const rpcPayload = {
      p_username: userData.username,
      p_email: userData.email,
      p_password: userData.password,
      p_age: userData.age,
      p_weight: userData.weight,
      p_height: userData.height,
      p_diseases: userData.diseases.length > 0 ? userData.diseases.join(', ') : null,
      p_goal: userData.goal,
      p_areas_of_focus: userData.areasOfFocus.length > 0 ? userData.areasOfFocus.join(', ') : null,
      p_activity_level: userData.activityLevel,
      p_preferred_rest_days: userData.restDays.length > 0 ? userData.restDays.join(', ') : null,
      p_challenge_days: userData.challengeDays,
      p_workout_plan: userData.workoutPlan,
    };

    console.log('RPC payload:', rpcPayload);

    const { data, error } = await supabase.rpc('insert_user_and_workout_plan', rpcPayload);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(`Failed to insert data into Supabase: ${error.message}`);
    }

    console.log('User data and workout plan successfully saved!', data);
    userId = data[0]?.user_id || null;

    if (userId === null) {
      throw new Error('Failed to retrieve user ID from Supabase response');
    }

    return userId;
  } catch (err) {
    console.error('Error in addUserToSupabase:', err);
    if (userId) {
      await supabase
        .from('User')
        .delete()
        .eq('id', userId);
      console.log(`Deleted user with id ${userId} due to signup error.`);
    }
    throw err;
  }
};