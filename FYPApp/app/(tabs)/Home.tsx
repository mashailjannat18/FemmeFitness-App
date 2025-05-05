import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, BackHandler, Modal, TextInput, Button, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Circle, LinearGradient, Defs, Stop, Path, Rect } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { Calendar } from 'react-native-calendars';
import Logo from '@/assets/images/Logo.png';
import Water from '@/assets/images/4.png';
import type { Channel } from '@supabase/supabase-js';

type Exercise = {
  id: string;
  exercise_name: string;
  calories_burned: number;
  reps: string;
  description: string;
  daily_workout_id: string;
  image?: string;
};

type DailyWorkout = {
  id: string;
  day_name: string;
  daily_workout_date: string;
  focus: string;
  total_duration_min: number;
  total_calories_burned: number;
  exercises: Exercise[];
};

type DailyMeal = {
  id: string;
  daily_workout_id: string;
  daily_calories: number;
  carbs_grams: number;
  protein_grams: number;
  fat_grams: number;
  sleep_hours: number;
  water_litres: number;
};

type WorkoutDay = {
  day_number: number;
  day_name: string;
  date: string;
};

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  displayText?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 160,
  strokeWidth = 16,
  gradientId,
  displayText,
}): JSX.Element => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const stops =
    gradientId === 'caloriesBurntGradient'
      ? [
          { offset: '0%', stopColor: '#FF4040' },
          { offset: '100%', stopColor: '#8B0000' },
        ]
      : gradientId === 'caloriesGainedGradient'
      ? [
          { offset: '0%', stopColor: '#FF69B4' },
          { offset: '100%', stopColor: '#FF1493' },
        ]
      : [
          { offset: '0%', stopColor: '#BA55D3' },
          { offset: '100%', stopColor: '#4B0082' },
        ];

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {stops.map((stop, index) => (
              <Stop key={index} offset={stop.offset} stopColor={stop.stopColor} />
            ))}
          </LinearGradient>
        </Defs>
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={2}
        />
        <Circle
          stroke={`url(#${gradientId})`}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {displayText && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color:
                gradientId === 'caloriesBurntGradient'
                  ? '#FF4040'
                  : gradientId === 'caloriesGainedGradient'
                  ? '#ff1297'
                  : '#BA55D3',
            }}
          >
            {displayText}
          </Text>
        </View>
      )}
    </View>
  );
};

interface WaterGlassProps {
  progress: number;
  size?: number;
  actualLiters: number;
  expectedLiters: number;
  onLogPress: () => void;
}

const WaterGlass: React.FC<WaterGlassProps> = ({ actualLiters, expectedLiters, onLogPress }): JSX.Element => {
  return (
    <View style={{ height: 200, alignItems: 'center' }}>
      <Text style={styles.progressText}>{actualLiters.toFixed(1)}/{expectedLiters.toFixed(1)} L</Text>
      <Image
        source={Water}
        style={styles.water}
      />
      <TouchableOpacity style={styles.logButton1} onPress={onLogPress}>
        <Text style={styles.logButtonText}>Log Water</Text>
      </TouchableOpacity>
    </View>
  );
};

interface SleepCardProps {
  progress: number;
  expectedHours: number;
  onLogPress: () => void;
}

