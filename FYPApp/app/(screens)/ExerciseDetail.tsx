import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserAuth } from '@/context/UserAuthContext';

type WorkoutPlan = {
  id: number;
  user_id: number;
};

type DailyWorkout = {
  id: number;
  workout_plan_id: number;
  WorkoutPlans: WorkoutPlan;
};

type ExerciseDetailType = {
  id: number;
  exercise_name: string;
  description: string;
  reps: string;
  calories_burned: number;
  daily_workout_id: number;
  workout_date: string;
  duration_min: number;
  sets: number;
  rest_time_sec: number;
  target_muscle: string;
  type: string;
  difficulty: string;
  caution: string | null;
  DailyWorkouts: DailyWorkout;
};

export default function ExerciseDetail() {
  const { id: idString } = useLocalSearchParams<{ id: string }>();

  const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetailType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    console.log('ExerciseDetail useEffect triggered with idString:', idString, 'user:', user);

    if (!user || !user.id) {
      console.log('No user logged in, redirecting to Login');
      setErrorMessage('No user logged in. Redirecting to Login...');
      setTimeout(() => {
        router.push('/Login');
      }, 2000);
      setIsLoading(false);
      return;
    }

    if (idString) {
      const exerciseId = parseInt(idString, 10);
      if (isNaN(exerciseId)) {
        console.error('Invalid exercise ID:', idString);
        setErrorMessage('Invalid exercise ID. Please go back and select a valid exercise.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching exercise detail for exerciseId:', exerciseId);
      const fetchData = async () => {
        try {
          await fetchExerciseDetail(exerciseId);
        } catch (err: any) {
          console.error('Error in fetchExerciseDetail:', err);
          setErrorMessage(err.message || 'Failed to load exercise details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      const timeout = setTimeout(() => {
        if (isLoading) {
          console.error('Fetch exercise detail timed out after 10 seconds');
          setErrorMessage('Request timed out. Please check your internet connection and try again.');
          setIsLoading(false);
        }
      }, 10000);

      fetchData();

      return () => clearTimeout(timeout);
    } else {
      console.error('No exerciseId provided');
      setErrorMessage('No exercise selected. Please go back and select an exercise.');
      setIsLoading(false);
    }
  }, [idString, user, router]);

  const fetchExerciseDetail = async (exerciseId: number) => {
    console.log('Starting fetchExerciseDetail for exerciseId:', exerciseId);

    if (!user || !user.id) {
      console.error('User not logged in');
      throw new Error('User not logged in');
    }

    console.log('Fetching exercise details from Workouts table...');
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
        duration_min,
        sets,
        rest_time_sec,
        target_muscle,
        type,
        difficulty,
        caution,
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
      console.error('Supabase error fetching exercise detail:', error);
      throw new Error('Error fetching exercise detail: ' + error.message);
    }

    if (!data) {
      console.log('No exercise found with ID:', exerciseId);
      throw new Error('Exercise not found');
    }

    console.log('Fetched exercise data:', data);

    const dailyWorkout = data.DailyWorkouts as unknown as DailyWorkout;
    if (!dailyWorkout?.WorkoutPlans?.id) {
      console.error('No DailyWorkouts data found for exercise:', exerciseId);
      throw new Error('Unable to verify ownership of this exercise: No DailyWorkouts data');
    }

    const workoutPlan = dailyWorkout.WorkoutPlans;
    if (!workoutPlan) {
      console.error('No WorkoutPlans data found for daily workout:', dailyWorkout.id);
      throw new Error('Unable to verify ownership of this exercise: No WorkoutPlans data');
    }

    const userIdFromWorkout = workoutPlan.user_id;

    console.log('DailyWorkout:', dailyWorkout);
    console.log('WorkoutPlan:', workoutPlan);
    console.log('UserIdFromWorkout:', userIdFromWorkout);
    console.log('Logged-in user.id:', user.id);

    if (!dailyWorkout || !workoutPlan || !userIdFromWorkout) {
      console.error('Missing relational data for exercise:', exerciseId);
      throw new Error('Unable to verify ownership of this exercise');
    }

    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      console.error('Invalid user ID:', user.id);
      throw new Error('Invalid user ID');
    }

    if (userIdFromWorkout !== userId) {
      console.error('Exercise does not belong to user:', userId, 'UserIdFromWorkout:', userIdFromWorkout);
      throw new Error('You do not have permission to view this exercise');
    }

    const exerciseData: ExerciseDetailType = {
      id: data.id,
      exercise_name: data.exercise_name,
      description: data.description || 'No description available',
      reps: data.reps,
      calories_burned: data.calories_burned,
      daily_workout_id: data.daily_workout_id,
      workout_date: data.workout_date,
      duration_min: data.duration_min,
      sets: data.sets,
      rest_time_sec: data.rest_time_sec,
      target_muscle: data.target_muscle,
      type: data.type,
      difficulty: data.difficulty,
      caution: data.caution,
      DailyWorkouts: dailyWorkout,
    };

    console.log('Exercise detail for user', user.id, ':', exerciseData);

    setExerciseDetail(exerciseData);
  };

  const handleDonePress = async () => {
    if (!idString) return;
    try {
      const exerciseId = parseInt(idString, 10);
      if (isNaN(exerciseId)) {
        throw new Error('Invalid exercise ID');
      }

      const storedExercises = await AsyncStorage.getItem('completedExercises');
      const completedExercises: number[] = storedExercises ? JSON.parse(storedExercises) : [];

      if (!completedExercises.includes(exerciseId)) {
        const updatedExercises = [...completedExercises, exerciseId];
        await AsyncStorage.setItem('completedExercises', JSON.stringify(updatedExercises));
        console.log('Marked exercise as completed:', exerciseId);
      }

      router.push('/(screens)/Exercises');
    } catch (error) {
      console.error('Error saving completed exercise:', error);
      Alert.alert('Error', 'Failed to save completed exercise.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading exercise details...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(screens)/Exercises')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!exerciseDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise details not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(screens)/Exercises')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.description}>Sets: {exerciseDetail.sets}</Text>
        <Text style={styles.description}>Rest Time: {exerciseDetail.rest_time_sec} seconds</Text>
        <Text style={styles.description}>Duration: {exerciseDetail.duration_min} minutes</Text>
        <Text style={styles.description}>Calories Burned: {exerciseDetail.calories_burned}</Text>
        <Text style={styles.description}>Target Muscle: {exerciseDetail.target_muscle}</Text>
        <Text style={styles.description}>Type: {exerciseDetail.type}</Text>
        <Text style={styles.description}>Difficulty: {exerciseDetail.difficulty}</Text>
        {exerciseDetail.caution && (
          <Text style={styles.description}>Caution: {exerciseDetail.caution}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#d63384',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});