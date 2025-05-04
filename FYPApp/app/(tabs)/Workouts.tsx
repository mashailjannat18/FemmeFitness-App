import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../../assets/images/Logo.png';

type DailyWorkout = {
  id: string;
  day_name: string;
  day_number: number;
  daily_workout_date: string;
  focus: string;
  total_calories_burned: number;
  total_duration_min: number;
  isAllCompletedOrSkipped: boolean;
};

export default function Workouts() {
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkout[]>([]);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/Login');
      return;
    }

    const fetchWorkoutPlan = async () => {
      try {
        // Step 1: Fetch the active workout plan
        const { data: planData, error: planError } = await supabase
          .from('WorkoutPlans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (planError || !planData) {
          throw new Error('No active workout plan found');
        }

        // Step 2: Fetch daily workouts
        const { data: dailyData, error: dailyError } = await supabase
          .from('DailyWorkouts')
          .select('id, day_name, day_number, daily_workout_date, focus, total_calories_burned, total_duration_min')
          .eq('workout_plan_id', planData.id)
          .order('day_number', { ascending: true });

        if (dailyError) {
          throw new Error('Error fetching daily workouts: ' + dailyError.message);
        }

        if (!dailyData || dailyData.length === 0) {
          setDailyWorkouts([]);
          return;
        }

        // Step 3: Fetch total exercises per day from Workouts table
        const dailyWorkoutIds = dailyData.map((day) => day.id);
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('Workouts')
          .select('daily_workout_id, id')
          .in('daily_workout_id', dailyWorkoutIds);

        if (workoutsError) {
          throw new Error('Error fetching workouts: ' + workoutsError.message);
        }

        // Count total exercises per day
        const totalExercisesPerDay: { [key: string]: number } = {};
        workoutsData.forEach((workout) => {
          const dailyWorkoutId = workout.daily_workout_id.toString();
          totalExercisesPerDay[dailyWorkoutId] = (totalExercisesPerDay[dailyWorkoutId] || 0) + 1;
        });

        // Step 4: Fetch completed/skipped exercises from ExerciseCompletions table
        const { data: completionsData, error: completionsError } = await supabase
          .from('ExerciseCompletions')
          .select('daily_workout_id, status')
          .in('daily_workout_id', dailyWorkoutIds)
          .in('status', ['completed', 'skipped']);

        if (completionsError) {
          throw new Error('Error fetching exercise completions: ' + completionsError.message);
        }

        // Count completed/skipped exercises per day
        const completedExercisesPerDay: { [key: string]: number } = {};
        completionsData.forEach((completion) => {
          const dailyWorkoutId = completion.daily_workout_id.toString();
          completedExercisesPerDay[dailyWorkoutId] = (completedExercisesPerDay[dailyWorkoutId] || 0) + 1;
        });

        // Step 5: Add isAllCompletedOrSkipped field to each daily workout
        const updatedDailyWorkouts = dailyData.map((day) => {
          const dailyWorkoutId = day.id.toString();
          const totalExercises = totalExercisesPerDay[dailyWorkoutId] || 0;
          const completedExercises = completedExercisesPerDay[dailyWorkoutId] || 0;
          const isAllCompletedOrSkipped = totalExercises > 0 && completedExercises === totalExercises;
          return {
            ...day,
            isAllCompletedOrSkipped,
          };
        });

        setDailyWorkouts(updatedDailyWorkouts);
      } catch (error: any) {
        console.error('Error fetching workout plan:', error.message);
        setDailyWorkouts([]);
      }
    };

    fetchWorkoutPlan();
  }, [user, router]);

  const navigateToExercises = (dayName: string) => {
    router.push({
      pathname: '/(screens)/Exercises',
      params: { day: dayName, source: 'Workouts' },
    });
  };

  if (!user || !user.id) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.headerText}>Workouts</Text>
          <Text style={styles.usernameText}>Guest</Text>
        </View>
        <Text style={styles.title}>Please Log In</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/Login')}>
          <Text style={styles.workoutTitle}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.headerText}>Workouts</Text>
        <Text style={styles.usernameText}>{user.username || 'User'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image source={require('../../assets/images/2.jpg')} style={styles.image} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Workout of the Day</Text>
          <Text style={styles.description}>Select a day to view its workout plan.</Text>

          <View style={styles.options}>
            {dailyWorkouts.length > 0 ? (
              dailyWorkouts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigateToExercises(item.day_name)}
                  style={styles.calendarDay}
                >
                  <View style={styles.dayContainer}>
                    <View style={styles.dayNumberContainer}>
                      <View style={styles.dayNumberSquare}>
                        <Text style={styles.dayNumberText}>{item.day_number}</Text>
                      </View>
                      <View style={styles.separator} />
                    </View>

                    <View style={styles.workoutInfo}>
                      <Text style={styles.dayFocus}>{item.focus}</Text>
                      <View style={styles.dayStats}>
                        <View style={styles.statItem}>
                          <MaterialIcons name="local-fire-department" size={scaleFont(14)} color="#FFA500" />
                          <Text style={styles.statText}>{item.total_calories_burned || 0} cal</Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialIcons name="access-time" size={scaleFont(14)} color="#1E90FF" />
                          <Text style={styles.statText}>{item.total_duration_min || 0} min</Text>
                        </View>
                      </View>
                    </View>

                    {item.isAllCompletedOrSkipped && (
                      <View style={styles.rightSection}>
                        <View style={styles.separator} />
                        <MaterialIcons name="check-circle" size={scaleFont(20)} color="#FF1493" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noWorkoutsText}>No workout plan available.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Responsive utilities
const { width, height } = Dimensions.get('window');
const scale = (size: number) => Math.min(width, 500) / 375 * size; // Cap at 500px for large screens
const scaleFont = (size: number) => Math.round(Math.min(width, 500) / 375 * size);
const isLargeScreen = width >= 600;

// Responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(12),
    backgroundColor: 'white',
  },
  title: {
    fontSize: scaleFont(22),
    fontWeight: 'bold',
    marginVertical: scale(12),
    color: '#FF1493',
    textAlign: 'center',
  },
  description: {
    fontSize: scaleFont(14),
    marginBottom: scale(12),
    color: '#555',
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: scale(12),
    backgroundColor: 'white',
  },
  calendarDay: {
    width: isLargeScreen ? '31%' : width < 400 ? '100%' : '48%', // 1 column on small, 2 on medium, 3 on large
    backgroundColor: '#fff',
    borderRadius: scale(10),
    padding: scale(10),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dayNumberContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(10),
  },
  dayNumberSquare: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(8),
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  separator: {
    height: scale(36),
    width: scale(1),
    backgroundColor: '#e0e0e0',
    marginHorizontal: scale(8),
  },
  workoutInfo: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: scale(8),
  },
  dayFocus: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(6),
  },
  dayStats: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(8),
    marginBottom: scale(4),
    backgroundColor: 'white',
  },
  statText: {
    fontSize: scaleFont(12),
    color: '#555',
    marginLeft: scale(4),
  },
  rightSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  noWorkoutsText: {
    fontSize: scaleFont(14),
    color: '#555',
    textAlign: 'center',
    marginTop: scale(12),
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: scale(12),
    marginVertical: scale(8),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#FF1493',
  },
});