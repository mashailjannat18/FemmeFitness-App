import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

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
  daily_workout_id?: number;
};

const ExercisePlayback: React.FC = () => {
  const router = useRouter();
  const { user } = useUserAuth();
  const { exercises: exercisesParam, day, daily_workout_id, startIndex } = useLocalSearchParams<{
    exercises?: string;
    day?: string;
    daily_workout_id?: string;
    startIndex?: string;
  }>();

  const exercises: Exercise[] = exercisesParam ? JSON.parse(exercisesParam) : [];
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(startIndex ? parseInt(startIndex) : 0);
  const [currentSet, setCurrentSet] = useState(1);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);
  const [stopwatch, setStopwatch] = useState(0);
  const [totalExerciseTime, setTotalExerciseTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [fetchedDailyWorkoutId, setFetchedDailyWorkoutId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isLastSet = currentSet === currentExercise?.sets;
  const isNumericReps = currentExercise && !currentExercise.reps.includes('sec hold');
  const repsCount = isNumericReps ? parseInt(currentExercise?.reps, 10) : 0;
  const holdSeconds = !isNumericReps && currentExercise ? parseInt(currentExercise.reps.split(' ')[0], 10) : 0;

  // Reset states when moving to a new exercise
  useEffect(() => {
    setTotalExerciseTime(0);
    setCurrentSet(1);
    setCountdown(3);
    setStopwatch(0);
    setIsPlaying(false);
    setIsResting(false);
    setIsHolding(false);
    setRestTimer(null);
    setHoldTimer(null);
    console.log('Switched to exercise index:', currentExerciseIndex, currentExercise?.exercise_name);
  }, [currentExerciseIndex]);

  // Fetch daily_workout_id if not provided via params
  useEffect(() => {
    const fetchDailyWorkoutId = async () => {
      if (!user?.id || !day || daily_workout_id) {
        console.log('Skipping fetchDailyWorkoutId:', { userId: user?.id, day, daily_workout_id });
        return;
      }

      try {
        const userId = user.id;
        console.log('Fetching daily_workout_id for user:', userId, 'day:', day);

        const { data: planData, error: planError } = await supabase
          .from('WorkoutPlans')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (planError || !planData) {
          throw new Error('No active workout plan found');
        }

        const { data: dailyData, error: dailyError } = await supabase
          .from('DailyWorkouts')
          .select('id')
          .eq('workout_plan_id', planData.id)
          .eq('day_name', day)
          .single();

        if (dailyError || !dailyData) {
          throw new Error(`No daily workout found for day ${day}`);
        }

        console.log('Fetched daily_workout_id:', dailyData.id);
        setFetchedDailyWorkoutId(dailyData.id);
      } catch (err: any) {
        console.error('Error fetching daily_workout_id:', err.message || err);
        setError('Unable to load workout data. Progress tracking may be unavailable.');
      }
    };

    fetchDailyWorkoutId();
  }, [user?.id, day, daily_workout_id]);

  // Log params for debugging
  useEffect(() => {
    console.log('ExercisePlayback params:', { exercisesParam, day, daily_workout_id, startIndex, fetchedDailyWorkoutId });
  }, [exercisesParam, day, daily_workout_id, startIndex, fetchedDailyWorkoutId]);

  // Stopwatch logic
  useEffect(() => {
    let stopwatchTimer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      stopwatchTimer = setInterval(() => {
        setStopwatch((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (stopwatchTimer) clearInterval(stopwatchTimer);
    };
  }, [isPlaying]);

  // Function to store exercise completion in Supabase
  const storeExerciseCompletion = async (exercise: Exercise, timeSpent: number) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const effectiveDailyWorkoutId = daily_workout_id ? parseInt(daily_workout_id) : fetchedDailyWorkoutId;
    console.log('Attempting to store completion:', {
      exerciseId: exercise.id,
      exerciseName: exercise.exercise_name,
      timeSpent,
      effectiveDailyWorkoutId,
      userId: user.id,
    });

    if (!effectiveDailyWorkoutId || isNaN(effectiveDailyWorkoutId)) {
      console.warn('Cannot store exercise completion: missing valid daily_workout_id', {
        daily_workout_id,
        fetchedDailyWorkoutId,
      });
      return;
    }

    if (timeSpent <= 0) {
      console.warn('Cannot store exercise completion: invalid timeSpent', { timeSpent });
      return;
    }

    try {
      const { error, data } = await supabase.from('ExerciseCompletions').insert({
        user_id: user.id,
        workout_id: exercise.id,
        daily_workout_id: effectiveDailyWorkoutId,
        completion_date: new Date().toISOString(),
        time_spent_seconds: Math.round(timeSpent),
        calories_burned: exercise.calories_burned,
        created_at: new Date().toISOString(),
      }).select('id').single();

      if (error) {
        console.error('Error storing exercise completion:', error.message, error.details);
      } else {
        console.log(`Exercise ${exercise.exercise_name} completion stored with ID ${data.id}, ${timeSpent} seconds`);
        setCompletedExercises((prev) => [...prev, exercise.id]);
      }
    } catch (err) {
      console.error('Unexpected error storing exercise completion:', err);
    }
  };

  // Countdown logic
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsPlaying(true);
    }
  }, [countdown]);

  // Hold timer logic for non-numeric reps
  useEffect(() => {
    if (isPlaying && !isNumericReps && holdTimer === null) {
      setHoldTimer(holdSeconds);
      setIsHolding(true);
    }

    if (holdTimer !== null && holdTimer > 0) {
      const timer = setInterval(() => {
        setHoldTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (holdTimer === 0) {
      setHoldTimer(null);
      setIsHolding(false);
      setIsPlaying(false);
      handleSetComplete();
    }
  }, [isPlaying, holdTimer, isNumericReps, holdSeconds]);

  // Rest timer logic
  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      const timer = setInterval(() => {
        setRestTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (restTimer === 0) {
      console.log('Rest timer finished:', { currentSet, isLastSet, currentExerciseIndex, isLastExercise });
      setRestTimer(null);
      setIsResting(false);
      if (isLastSet) {
        if (isLastExercise) {
          setIsFinished(true);
        } else {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
        }
      } else {
        setCurrentSet(currentSet + 1);
        setCountdown(3);
      }
    }
  }, [restTimer, currentSet, isLastSet, currentExerciseIndex, isLastExercise]);

  const handleDonePress = () => {
    if (!currentExercise) return;
    console.log('handleDonePress:', { currentSet, isLastSet, stopwatch, totalExerciseTime });
    setIsPlaying(false);
    const newTotalTime = totalExerciseTime + stopwatch;
    setTotalExerciseTime(newTotalTime);
    setStopwatch(0);
    if (isLastSet) {
      storeExerciseCompletion(currentExercise, newTotalTime);
      if (isLastExercise) {
        setIsFinished(true);
      } else {
        setIsResting(true);
        setRestTimer(currentExercise.rest_time_sec || 0);
      }
    } else {
      setIsResting(true);
      setRestTimer(currentExercise.rest_time_sec || 0);
    }
  };

  const handleSetComplete = () => {
    if (!currentExercise) return;
    console.log('handleSetComplete:', { currentSet, isLastSet, stopwatch, totalExerciseTime });
    const newTotalTime = totalExerciseTime + stopwatch;
    setTotalExerciseTime(newTotalTime);
    setStopwatch(0);
    if (isLastSet) {
      storeExerciseCompletion(currentExercise, newTotalTime);
      if (isLastExercise) {
        setIsFinished(true);
      } else {
        setIsResting(true);
        setRestTimer(currentExercise.rest_time_sec || 0);
      }
    } else {
      setIsResting(true);
      setRestTimer(currentExercise.rest_time_sec || 0);
    }
  };

  const handleExitPlayback = async () => {
    console.log('Exiting playback:', { currentExerciseIndex, currentSet, completedExercises });
    router.push({
      pathname: '/(screens)/Exercises',
      params: { day: day || '' },
    });
  };

  if (exercises.length === 0 || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No Exercises Available</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Workout Complete!</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Error Loading Workout</Text>
        <Text style={styles.subHeader}>{error}</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{currentExercise.exercise_name}</Text>
      <Text style={styles.subHeader}>
        Set {currentSet} of {currentExercise.sets}
      </Text>
      {isNumericReps && (
        <Text style={styles.subHeader}>
          Total Reps: {repsCount}
        </Text>
      )}

      {countdown !== null ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Starting in {countdown}...</Text>
        </View>
      ) : isResting ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Rest for {restTimer} seconds</Text>
        </View>
      ) : isHolding ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Hold for {holdTimer} seconds</Text>
        </View>
      ) : (
        <>
          <View style={styles.stopwatchContainer}>
            <Text style={styles.stopwatchText}>
              Time: {Math.floor(stopwatch / 60)}:{(stopwatch % 60).toString().padStart(2, '0')}
            </Text>
          </View>
          {isNumericReps ? (
            <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Target: {currentExercise.target_muscle}</Text>
        <Text style={styles.detailText}>Type: {currentExercise.type}</Text>
        <Text style={styles.detailText}>Difficulty: {currentExercise.difficulty}</Text>
        <Text style={styles.detailText}>Description: {currentExercise.description}</Text>
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
        <Text style={styles.exitButtonText}>Exit Playback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  timerContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#d63384',
    borderRadius: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  stopwatchContainer: {
    marginVertical: 10,
  },
  stopwatchText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginVertical: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsContainer: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  exitButton: {
    backgroundColor: '#d63384',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExercisePlayback;