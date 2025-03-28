import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserAuth } from '@/context/UserAuthContext';

type Exercise = {
  id: string;
  exercise_name: string;
  reps: string;
  daily_workout_id: string;
};

type DailyWorkout = {
  id: string;
  day_name: string;
  daily_workout_date: string;
};

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const { day } = useLocalSearchParams<{ day: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user) {
      router.push('/Login');
      return;
    }

    fetchExercises();
    loadCompletedExercises();
  }, [day, user, router]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchExercises = async () => {
    if (!day || !user) return;
    try {
      const { data: planData, error: planError } = await supabase
        .from('WorkoutPlans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      console.log('WorkoutPlans query result:', { planData, planError });

      if (planError || !planData) throw new Error('No active workout plan found');

      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .select('id, day_name, daily_workout_date')
        .eq('workout_plan_id', planData.id)
        .eq('day_name', day)
        .single();

      console.log('DailyWorkouts query result:', { dailyData, dailyError });

      if (dailyError || !dailyData) throw new Error('No daily workout found for this day');

      setDailyWorkout(dailyData);

      const { data: exerciseData, error: exerciseError } = await supabase
        .from('Workouts')
        .select('id, exercise_name, reps, daily_workout_id')
        .eq('daily_workout_id', dailyData.id);

      console.log('Workouts query result:', { exerciseData, exerciseError });

      if (exerciseError) throw exerciseError;
      setExercises(exerciseData || []);
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setExercises([]);
      setDailyWorkout(null);
    }
  };

  const loadCompletedExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem('completedExercises');
      if (storedExercises) setCompletedExercises(JSON.parse(storedExercises));
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    }
  };

  const allExercisesCompleted = exercises.length > 0 && completedExercises.length === exercises.length;

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Exercises for {day} ({dailyWorkout?.daily_workout_date || 'Date not available'})
      </Text>

      {exercises.length === 0 ? (
        <Text>No exercises found for this day.</Text>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => router.push(`/ExerciseDetail?id=${item.id}`)}
            >
              <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.exercise_name}</Text>
                <Text style={styles.repetitions}>{item.reps} reps</Text>
              </View>
              {completedExercises.includes(item.id) && (
                <Ionicons name="checkmark-circle" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.doneButton, !allExercisesCompleted && styles.disabledButton]}
        disabled={!allExercisesCompleted}
        onPress={() => {
          console.log('All exercises completed!');
          router.back();
        }}
      >
        <Text style={styles.doneButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  repetitions: {
    fontSize: 14,
    color: '#555',
  },
  checkIcon: {
    fontSize: 24,
    color: 'green',
    marginLeft: 10,
  },
  doneButton: {
    backgroundColor: '#ff69b4',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});