import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserAuth } from '@/context/UserAuthContext';

// Define types for the nested relational data
type WorkoutPlan = {
  id: string;
  user_id: string;
};

type DailyWorkout = {
  id: string;
  workout_plan_id: string;
  WorkoutPlans: WorkoutPlan[];
};

type ExerciseDetailType = {
  id: string;
  exercise_name: string;
  description: string;
  reps: string;
  calories_burned: number;
  daily_workout_id: string;
  workout_date: string;
  DailyWorkouts: DailyWorkout[];
};

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetailType | null>(null);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || !user.id) {
      console.log('No user logged in, redirecting to Login');
      router.push('/Login');
      return;
    }

    if (id) {
      console.log('Logged-in user:', user);
      fetchExerciseDetail(id);
    }
  }, [id, user, router]);

  const fetchExerciseDetail = async (exerciseId: string) => {
    try {
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }

      // Fetch the exercise details and verify it belongs to the logged-in user
      const { data, error } = await supabase
        .from('Workouts')
        .select(`
          id,
          exercise_name,
          description,
          reps,
          calories_burned,
          daily_workout_id,
          workout_date,
          DailyWorkouts (
            id,
            workout_plan_id,
            WorkoutPlans (
              id,
              user_id
            )
          )
        `)
        .eq('id', exerciseId)
        .single();

      if (error) {
        console.error('Error fetching exercise detail:', error);
        throw new Error('Error fetching exercise detail: ' + error.message);
      }

      if (!data) {
        console.log('No exercise found with ID:', exerciseId);
        throw new Error('Exercise not found');
      }

      // Verify that the exercise belongs to the logged-in user
      const dailyWorkout = data.DailyWorkouts?.[0];
      const workoutPlan = dailyWorkout?.WorkoutPlans?.[0];
      const userIdFromWorkout = workoutPlan?.user_id;

      if (!dailyWorkout || !workoutPlan || !userIdFromWorkout) {
        console.error('Missing relational data for exercise:', exerciseId);
        throw new Error('Unable to verify ownership of this exercise');
      }

      if (userIdFromWorkout.toString() !== user.id) {
        console.error('Exercise does not belong to user:', user.id);
        throw new Error('You do not have permission to view this exercise');
      }

      // Extract the exercise details
      const exerciseData: ExerciseDetailType = {
        id: data.id,
        exercise_name: data.exercise_name,
        description: data.description || 'No description available',
        reps: data.reps,
        calories_burned: data.calories_burned,
        daily_workout_id: data.daily_workout_id,
        workout_date: data.workout_date,
        DailyWorkouts: data.DailyWorkouts,
      };

      console.log('Exercise detail for user', user.id, ':', exerciseData);

      setExerciseDetail(exerciseData);
    } catch (err: any) {
      console.error('Unexpected error in fetchExerciseDetail:', err);
      Alert.alert('Error', err.message || 'An unexpected error occurred while fetching exercise details.');
      setExerciseDetail(null);
    }
  };

  const handleDonePress = async () => {
    if (!id) return;
    try {
      const storedExercises = await AsyncStorage.getItem('completedExercises');
      const completedExercises = storedExercises ? JSON.parse(storedExercises) : [];

      if (!completedExercises.includes(id)) {
        const updatedExercises = [...completedExercises, id];
        await AsyncStorage.setItem('completedExercises', JSON.stringify(updatedExercises));
        console.log('Marked exercise as completed:', id);
      }

      router.push('/(screens)/Exercises');
    } catch (error) {
      console.error('Error saving completed exercise:', error);
      Alert.alert('Error', 'Failed to save completed exercise.');
    }
  };

  if (!exerciseDetail) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{exerciseDetail.exercise_name}</Text>
        <Text style={styles.subHeaderText}>
          Date: {exerciseDetail.workout_date || 'Not available'}
        </Text>
      </View>

      <Image source={{ uri: 'https://via.placeholder.com/230' }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>Description</Text>
        <Text style={styles.description}>{exerciseDetail.description}</Text>

        <Text style={styles.title}>Details</Text>
        <Text style={styles.description}>Reps: {exerciseDetail.reps}</Text>
        <Text style={styles.description}>Calories Burned: {exerciseDetail.calories_burned}</Text>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#d63384',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -25,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 230,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 30,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  doneButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});