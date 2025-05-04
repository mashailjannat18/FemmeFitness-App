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
  restDay: string;
  challengeDays: number;
  email: string;
  password: string;
  workoutPlan: any[];
  mealPlan?: any[];
  intensity?: string;
  lastPeriodDate: Date | null;
  cycleLength: number;
  bleedingDays: number;
  cyclePhases?: any[];
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
  restDay: '',
  challengeDays: 0,
  email: '',
  password: '',
  workoutPlan: [],
  mealPlan: [],
  intensity: '',
  lastPeriodDate: null,
  cycleLength: 0,
  bleedingDays: 0,
  cyclePhases: [],
};

export let userData: UserData = { ...defaultUserData };

export const setUserData = (screenKey: keyof UserData, data: number | string | string[] | any[] | Date | null): void => {
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

    if (userData.age === null || userData.age === 0) {
      throw new Error('Age is required for workout plan generation.');
    }
    if (userData.weight === null || userData.weight === 0 || userData.weight > 200) {
      throw new Error('Weight must be between 0 and 200 kg for workout plan generation.');
    }
    if (!userData.goal) {
      throw new Error('Goal is required for workout plan generation.');
    }
    if (userData.activityLevel === null || userData.activityLevel === 0) {
      throw new Error('Activity level is required for workout plan generation.');
    }
    if (!userData.restDay) {
      throw new Error('Rest day is required for workout plan generation.');
    }

    const goalMap: { [key: string]: string } = {
      'Lose weight': 'weight_loss',
      'Gain weight': 'gain_weight',
      'Muscle build': 'build_muscle',
      'Stay fit': 'stay_fit',
    };

    const startDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

    // Generate workout and meal plans
    const payload = {
      age: Number(userData.age),
      activityLevel: Number(userData.activityLevel),
      goal: goalMap[userData.goal] || userData.goal,
      weight: Number(userData.weight),
      challengeDays: Number(userData.challengeDays),
      preferredRestDay: userData.restDay,
      height: Number(userData.height),
    };
    console.log('Sending payload to backend for workout and meal plans:', payload);

    const workoutResponse = await fetch('http://192.168.1.8:5000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!workoutResponse.ok) {
      const errorText = await workoutResponse.text();
      console.error('Backend response error for workout plan:', errorText);
      throw new Error(`Failed to generate plans: ${workoutResponse.status} - ${errorText || 'No error message'}`);
    }

    const result = await workoutResponse.json();
    console.log('Plans generated:', result);

    if (!result.workout_plan || !Array.isArray(result.workout_plan) || result.workout_plan.length === 0) {
      console.error('Invalid workout plan structure:', result.workout_plan);
      throw new Error('Workout plan is not a non-empty array');
    }

    if (!result.meal_plan || !Array.isArray(result.meal_plan) || result.meal_plan.length === 0) {
      console.error('Invalid meal plan structure:', result.meal_plan);
      throw new Error('Meal plan is not a non-empty array');
    }

    if (!result.intensity || !['low', 'moderate', 'high'].includes(result.intensity)) {
      console.error('Invalid intensity value:', result.intensity);
      throw new Error('Intensity must be one of "low", "moderate", or "high"');
    }

    setUserData('workoutPlan', result.workout_plan);
    setUserData('mealPlan', result.meal_plan);
    setUserData('intensity', result.intensity);
    console.log('Stored plans and intensity in userData:', { workoutPlan: userData.workoutPlan, mealPlan: userData.mealPlan, intensity: userData.intensity });

    // Generate menstrual cycle prediction if applicable
    let cyclePhases = [];
    if (userData.lastPeriodDate && userData.cycleLength && userData.bleedingDays) {
      const cyclePayload = {
        lastPeriodDate: userData.lastPeriodDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        cycleLength: Number(userData.cycleLength),
        bleedingDays: Number(userData.bleedingDays),
        age: Number(userData.age),
        weight: Number(userData.weight),
        height: Number(userData.height),
      };
      console.log('Sending payload to backend for cycle prediction:', cyclePayload);

      const cycleResponse = await fetch('http://192.168.1.8:5000/api/predict-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cyclePayload),
      });

      if (!cycleResponse.ok) {
        const errorText = await cycleResponse.text();
        console.error('Backend response error for cycle prediction:', errorText);
        throw new Error(`Failed to predict cycle: ${cycleResponse.status} - ${errorText || 'No error message'}`);
      }

      const cycleResult = await cycleResponse.json();
      console.log('Cycle phases generated:', cycleResult);

      if (!cycleResult.cycle_phases || !Array.isArray(cycleResult.cycle_phases)) {
        console.error('Invalid cycle phases structure:', cycleResult.cycle_phases);
        throw new Error('Cycle phases must be a non-empty array');
      }

      cyclePhases = cycleResult.cycle_phases;
      setUserData('cyclePhases', cyclePhases);
      console.log('Stored cycle phases in userData:', userData.cyclePhases); // Verify phases here
    }

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
      p_preferred_rest_day: userData.restDay,
      p_challenge_days: userData.challengeDays,
      p_workout_plan: userData.workoutPlan,
      p_meal_plan: userData.mealPlan,
      p_start_date: startDate,
      p_intensity: userData.intensity,
      p_last_period_date: userData.lastPeriodDate ? userData.lastPeriodDate.toISOString().split('T')[0] : null,
      p_cycle_length: userData.cycleLength,
      p_bleeding_days: userData.bleedingDays,
      p_cycle_phases: cyclePhases.length > 0 ? cyclePhases : null,
    };

    console.log('RPC payload:', rpcPayload);

    const { data, error } = await supabase.rpc('insert_user_and_workout_plan', rpcPayload);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(`Failed to insert data into Supabase: ${error.message}`);
    }

    console.log('User data, workout plan, meal plan, and cycle phases successfully saved!', data);
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