const SleepCard: React.FC<SleepCardProps> = ({ progress, expectedHours, onLogPress }): JSX.Element => {
  return (
    <View style={styles.sleepContainer}>
      <Svg width="100%" height="100%" style={styles.sleepBackground}>
        <Defs>
          <LinearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9C27B0" />
            <Stop offset="100%" stopColor="#673AB7" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx="16" fill="url(#sleepGradient)" />
      </Svg>
      <View style={styles.sleepContent}>
        <Text style={styles.sleepIcon}>🌙</Text>
        <Text style={styles.sleepTitle}>Sleep</Text>
        <Text style={styles.sleepProgressText}>
          {progress.toFixed(1)}/{expectedHours.toFixed(1)} hrs
        </Text>
        <TouchableOpacity style={styles.logButton} onPress={onLogPress}>
          <Text style={styles.logButtonText1}>Log Sleep</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function getCurrentMonth() {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getWorkoutDays(challengeDays: number, startDate: string): WorkoutDay[] {
  const days: WorkoutDay[] = [];
  const start = new Date(startDate);
  for (let i = 1; i <= challengeDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + (i - 1));
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    days.push({
      day_number: i,
      day_name: `Day ${i} (${dayName})`,
      date: date.toISOString().split('T')[0],
    });
  }
  return days;
}

const getTodayDate = () => {
  return new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
};

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [dailyMeal, setDailyMeal] = useState<DailyMeal | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [preferredRestDay, setPreferredRestDay] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalCaloriesToBurn, setTotalCaloriesToBurn] = useState(0);
  const [caloriesBurnedToday, setCaloriesBurnedToday] = useState(0);
  const [expectedCaloriesGained, setExpectedCaloriesGained] = useState(0);
  const [actualCaloriesGained, setActualCaloriesGained] = useState(0);
  const [currentDay, setCurrentDay] = useState(getTodayDate());
  const [sleepHours, setSleepHours] = useState<number>(0);
  const [expectedSleepHours, setExpectedSleepHours] = useState<number>(0);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [inputSleepHours, setInputSleepHours] = useState<string>('');
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [inputWaterLiters, setInputWaterLiters] = useState<string>('');
  const [actualWaterLiters, setActualWaterLiters] = useState<number>(0);
  const [expectedWaterLiters, setExpectedWaterLiters] = useState<number>(0);
  const [streak, setStreak] = useState(0);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean; dotColor?: string; selected?: boolean; selectedColor?: string } }>({});
  const [renderKey, setRenderKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useUserAuth();
  const schedulerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/Login');
      return;
    }
    fetchStreakAndCompletions();
  }, [user, router]);

  useEffect(() => {
    const checkDayChange = () => {
      const newDay = getTodayDate();
      if (newDay !== currentDay) {
        console.log('Day changed from', currentDay, 'to', newDay);
        setCurrentDay(newDay);
        setCurrentMonth(getCurrentMonth());
        fetchWorkoutData();
      }
    };
  
    const intervalId = setInterval(checkDayChange, 60 * 1000);
  
    return () => clearInterval(intervalId);
  }, [currentDay]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutData();
      const backAction = () => true;
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, [user])
  );

  useEffect(() => {
    const scheduleStreakReset = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      midnight.setDate(midnight.getDate() + 1);

      const timeUntilMidnight = midnight.getTime() - now.getTime();
      console.log('Time until next midnight:', timeUntilMidnight / (1000 * 60), 'minutes');

      const resetStreak = async () => {
        if (!user?.id) return;
        const localDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        const { error } = await supabase.rpc('reset_streak_local', { current_local_date: localDate });
        if (error) console.error('Error resetting streak:', error.message);
        else await fetchStreakAndCompletions();
      };

      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetStreak();
      }

      schedulerIntervalRef.current = setTimeout(() => {
        resetStreak();
        schedulerIntervalRef.current = setInterval(resetStreak, 24 * 60 * 60 * 1000);
      }, timeUntilMidnight);

      return () => {
        if (schedulerIntervalRef.current) {
          clearTimeout(schedulerIntervalRef.current);
          clearInterval(schedulerIntervalRef.current);
        }
      };
    };

    scheduleStreakReset();
  }, [user]);

  const fetchStreakAndCompletions = async () => {
    if (!user?.id) return;

    try {
      const { data: streakData, error: streakError } = await supabase
        .from('Streak')
        .select('current_streak, last_completion_date')
        .eq('user_id', user.id)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        console.error('Error fetching streak:', streakError.message);
        return;
      }

      if (streakData) {
        setStreak(streakData.current_streak || 0);
      } else {
        await supabase.from('Streak').insert({
          user_id: user.id,
          current_streak: 0,
          last_completion_date: null,
        });
        setStreak(0);
      }

      const { data: dailyWorkouts, error: dailyWorkoutsError } = await supabase
        .from('DailyWorkouts')
        .select('id, daily_workout_date')
        .eq('workout_plan_id', (await supabase
          .from('WorkoutPlans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()).data?.id);

      if (dailyWorkoutsError) {
        console.error('Error fetching daily workouts:', dailyWorkoutsError.message);
        return;
      }

      const dailyWorkoutIds = dailyWorkouts.map(dw => dw.id);
      const { data: exercises, error: exercisesError } = await supabase
        .from('Workouts')
        .select('id, daily_workout_id')
        .in('daily_workout_id', dailyWorkoutIds);

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError.message);
        return;
      }

      const exercisesByDailyWorkout: { [key: string]: number } = {};
      exercises.forEach(ex => {
        exercisesByDailyWorkout[ex.daily_workout_id] = (exercisesByDailyWorkout[ex.daily_workout_id] || 0) + 1;
      });

      const { data: completions, error: completionsError } = await supabase
        .from('ExerciseCompletions')
        .select('daily_workout_id, completion_date, status')
        .eq('user_id', user.id)
        .in('status', ['completed', 'skipped']);

      if (completionsError) {
        console.error('Error fetching completions for calendar:', completionsError.message);
        return;
      }

      const completionsByDailyWorkout: { [key: string]: number } = {};
      completions.forEach(comp => {
        if (comp.status === 'completed' || comp.status === 'skipped') {
          completionsByDailyWorkout[comp.daily_workout_id] = (completionsByDailyWorkout[comp.daily_workout_id] || 0) + 1;
        }
      });

      const completedOrSkippedDays: Set<string> = new Set();
      dailyWorkouts.forEach(dw => {
        const totalExercises = exercisesByDailyWorkout[dw.id] || 0;
        const completedOrSkippedExercises = completionsByDailyWorkout[dw.id] || 0;
        if (totalExercises > 0 && totalExercises === completedOrSkippedExercises) {
          const date = new Date(dw.daily_workout_date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
          completedOrSkippedDays.add(date);
        }
      });

      const today = getTodayDate();
      const newMarkedDates: { [key: string]: { marked: boolean; dotColor?: string; selected?: boolean; selectedColor?: string } } = {};

      completedOrSkippedDays.forEach(date => {
        newMarkedDates[date] = { marked: true, dotColor: '#FFA500', selected: true, selectedColor: '#FFA500' };
      });

      if (!completedOrSkippedDays.has(today)) {
        newMarkedDates[today] = { marked: true, dotColor: '#EC4899', selected: true, selectedColor: '#EC4899' };
      }

      setMarkedDates(newMarkedDates);
    } catch (error: any) {
      console.error('Error in fetchStreakAndCompletions:', error.message);
    }
  };

  const fetchWorkoutData = async () => {
    if (!user || !user.id) return;

    let completionSubscription: Channel<any> | null = null;
    let mealSubscription: Channel<any> | null = null;

    try {
      const { data: userData } = await supabase
        .from('User')
        .select('preferred_rest_day')
        .eq('id', user.id)
        .single();
      setPreferredRestDay(userData?.preferred_rest_day || null);

      const { data: planData, error: planError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date, challenge_days')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (planError || !planData) throw new Error('No active workout plan found.');

      console.log('Workout Plan:', { id: planData.id, startDate: planData.start_date, challengeDays: planData.challenge_days });

      const days = getWorkoutDays(planData.challenge_days || 30, planData.start_date);
      setWorkoutDays(days);

      const today = getTodayDate();
      const startOfDay = `${today} 00:00:00`;
      const endOfDay = `${today} 23:59:59`;

      console.log('Real-time Date (today):', today);

      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .select('id, day_name, daily_workout_date, focus, total_duration_min, total_calories_burned')
        .eq('workout_plan_id', planData.id)
        .eq('daily_workout_date', today)
        .single();

      console.log('Fetched Daily Workout:', dailyData, 'Error:', dailyError);

      if (!dailyError && dailyData) {
        if (dailyData.focus.toLowerCase().includes('rest')) {
          setDailyWorkout({
            id: dailyData.id,
            day_name: dailyData.day_name,
            daily_workout_date: dailyData.daily_workout_date,
            focus: dailyData.focus,
            total_duration_min: dailyData.total_duration_min,
            total_calories_burned: dailyData.total_calories_burned,
            exercises: [],
          });
          setProgressPercentage(0);
          setTotalCaloriesToBurn(0);
          setCaloriesBurnedToday(0);
          setExpectedCaloriesGained(0);
          setActualCaloriesGained(0);
        } else {
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('Workouts')
            .select('id, exercise_name, calories_burned, reps, description, daily_workout_id')
            .eq('daily_workout_id', dailyData.id);

          if (exerciseError) throw new Error('Error fetching exercises: ' + exerciseError.message);

          const totalCalories = exerciseData?.reduce((sum: number, exercise: Exercise) => sum + (exercise.calories_burned || 0), 0) || 0;
          setTotalCaloriesToBurn(totalCalories);

          const { data: completionData, error: completionError } = await supabase
            .from('ExerciseCompletions')
            .select('workout_id, calories_burned, status')
            .eq('user_id', user.id)
            .eq('daily_workout_id', dailyData.id)
            .gte('completion_date', startOfDay)
            .lte('completion_date', endOfDay);

          if (completionError) throw new Error('Error fetching completions: ' + completionError.message);

          const burnedCalories = completionData?.reduce((sum: number, completion: any) => sum + (completion.calories_burned || 0), 0) || 0;
          setCaloriesBurnedToday(burnedCalories);

          const totalExercises = exerciseData?.length || 1;
          const completedOrSkippedExercises = completionData?.filter(comp => comp.status === 'completed' || comp.status === 'skipped').length || 0;
          console.log(`Exercises for today (${today}): ${completedOrSkippedExercises} out of ${totalExercises} completed or skipped`);
          const calculatedPercentage = Math.round((completedOrSkippedExercises / totalExercises) * 100);

          setProgressPercentage(calculatedPercentage);
          setDailyWorkout({
            id: dailyData.id,
            day_name: dailyData.day_name,
            daily_workout_date: dailyData.daily_workout_date,
            focus: dailyData.focus,
            total_duration_min: dailyData.total_duration_min,
            total_calories_burned: dailyData.total_calories_burned,
            exercises: exerciseData || [],
          });

          completionSubscription = supabase
            .channel('exercise-completions-channel')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'ExerciseCompletions',
                filter: `user_id=eq.${user.id}`,
              },
              async (payload) => {
                console.log('ExerciseCompletions change received:', payload);
                const currentToday = getTodayDate();
                const currentStartOfDay = `${currentToday} 00:00:00`;
                const currentEndOfDay = `${currentToday} 23:59:59`;

                const { data: updatedCompletions, error: updatedError } = await supabase
                  .from('ExerciseCompletions')
                  .select('workout_id, calories_burned, status')
                  .eq('user_id', user.id)
                  .eq('daily_workout_id', dailyData.id)
                  .gte('completion_date', currentStartOfDay)
                  .lte('completion_date', currentEndOfDay);

                if (updatedError) {
                  console.error('Error fetching updated completions:', updatedError.message);
                  return;
                }

                const updatedBurnedCalories = updatedCompletions?.reduce((sum: number, completion: any) => sum + (completion.calories_burned || 0), 0) || 0;
                setCaloriesBurnedToday(updatedBurnedCalories);

                const updatedCompletedOrSkippedExercises = updatedCompletions?.filter(comp => comp.status === 'completed' || comp.status === 'skipped').length || 0;
                console.log(`Updated exercises for today (${currentToday}): ${updatedCompletedOrSkippedExercises} out of ${totalExercises} completed or skipped`);
                const updatedPercentage = Math.round((updatedCompletedOrSkippedExercises / totalExercises) * 100);
                setProgressPercentage(updatedPercentage);

                await fetchStreakAndCompletions();

                setRenderKey((prev) => prev + 1);
              }
            )
            .subscribe();
        }

        const { data: mealData, error: mealError } = await supabase
          .from('DailyMealPlans')
          .select('id, daily_workout_id, daily_calories, carbs_grams, protein_grams, fat_grams, calories_intake, water_litres, sleep_hours')
          .eq('daily_workout_id', dailyData.id)
          .single();

        if (!mealError && mealData) {
          setDailyMeal({
            id: mealData.id,
            daily_workout_id: mealData.daily_workout_id,
            daily_calories: mealData.daily_calories,
            carbs_grams: mealData.carbs_grams,
            protein_grams: mealData.protein_grams,
            fat_grams: mealData.fat_grams,
            sleep_hours: mealData.sleep_hours || 0,
            water_litres: mealData.water_litres || 0,
          });
          setExpectedCaloriesGained(mealData.daily_calories || 0);
          setActualCaloriesGained(mealData.calories_intake || 0);
          setExpectedWaterLiters(mealData.water_litres || 0);
          setExpectedSleepHours(mealData.sleep_hours || 0);

          mealSubscription = supabase
            .channel('daily-meal-plans-channel')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'DailyMealPlans',
                filter: `daily_workout_id=eq.${dailyData.id}`,
              },
              async (payload) => {
                console.log('DailyMealPlans change received:', payload);
                const { data: updatedMeal, error: updatedMealError } = await supabase
                  .from('DailyMealPlans')
                  .select('calories_intake, water_litres, sleep_hours')
                  .eq('daily_workout_id', dailyData.id)
                  .single();

                if (updatedMealError) {
                  console.error('Error fetching updated meal data:', updatedMealError.message);
                  return;
                }

                setActualCaloriesGained(updatedMeal.calories_intake || 0);
                setExpectedWaterLiters(updatedMeal.water_litres || 0);
                setExpectedSleepHours(updatedMeal.sleep_hours || 0);

                setRenderKey((prev) => prev + 1);
              }
            )
            .subscribe();
        } else {
          console.warn('No DailyMeal found for daily_workout_id:', dailyData.id, 'Error:', mealError?.message);
          setDailyMeal(null);
          setExpectedCaloriesGained(0);
          setActualCaloriesGained(0);
          setExpectedWaterLiters(0);
          setExpectedSleepHours(0);
        }

        await fetchSleepHours(today);
        await fetchWaterIntake(today);

        const waterSubscription = supabase
          .channel('daily-water-records-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'DailyWaterRecords',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              console.log('DailyWaterRecords change received:', payload);
              const currentToday = getTodayDate();
              await fetchWaterIntake(currentToday);
              setRenderKey((prev) => prev + 1);
            }
          )
          .subscribe();

        const sleepSubscription = supabase
          .channel('daily-sleep-records-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'DailySleepRecords',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              console.log('DailySleepRecords change received:', payload);
              const currentToday = getTodayDate();
              await fetchSleepHours(currentToday);
              setRenderKey((prev) => prev + 1);
            }
          )
          .subscribe();

        const streakSubscription = supabase
          .channel('streak-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Streak',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              console.log('Streak change received:', payload);
              await fetchStreakAndCompletions();
              setRenderKey((prev) => prev + 1);
            }
          )
          .subscribe();

        await fetchStreakAndCompletions();

        return () => {
          supabase.removeChannel(waterSubscription);
          supabase.removeChannel(sleepSubscription);
          supabase.removeChannel(streakSubscription);
          if (mealSubscription) supabase.removeChannel(mealSubscription);
          if (completionSubscription) supabase.removeChannel(completionSubscription);
        };
      } else {
        setDailyWorkout(null);
        setProgressPercentage(0);
        setTotalCaloriesToBurn(0);
        setCaloriesBurnedToday(0);
        setExpectedCaloriesGained(0);
        setActualCaloriesGained(0);
        setDailyMeal(null);
        setSleepHours(0);
        setExpectedSleepHours(0);
        setActualWaterLiters(0);
        setExpectedWaterLiters(0);
        setStreak(0);
        setMarkedDates({});
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      setDailyWorkout(null);
      setDailyMeal(null);
      setWorkoutDays([]);
      setProgressPercentage(0);
      setTotalCaloriesToBurn(0);
      setCaloriesBurnedToday(0);
      setExpectedCaloriesGained(0);
      setActualCaloriesGained(0);
      setSleepHours(0);
      setExpectedSleepHours(0);
      setActualWaterLiters(0);
      setExpectedWaterLiters(0);
      setStreak(0);
      setMarkedDates({});
    }
  };

  const fetchSleepHours = async (today: string) => {
    if (!user || !user.id) return;
    try {
      const { data: sleepData, error: sleepError } = await supabase
        .from('DailySleepRecords')
        .select('sleep_hours')
        .eq('user_id', user.id)
        .eq('sleep_date', today)
        .single();

      if (sleepError && sleepError.code !== 'PGRST116') {
        throw new Error('Error fetching sleep hours: ' + sleepError.message);
      }

      const newSleepHours = sleepData && sleepData.sleep_hours !== null ? sleepData.sleep_hours : 0;
      setSleepHours(newSleepHours);
    } catch (error) {
      console.error('Error fetching sleep hours:', error);
      setSleepHours(0);
    }
  };

  const fetchWaterIntake = async (today: string) => {
    if (!user || !user.id) return;
    try {
      const { data: waterData, error: waterError } = await supabase
        .from('DailyWaterRecords')
        .select('water_liters')
        .eq('user_id', user.id)
        .eq('water_date', today)
        .single();

      if (waterError && waterError.code !== 'PGRST116') {
        throw new Error('Error fetching water intake: ' + waterError.message);
      }

      const newWaterLiters = waterData && waterData.water_liters !== null ? waterData.water_liters : 0;
      setActualWaterLiters(newWaterLiters);
    } catch (error) {
      console.error('Error fetching water intake:', error);
      setActualWaterLiters(0);
    }
  };

  const handleLogSleep = async () => {
    if (!user || !user.id || !inputSleepHours) return;

    const hours = parseFloat(inputSleepHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      alert('Please enter a valid number of hours between 0 and 24.');
      return;
    }

    const today = getTodayDate();

    try {
      const { data: existingRecord, error: fetchError } = await supabase
        .from('DailySleepRecords')
        .select('id, sleep_hours')
        .eq('user_id', user.id)
        .eq('sleep_date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Error checking existing sleep record: ' + fetchError.message);
      }

      const previousHours = existingRecord && existingRecord.sleep_hours !== null ? existingRecord.sleep_hours : 0;
      const totalHours = previousHours + hours;

      if (totalHours > 24) {
        alert('Total sleep hours for the day cannot exceed 24 hours.');
        return;
      }

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from('DailySleepRecords')
          .update({ sleep_hours: totalHours, created_at: new Date().toISOString() })
          .eq('id', existingRecord.id);

        if (updateError) throw new Error('Error updating sleep hours: ' + updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from('DailySleepRecords')
          .insert({
            user_id: user.id,
            sleep_date: today,
            sleep_hours: hours,
            created_at: new Date().toISOString(),
          });

        if (insertError) throw new Error('Error logging sleep hours: ' + insertError.message);
      }

      await fetchSleepHours(today);
      setShowSleepModal(false);
      setInputSleepHours('');
      setRenderKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error logging sleep hours:', error);
      alert('Failed to log sleep hours. Please try again.');
    }
  };

  const handleLogWater = async () => {
    if (!user || !user.id || !inputWaterLiters) return;

    const liters = parseFloat(inputWaterLiters);
    if (isNaN(liters) || liters < 0) {
      alert('Please enter a valid number of liters (greater than or equal to 0).');
      return;
    }

    const today = getTodayDate();

    try {
      const { data: existingRecord, error: fetchError } = await supabase
        .from('DailyWaterRecords')
        .select('id, water_liters')
        .eq('user_id', user.id)
        .eq('water_date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Error checking existing water record: ' + fetchError.message);
      }

      const previousLiters = existingRecord && existingRecord.water_liters !== null ? existingRecord.water_liters : 0;
      const totalLiters = previousLiters + liters;

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from('DailyWaterRecords')
          .update({ water_liters: totalLiters, created_at: new Date().toISOString() })
          .eq('id', existingRecord.id);

        if (updateError) throw new Error('Error updating water intake: ' + updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from('DailyWaterRecords')
          .insert({
            user_id: user.id,
            water_date: today,
            water_liters: liters,
            created_at: new Date().toISOString(),
          });

        if (insertError) throw new Error('Error logging water intake: ' + insertError.message);
      }

      await fetchWaterIntake(today);
      setShowWaterModal(false);
      setInputWaterLiters('');
      setRenderKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error logging water intake:', error);
      alert('Failed to log water intake. Please try again.');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWorkoutData();
    setRefreshing(false);
  }, []);

  const navigateToExercises = (dayName: string) => {
    router.push({
      pathname: '/(screens)/Exercises',
      params: { day: dayName, source: 'Home' },
    });
  };

  const navigateToMealDetail = () => {
    if (!dailyWorkout || !dailyMeal) {
      console.warn('Cannot navigate to MealDetail: dailyWorkout or dailyMeal is null');
      return;
    }
    router.push({
      pathname: '/(screens)/MealDetail',
      params: {
        meal: dailyWorkout.day_name,
        dailyWorkoutId: dailyWorkout.id,
        from: 'home',
      },
    });
  };

  if (!user || !user.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Please Log In</Text>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/Login')}>
          <Text style={styles.seeAllText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const filteredWorkoutDays = workoutDays.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate.getMonth() === currentMonthIndex && dayDate.getFullYear() === currentYear;
  });

  return (
    <View key={renderKey} style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={Logo}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Home</Text>
        <Text style={styles.usernameText}>{user.username || 'User'}</Text>
      </View>
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
            colors={['#EC4899']}
          />
        }
      >
        <View style={[styles.card, styles.streakCard]}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>🔥 Current Streak</Text>
            <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)} style={styles.calendarButton}>
              <Text style={styles.calendarLink}>View Calendar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendarText}>
            <Text style={styles.month}>{currentMonth}</Text>
            <Text style={[styles.streakDays, { color: '#FFA500' }]}>{streak} day(s)</Text>
          </View>
          {showCalendar ? (
            <Calendar
              style={styles.calendar}
              theme={{
                calendarBackground: '#FFF',
                textSectionTitleColor: '#000',
                todayTextColor: '#000',
                dayTextColor: '#000',
                arrowColor: '#EC4899',
                selectedDayBackgroundColor: 'transparent',
                dotColor: '#FFA500',
              }}
              markedDates={markedDates}
            />
          ) : (
            <FlatList
              data={filteredWorkoutDays}
              keyExtractor={(item) => item.date}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
              renderItem={({ item }) => {
                const today = getTodayDate();
                const isCompletedOrSkipped = markedDates[item.date]?.dotColor === '#FFA500';
                const isCurrentDate = item.date === today;
                const backgroundColor = isCompletedOrSkipped ? '#FFA500' : isCurrentDate ? '#ff1297' : '#F3F4F6';
                const textColor = isCompletedOrSkipped || isCurrentDate ? '#FFFFFF' : '#1F2937';

                return (
                  <View
                    style={[
                      styles.dateItem,
                      { backgroundColor },
                      (isCompletedOrSkipped || isCurrentDate) && { width: 48, height: 72 },
                    ]}
                  >
                    <Text style={[styles.dateDay, { color: textColor }]}>
                      {item.date.split('-')[2]}
                    </Text>
                    <Text style={[styles.dateText, { color: textColor }]}>{item.day_number}</Text>
                    {isCurrentDate && !isCompletedOrSkipped && <View style={styles.currentDayIndicator} />}
                  </View>
                );
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressGrid}>
            <View style={[styles.progressCard, { height: 260 }]}>
              <Text style={styles.progressIcon}>📈</Text>
              <Text style={styles.progressTitle}>Calories Gained</Text>
              <CircularProgress
                progress={
                  expectedCaloriesGained > 0
                    ? Math.min((actualCaloriesGained / expectedCaloriesGained) * 100, 100)
                    : 0
                }
                gradientId="caloriesGainedGradient"
                displayText={`${actualCaloriesGained.toFixed(1)}/${expectedCaloriesGained.toFixed(1)} cal`}
              />
            </View>

            <View style={[styles.progressCard, { height: 260 }]}>
              <Text style={styles.progressIcon}>🔥</Text>
              <Text style={styles.progressTitle}>Calories Burnt</Text>
              <CircularProgress
                progress={totalCaloriesToBurn > 0 ? (caloriesBurnedToday / totalCaloriesToBurn) * 100 : 0}
                gradientId="caloriesBurntGradient"
                displayText={`${caloriesBurnedToday.toFixed(1)}/${totalCaloriesToBurn.toFixed(1)} cal`}
              />
            </View>

            <View style={[styles.progressCard, { height: 260 }]}>
              <SleepCard
                progress={sleepHours}
                expectedHours={expectedSleepHours}
                onLogPress={() => setShowSleepModal(true)}
              />
            </View>

            <View style={[styles.progressCard, { height: 260 }]}>
              <Text style={styles.progressIcon}>💧</Text>
              <Text style={styles.progressTitle}>Water</Text>
              <WaterGlass
                progress={expectedWaterLiters > 0 ? (actualWaterLiters / expectedWaterLiters) * 100 : 0}
                actualLiters={actualWaterLiters}
                expectedLiters={expectedWaterLiters}
                onLogPress={() => setShowWaterModal(true)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
          </View>
          {dailyWorkout ? (
            dailyWorkout.focus.toLowerCase().includes('rest') ? (
              <View style={[styles.card, styles.workoutCard]}>
                <Text style={styles.noWorkoutText}>Today is a Rest Day. No exercises scheduled.</Text>
              </View>
            ) : dailyWorkout.exercises.length > 0 ? (
              <TouchableOpacity
                style={[styles.card, styles.workoutCard]}
                onPress={() => navigateToExercises(dailyWorkout.day_name)}
              >
                <View style={styles.workoutRow}>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{dailyWorkout.day_name}</Text>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStatItem}>
                        <Text style={styles.workoutStatIcon}>🎯</Text>
                        <Text style={styles.workoutStatText}>
                          {dailyWorkout.focus}
                        </Text>
                      </View>
                      <View style={styles.workoutStatItem}>
                        <Text style={styles.workoutStatIcon}>⏰</Text>
                        <Text style={styles.workoutStatText}>
                          {dailyWorkout.total_duration_min} min
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.workoutProgress}>
                  <View style={[styles.progressBar, { width: `${progressPercentage}%` }]}>
                    <View style={styles.progressFill} />
                  </View>
                  <Text style={styles.progressLabel}>{progressPercentage}% completed</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={[styles.card, styles.workoutCard]}>
                <Text style={styles.noWorkoutText}>No exercises scheduled for today.</Text>
              </View>
            )
          ) : (
            <View style={[styles.card, styles.workoutCard]}>
              <Text style={styles.noWorkoutText}>No workout scheduled for today.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          </View>
          {dailyMeal ? (
            <TouchableOpacity
              style={[styles.card, styles.mealContainer]}
              onPress={navigateToMealDetail}
            >
              <Text style={styles.mealText}>{dailyWorkout?.day_name}</Text>
              <View style={styles.mealDetails}>
                <Text style={styles.mealDetailText}>
                  Calories: {dailyMeal.daily_calories.toFixed(1)} cal
                </Text>
                <Text style={styles.mealDetailText}>
                  Carbs: {dailyMeal.carbs_grams.toFixed(1)}g
                </Text>
                <Text style={styles.mealDetailText}>
                  Protein: {dailyMeal.protein_grams.toFixed(1)}g
                </Text>
                <Text style={styles.mealDetailText}>
                  Fat: {dailyMeal.fat_grams.toFixed(1)}g
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, styles.mealContainer]}>
              <Text style={styles.noMealText}>No meal plan available for today.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showSleepModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSleepModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Log Sleep Hours</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter hours slept (e.g., 7.5)"
              keyboardType="numeric"
              value={inputSleepHours}
              onChangeText={setInputSleepHours}
            />
            <View style={styles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowSleepModal(false);
                  setInputSleepHours('');
                }}
                color="#FF4040"
              />
              <Button
                title="Save"
                onPress={handleLogSleep}
                color="#10B981"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWaterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWaterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Log Water Intake</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter liters of water (e.g., 0.5)"
              keyboardType="numeric"
              value={inputWaterLiters}
              onChangeText={setInputWaterLiters}
            />
            <View style={styles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowWaterModal(false);
                  setInputWaterLiters('');
                }}
                color="#FF4040"
              />
              <Button
                title="Save"
                onPress={handleLogWater}
                color="#10B981"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ff1297',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  streakCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
    paddingLeft: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: -5,
  },
  calendarButton: {
    marginLeft: 'auto',
  },
  calendarLink: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#ff77c3',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 20,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarText: {
    display: 'flex',
    flexDirection: 'row',
  },
  month: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  streakDays: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 'auto',
  },
  dateList: {
    paddingVertical: 8,
  },
  dateItem: {
    width: 44,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentDayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  calendar: {
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    marginVertical: 20,
    backgroundColor: '#EC4899',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  progressIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  water: {
    width: 50,
    height: 80,
  },
  sleepContainer: {
    borderRadius: 16,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  sleepBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sleepContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 16,
  },
  sleepIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#FFF',
  },
  sleepTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sleepProgressText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  logButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logButton1: {
    backgroundColor: '#5bc6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  logButtonText1: {
    color: '#9C27B0',
    fontSize: 10,
    fontWeight: '600',
  },
  logButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  workoutCard: {
    padding: 0,
    overflow: 'hidden',
  },
  workoutRow: {
    flexDirection: 'row',
    padding: 16,
  },
  workoutInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
  },
  workoutStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatIcon: {
    marginRight: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: '#4B5563',
  },
  workoutProgress: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    padding: 16,
  },
  mealContainer: {
    padding: 16,
  },
  mealText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  mealDetails: {
    width: '100%',
    alignItems: 'flex-start',
  },
  mealDetailText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 2,
  },
  noMealText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});