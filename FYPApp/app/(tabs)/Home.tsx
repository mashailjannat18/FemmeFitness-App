import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

type Exercise = {
  id: string;
  exercise_name: string;
  calories_burned: number;
  reps: string;
  description: string;
  daily_workout_id: string;
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
  day_number: number;
  daily_calories: number;
  carbs_grams: number;
  protein_grams: number;
  fat_grams: number;
};

type WorkoutDay = {
  day_number: number;
  day_name: string;
  date: string;
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

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [dailyMeal, setDailyMeal] = useState<DailyMeal | null>(null); // New state for meal data
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || !user.id) {
      console.log('No user logged in or invalid user ID, redirecting to Login');
      router.push('/Login');
      return;
    }

    console.log('Logged-in user:', user);
    fetchWorkoutData();
  }, [user, router]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => true;
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, [])
  );

  const fetchWorkoutData = async () => {
    if (!user || !user.id) {
      console.log('Cannot fetch workout data: user or user.id is missing');
      return;
    }

    try {
      // Step 1: Fetch the user's active workout plan
      const { data: planData, error: planError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date, challenge_days')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (planError || !planData) {
        console.error('Error fetching workout plan for user', user.id, ':', planError);
        throw new Error('No active workout plan found for this user. Please create a new workout plan.');
      }

      console.log('WorkoutPlans query result for user', user.id, ':', { planData, planError });

      const days = getWorkoutDays(planData.challenge_days || 30, planData.start_date);
      setWorkoutDays(days);

      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching workout and meal for today:', today, 'for user', user.id);
      console.log('Workout plan ID:', planData.id);

      // Step 2: Fetch the daily workout for today
      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .select('id, day_name, daily_workout_date, focus, total_duration_min, total_calories_burned')
        .eq('workout_plan_id', planData.id)
        .eq('daily_workout_date', today)
        .single();

      if (dailyError || !dailyData) {
        console.log('No workout found for today for user', user.id, ':', dailyError?.message || 'No data');
        setDailyWorkout(null);
      } else {
        console.log('DailyWorkouts query result for user', user.id, ':', { dailyData, dailyError });

        const { data: exerciseData, error: exerciseError } = await supabase
          .from('Workouts')
          .select('id, exercise_name, calories_burned, reps, description, daily_workout_id')
          .eq('daily_workout_id', dailyData.id);

        if (exerciseError) {
          console.error('Error fetching exercises for user', user.id, ':', exerciseError);
          throw new Error('Error fetching exercises: ' + exerciseError.message);
        }

        console.log('Workouts query result for user', user.id, ':', { exerciseData, exerciseError });

        setDailyWorkout({
          id: dailyData.id,
          day_name: dailyData.day_name,
          daily_workout_date: dailyData.daily_workout_date,
          focus: dailyData.focus,
          total_duration_min: dailyData.total_duration_min,
          total_calories_burned: dailyData.total_calories_burned,
          exercises: exerciseData || [],
        });
      }

      // Step 3: Fetch the daily meal for today
      const { data: mealData, error: mealError } = await supabase
        .from('DailyMealPlans')
        .select('id, day_number, daily_calories, carbs_grams, protein_grams, fat_grams')
        .eq('workout_plan_id', planData.id)
        .eq('day_number', days.find((day) => day.date === today)?.day_number || 0)
        .single();

      if (mealError || !mealData) {
        console.log('No meal plan found for today for user', user.id, ':', mealError?.message || 'No data');
        setDailyMeal(null);
      } else {
        console.log('DailyMealPlans query result for user', user.id, ':', { mealData, mealError });
        setDailyMeal({
          id: mealData.id,
          day_number: mealData.day_number,
          daily_calories: mealData.daily_calories,
          carbs_grams: mealData.carbs_grams,
          protein_grams: mealData.protein_grams,
          fat_grams: mealData.fat_grams,
        });
      }
    } catch (error: any) {
      console.error('Error fetching workout or meal data for user', user?.id, ':', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred while fetching data.');
      setDailyWorkout(null);
      setDailyMeal(null);
      setWorkoutDays([]);
    }
  };

  const navigateToExercises = (dayName: string) => {
    router.push(`/(screens)/Exercises?day=${dayName}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section1}>
        <View style={styles.streakHeadingContainer}>
          <Text style={styles.streakText}>Streak</Text>
          <Text style={styles.monthText}>{currentMonth}</Text>
        </View>

        <FlatList
          data={workoutDays}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dateCircle}
              onPress={() => navigateToExercises(item.day_name)}
            >
              <Text style={styles.dateText}>{item.day_number}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.datesContainer}
        />

        <TouchableOpacity onPress={() => console.log('Open Calendar')}>
          <Text style={styles.linkText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section2}>
        <Text style={styles.heading1}>Daily Progress</Text>
        {[
          { title: 'Calories Burnt', value: 300, target: 500 },
          { title: 'Calories Gained', value: 1500, target: 2000 },
          { title: 'Sleep Intake', value: 6, target: 8 },
          { title: 'Water Intake', value: 2, target: 3 },
        ].map((item, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <Text style={styles.progressTitle}>{item.title}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${(item.value / item.target) * 100}%` }]}
                />
              </View>
              <Text style={styles.progressValue}>{item.value}/{item.target}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section3}>
        <Text style={styles.heading}>Today's Workout</Text>
        {dailyWorkout ? (
          dailyWorkout.focus.toLowerCase().includes('rest') ? (
            <Text style={styles.noWorkoutText}>Today is a Rest Day. No exercises scheduled.</Text>
          ) : (
            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => navigateToExercises(dailyWorkout.day_name)}
            >
              <Text style={styles.dayButtonText}>{dailyWorkout.day_name}</Text>
              <View style={styles.buttonDetails}>
                <Text style={styles.buttonDetailText}>
                  Duration: {dailyWorkout.total_duration_min} min
                </Text>
                <Text style={styles.buttonDetailText}>
                  Calories: {dailyWorkout.total_calories_burned} cal
                </Text>
              </View>
            </TouchableOpacity>
          )
        ) : (
          <Text style={styles.noWorkoutText}>No workout scheduled for today.</Text>
        )}
      </View>

      <View style={styles.section4}>
        <Text style={styles.heading}>Today's Meal</Text>
        {dailyMeal ? (
          <View style={styles.mealContainer}>
            <Text style={styles.mealText}>Day {dailyMeal.day_number}</Text>
            <View style={styles.mealDetails}>
              <Text style={styles.mealDetailText}>
                Calories: {dailyMeal.daily_calories.toFixed(1)} kcal
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
          </View>
        ) : (
          <Text style={styles.noMealText}>No meal plan available for today.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  streakHeadingContainer: {
    flexDirection: 'row',
    gap: 145,
  },
  monthText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
  },
  streakText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
  },
  datesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCircle: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateText: {
    fontSize: 16,
    color: 'black',
  },
  linkText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  section1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 100,
  },
  section2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 25,
  },
  section3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  section4: {
    marginBottom: 50,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -115,
  },
  progressBarContainer: {
    marginVertical: 7,
    width: '100%',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 7.5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d63384',
  },
  progressValue: {
    fontSize: 14,
    color: 'black',
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  dayButton: {
    backgroundColor: '#d63384',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonDetailText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  // New styles for meal display
  mealContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mealText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mealDetails: {
    width: '100%',
    alignItems: 'flex-start',
  },
  mealDetailText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 2,
  },
  noMealText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
});