import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Exercise = {
  id: number;
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
  daily_workout_id: number;
};

const Exercises: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyWorkoutId, setDailyWorkoutId] = useState<number | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<number[]>([]);
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

      const userId = user.id;
      console.log('Fetching exercises for user:', userId, 'on day:', day);

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
      setDailyWorkoutId(dailyData.id);

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
        const exercisesWithDailyWorkoutId = data.map((exercise) => ({
          ...exercise,
          daily_workout_id: dailyData.id,
        }));
        setExercises(exercisesWithDailyWorkoutId as Exercise[]);
      }

      // Fetch completed exercises for this daily_workout_id
      const { data: completions, error: completionError } = await supabase
        .from('ExerciseCompletions')
        .select('workout_id')
        .eq('daily_workout_id', dailyData.id)
        .eq('user_id', userId)
        .gte('completion_date', new Date().toISOString().split('T')[0]);

      if (completionError) {
        console.error('Error fetching completions:', completionError);
      } else {
        setCompletedExerciseIds(completions?.map((c) => c.workout_id) || []);
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
      params: { id: exerciseId.toString() },
    });
  };

  const structureExerciseWithRestTimers = (exercise: Exercise) => {
    const sets = exercise.sets;
    const structuredSets = [];
    for (let i = 0; i < sets; i++) {
      structuredSets.push({
        set: i + 1,
        reps: exercise.reps,
        rest_time_sec: exercise.rest_time_sec,
      });
    }
    return {
      ...exercise,
      structuredSets,
    };
  };

  const handlePlayAll = () => {
    console.log('handlePlayAll called with dailyWorkoutId:', dailyWorkoutId);
    if (!dailyWorkoutId) {
      console.error('Cannot navigate to ExercisePlayback: dailyWorkoutId is null');
      return;
    }
    const structuredExercises = exercises.map(structureExerciseWithRestTimers);
    router.push({
      pathname: '/(screens)/ExercisePlayback',
      params: {
        exercises: JSON.stringify(structuredExercises),
        day: day || '',
        daily_workout_id: dailyWorkoutId.toString(),
        startIndex: '0',
      },
    });
  };

  const handleResume = () => {
    if (!dailyWorkoutId) {
      console.error('Cannot resume: dailyWorkoutId is null');
      return;
    }
    const startIndex = exercises.findIndex((ex) => !completedExerciseIds.includes(ex.id));
    const structuredExercises = exercises.map(structureExerciseWithRestTimers);
    router.push({
      pathname: '/(screens)/ExercisePlayback',
      params: {
        exercises: JSON.stringify(structuredExercises),
        day: day || '',
        daily_workout_id: dailyWorkoutId.toString(),
        startIndex: startIndex >= 0 ? startIndex.toString() : '0',
      },
    });
  };

  const handleRestart = async () => {
    if (!dailyWorkoutId || !user?.id) {
      console.error('Cannot restart: missing dailyWorkoutId or user.id', { dailyWorkoutId, userId: user?.id });
      return;
    }
    try {
      console.log('Restarting workout for dailyWorkoutId:', dailyWorkoutId, 'user:', user.id);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .rpc('delete_exercise_completions', {
          daily_workout_id_input: dailyWorkoutId,
          user_id_input: user.id,
          completion_date_input: today,
        });
  
      if (error) {
        console.error('Error calling delete_exercise_completions:', error.message, error);
        return;
      }
  
      console.log('delete_exercise_completions response:', data);
      if (!data.success) {
        console.error('Failed to delete completions:', data.message);
        return;
      }
  
      console.log(`Deleted ${data.deleted_count} ExerciseCompletions records`);
      if (data.remaining_count > 0) {
        console.warn(`Some completions remain after deletion: ${data.remaining_count}`);
      } else {
        console.log('All completions successfully deleted');
      }
  
      setCompletedExerciseIds([]); // Reset UI state
      handlePlayAll(); // Start fresh
    } catch (err) {
      console.error('Unexpected error in handleRestart:', err);
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, completedExerciseIds.includes(item.id) && styles.completedExercise]}
      onPress={() => handleExercisePress(item.id)}
    >
      <Text style={styles.exerciseName}>{item.exercise_name}</Text>
      <Text style={styles.exerciseDetail}>Target: {item.target_muscle}</Text>
      <Text style={styles.exerciseDetail}>Type: {item.type}</Text>
      <Text style={styles.exerciseDetail}>Difficulty: {item.difficulty}</Text>
      {completedExerciseIds.includes(item.id) && (
        <Text style={styles.completedText}>Completed</Text>
      )}
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
        <>
          {completedExerciseIds.length > 0 ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.playButton, !dailyWorkoutId && styles.playButtonDisabled]}
                onPress={handleResume}
                disabled={!dailyWorkoutId}
              >
                <Text style={styles.playButtonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.restartButton, !dailyWorkoutId && styles.playButtonDisabled]}
                onPress={handleRestart}
                disabled={!dailyWorkoutId}
              >
                <Text style={styles.playButtonText}>Restart Workouts</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.playButton, (loading || !dailyWorkoutId) && styles.playButtonDisabled]}
              onPress={handlePlayAll}
              disabled={loading || !dailyWorkoutId}
            >
              <Text style={styles.playButtonText}>Play All</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={exercises}
            renderItem={renderExercise}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  restartButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  playButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  completedExercise: {
    backgroundColor: '#e0f7e0',
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
  completedText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 5,
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