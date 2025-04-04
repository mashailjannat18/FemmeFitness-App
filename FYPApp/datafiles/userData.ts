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
};

// Default values for userData
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
};

export let userData: UserData = { ...defaultUserData };

export const setUserData = (screenKey: keyof UserData, data: number | string | string[]): void => {
  userData = { ...userData, [screenKey]: data };
};

export const getUserData = (): UserData => {
  return { ...userData };
};

// Reset userData to default values
export const resetUserData = (): void => {
  console.log('Resetting userData to default values');
  userData = { ...defaultUserData };
};

// Reset userData when starting a new signup process
export const initializeSignup = (): void => {
  console.log('Initializing signup process, resetting userData');
  resetUserData();
};

export const addUserToSupabase = async (): Promise<number | null> => {
  let userId: number | null = null;

  try {
    console.log('Starting addUserToSupabase with userData:', userData);

    // Step 1: Prepare the payload for the backend
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
      preferredRestDay: Array.isArray(userData.restDays) && userData.restDays.length > 0
        ? userData.restDays[0]
        : 'Sunday',
    };
    console.log('Sending payload to backend:', payload);

    // Step 2: Call the backend to generate the workout plan
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

    // Step 3: Call the PostgreSQL function to insert all data atomically
    const { data, error } = await supabase.rpc('insert_user_and_workout_plan', {
      p_username: userData.username,
      p_email: userData.email,
      p_password: userData.password,
      p_age: userData.age,
      p_weight: userData.weight,
      p_height: userData.height,
      p_diseases: Array.isArray(userData.diseases) ? userData.diseases.join(', ') : userData.diseases,
      p_goal: userData.goal,
      p_areas_of_focus: Array.isArray(userData.areasOfFocus)
        ? userData.areasOfFocus.join(', ')
        : userData.areasOfFocus,
      p_activity_level: userData.activityLevel,
      p_preferred_rest_days: Array.isArray(userData.restDays) && userData.restDays.length > 0
        ? userData.restDays.join(', ')
        : 'Sunday',
      p_challenge_days: userData.challengeDays,
      p_workout_plan: workoutPlan.plan, // Pass the workout plan as JSONB
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(`Failed to insert data into Supabase: ${error.message}`);
    }

    console.log('User data and workout plan successfully saved!', data);
    userId = data[0]?.user_id || null;

    // Step 4: Reset userData to default values after saving
    resetUserData();

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