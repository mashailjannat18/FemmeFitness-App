import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { useRouter } from 'expo-router';

type Exercise = {
  id: number;
  user_id: string;
  name: string;
  target_muscle: string;
  type: string;
  difficulty: string;
  sets: number;
  reps: number;
  rest_time_sec: number;
  duration_min: number;
  calories_burned: number;
  description: string;
};

const Exercises: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth(); // Get the current user from context
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchExercises();
    }
  }, [user?.id]);

  const fetchExercises = async () => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabase
        .from('Workouts')
        .select('*')
        .eq('user_id', user.id); // Filter by the current user's ID

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('You do not have permission to view these exercises');
      }

      if (!data || data.length === 0) {
        console.log('No exercises found for user:', user.id);
        setExercises([]);
      } else {
        console.log('Exercises fetched for user', user.id, ':', data);
        setExercises(data as Exercise[]);
      }
    } catch (err: any) {
      console.error('Error in fetchExercises:', err.message || err);
      setExercises([]); // Clear exercises on error
    } finally {
      setLoading(false);
    }
  };

  const handleExercisePress = (exerciseId: number) => {
    router.push({
      pathname: '/(screens)/ExerciseDetail',
      params: { exerciseId: exerciseId.toString() },
    });
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item.id)}
    >
      <Text style={styles.exerciseName}>{item.name}</Text>
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
      <Text style={styles.header}>Your Exercises</Text>
      {exercises.length === 0 ? (
        <Text style={styles.noExercisesText}>No exercises found.</Text>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id.toString()}
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