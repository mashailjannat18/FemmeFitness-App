// Exercises.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Exercise = {
  id: number; // Match bigint type
  exercise_name: string;
  target_muscle: string;
  type: string;
  difficulty: string;
  caution: string | null;
  sets: number;
  reps: string;
  rest_time_sec: number;
  duration_min: number;
  calories_burned: number;
  description: string;
  workout_date: string;
};

const Exercises: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();

  useEffect(() => {
    if (user?.id && day) {
      fetchExercises();
    } else {
      console.log('Cannot fetch exercises: user.id or day is missing', { userId: user?.id, day });
      setLoading(false);
    }
  }, [user?.id, day]);

  const fetchExercises = async () => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      // Convert user.id to a number since user_id in WorkoutPlans is a bigint
      const userId = parseInt(user.id, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID: ' + user.id);
      }

      console.log('Fetching exercises for user:', userId, 'on day:', day);

      // Step 1: Fetch the active workout plan for the user
      const { data: planData, error: planError } = await supabase
        .from('WorkoutPlans')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (planError || !planData) {
        console.error('Error fetching workout plan:', planError);
        throw new Error('No active workout plan found for user ' + userId);
      }

      console.log('Workout plan found:', planData);

      // Step 2: Fetch the daily workout for the specified day
      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .select('id')
        .eq('workout_plan_id', planData.id)
        .eq('day_name', day)
        .single();

      if (dailyError || !dailyData) {
        console.error('Error fetching daily workout:', dailyError);
        throw new Error(`No daily workout found for day ${day} in workout plan ${planData.id}`);
      }

      console.log('Daily workout found:', dailyData);

      // Step 3: Fetch exercises for the daily workout
      const { data, error } = await supabase
        .from('Workouts')
        .select(`
          id,
          exercise_name,
          target_muscle,
          type,
          difficulty,
          caution,
          sets,
          reps,
          rest_time_sec,
          duration_min,
          calories_burned,
          description,
          workout_date
        `)
        .eq('daily_workout_id', dailyData.id);

      if (error) {
        console.error('Supabase error fetching exercises:', error);
        throw new Error('Error fetching exercises for daily workout ' + dailyData.id);
      }

      if (!data || data.length === 0) {
        console.log('No exercises found for daily workout:', dailyData.id);
        setExercises([]);
      } else {
        console.log('Exercises fetched for user', userId, ':', data);
        setExercises(data as Exercise[]);
      }
    } catch (err: any) {
      console.error('Error in fetchExercises:', err.message || err);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExercisePress = (exerciseId: number) => {
    console.log('Navigating to ExerciseDetail with exerciseId:', exerciseId);
    router.push({
      pathname: '/(screens)/ExerciseDetail',
      params: { id: exerciseId.toString() }, // Convert to string for navigation
    });
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item.id)}
    >
      <Text style={styles.exerciseName}>{item.exercise_name}</Text>
      <Text style={styles.exerciseDetail}>Target: {item.target_muscle}</Text>
      <Text style={styles.exerciseDetail}>Type: {item.type}</Text>
      <Text style={styles.exerciseDetail}>Difficulty: {item.difficulty}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercises for {day || 'Selected Day'}</Text>
      {exercises.length === 0 ? (
        <Text style={styles.noExercisesText}>No exercises found for this day.</Text>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id.toString()} // Convert to string for FlatList key
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noExercisesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Exercises;