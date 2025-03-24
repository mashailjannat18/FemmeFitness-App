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

let userData: UserData = {
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

export const setUserData = (screenKey: keyof UserData, data: number | string | string[]): void => {
  userData = {
    ...userData,
    [screenKey]: data,
  };
};

export const getUserData = (): UserData => {
  return { ...userData };
};

export const addUserToSupabase = async (): Promise<void> => {
  try {
    console.log('Starting addUserToSupabase with userData:', userData);

    // Step 1: Insert user into Supabase and get user_id
    console.log('Inserting user into Supabase...');
    const { data: userDataResponse, error: userError } = await supabase
      .from('User') // Assuming table is named 'User' based on your code
      .insert([
        {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          age: userData.age,
          height: userData.height,
          diseases: Array.isArray(userData.diseases)
            ? userData.diseases.join(', ')
            : userData.diseases,
          areas_of_focus: Array.isArray(userData.areasOfFocus)
            ? userData.areasOfFocus.join(', ')
            : userData.areasOfFocus,
          weight: userData.weight,
          activity_level: userData.activityLevel,
          preferred_rest_days: userData.restDays[0] || 'Sunday',
          goal: userData.goal,
          challenge_days: userData.challengeDays,
        },
      ])
      .select('id')
      .single();

    if (userError) {
      console.error('Supabase user insert error:', userError);
      throw new Error(`Failed to insert user into Supabase: ${userError.message}`);
    }

    const userId = userDataResponse.id;
    console.log(`User stored in 'users' table with id: ${userId}`);

    // Step 2: Send user data to backend to generate workout plan
    const goalMap: { [key: string]: string } = {
      "Lose weight": "weight_loss",
      "Gain weight": "gain_weight",
      "Muscle build": "build_muscle",
      "Stay fit": "stay_fit",
    };

    const payload = {
      age: Number(userData.age),
      activityLevel: Number(userData.activityLevel),
      goal: goalMap[userData.goal] || userData.goal,
      weight: Number(userData.weight),
      challengeDays: Number(userData.challengeDays),
      preferredRestDay: userData.restDays[0] || 'Sunday',
    };
    console.log('Sending payload to backend:', payload);

    console.log('Making fetch request to backend...');
    const response = await fetch('http://192.168.1.7:5000/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Fetch response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response error:', errorText);
      throw new Error(`Failed to generate workout plan: ${response.status} - ${errorText || 'No error message provided'}`);
    }

    const workoutPlan = await response.json();
    console.log('Workout plan generated:', workoutPlan);

    // Step 3: Store workout plan in Supabase
    console.log('Inserting workout plan into Supabase...');
    const { data: planData, error: planError } = await supabase
      .from('WorkoutPlans')
      .insert([
        {
          user_id: userId,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + userData.challengeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
        },
      ])
      .select('id')
      .single();

    if (planError) {
      console.error('Supabase workout plan insert error:', planError);
      throw new Error(`Failed to insert workout plan into Supabase: ${planError.message}`);
    }

    const workoutPlanId = planData.id;
    console.log(`Workout plan stored in 'WorkoutPlans' table with id: ${workoutPlanId}`);

    // Step 4: Store daily workouts and exercises
    for (const dailyWorkout of workoutPlan.plan) {
      console.log('Inserting daily workout for day:', dailyWorkout.Day);
      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .insert([
          {
            workout_plan_id: workoutPlanId,
            day_number: parseInt(dailyWorkout.Day.match(/\d+/)![0], 10),
            day_name: dailyWorkout.Day,
            focus: dailyWorkout.Focus,
            total_duration_min: dailyWorkout['Total Duration (min)'],
            total_calories_burned: dailyWorkout['Total Calories Burned'],
          },
        ])
        .select('id')
        .single();

      if (dailyError) {
        console.error('Supabase daily workout insert error:', dailyError);
        throw new Error(`Failed to insert daily workout into Supabase: ${dailyError.message}`);
      }

      const dailyWorkoutId = dailyData.id;
      console.log(`Daily workout stored in 'DailyWorkouts' table with id: ${dailyWorkoutId} for day: ${dailyWorkout.Day}`);

      // Step 5: Store exercises for this daily workout, including description
      for (const exercise of dailyWorkout.Workouts) {
        console.log('Inserting exercise:', exercise.Name);
        const { error: exerciseError } = await supabase
          .from('Workouts')
          .insert([
            {
              daily_workout_id: dailyWorkoutId,
              exercise_name: exercise.Name,
              target_muscle: exercise['Target Muscle'],
              type: exercise.Type,
              met_value: exercise['MET Value'],
              difficulty: exercise.Difficulty,
              sets: exercise.Sets,
              reps: exercise.Reps.toString(),
              rest_time_sec: exercise['Rest Time (sec)'],
              duration_min: exercise['Duration (min)'],
              calories_burned: exercise['Calories Burned'],
              description: exercise.Description, // Add description field
            },
          ]);

        if (exerciseError) {
          console.error('Supabase exercise insert error:', exerciseError);
          throw new Error(`Failed to insert exercise into Supabase: ${exerciseError.message}`);
        }

        console.log(`Exercise '${exercise.Name}' stored in 'Workouts' table for daily_workout_id: ${dailyWorkoutId}`);
      }
    }

    console.log('User data and workout plan successfully saved!');
  } catch (err) {
    console.error('Error in addUserToSupabase:', err);
    throw err; // Re-throw to ensure Question10 catches it
  }
};