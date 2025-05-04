import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type StructuredSet = {
  set: number;
  reps: string;
  rest_time_sec: number;
};

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
  structuredSets?: StructuredSet[];
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

  // Memoize exercises to prevent recomputation on every render
  const exercises: Exercise[] = useMemo(() => {
    return exercisesParam ? JSON.parse(exercisesParam) : [];
  }, [exercisesParam]);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(startIndex ? parseInt(startIndex) : 0);
  const [currentSet, setCurrentSet] = useState(1);
  const [countdown, setCountdown] = useState<number | null>(null);
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Refs to store timer IDs and prevent re-render issues
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cache for image URLs to prevent redundant fetches
  const imageCache = useRef<Map<string, string[]>>(new Map());

  // Memoize currentExercise to prevent reference changes
  const currentExercise = useMemo(() => {
    return exercises[currentExerciseIndex];
  }, [exercises, currentExerciseIndex]);

  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isLastSet = currentSet === currentExercise?.sets;
  const isNumericReps = currentExercise && !currentExercise.reps.includes('sec hold');
  const repsCount = isNumericReps ? parseInt(currentExercise?.reps, 10) : 0;
  const holdSeconds = !isNumericReps && currentExercise ? parseInt(currentExercise.reps.split(' ')[0], 10) : 0;

  // Reset state when switching exercises and start countdown
  useEffect(() => {
    console.log('Switching to exercise:', currentExerciseIndex, currentExercise?.exercise_name);
    setTotalExerciseTime(0);
    setCurrentSet(1);
    setStopwatch(0);
    setIsPlaying(false);
    setIsResting(false);
    setIsHolding(false);
    setRestTimer(null);
    setHoldTimer(null);
    setCountdown(3);
  }, [currentExerciseIndex]);

  // Separate useEffect for image fetching with caching
  useEffect(() => {
    if (!currentExercise) return;

    const exerciseName = currentExercise.exercise_name;

    // Check cache first
    if (imageCache.current.has(exerciseName)) {
      console.log(`Using cached images for ${exerciseName}`);
      setImageUrls(imageCache.current.get(exerciseName)!);
      return;
    }

    fetchImages(exerciseName);
  }, [currentExercise]);

  // Fetch daily workout ID if not provided
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

  useEffect(() => {
    console.log('ExercisePlayback params:', { exercisesParam, day, daily_workout_id, startIndex, fetchedDailyWorkoutId });
  }, [exercisesParam, day, daily_workout_id, startIndex, fetchedDailyWorkoutId]);

  // Countdown timer logic using ref
  useEffect(() => {
    if (countdown === null) {
      if (countdownTimerRef.current) {
        console.log('Clearing countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    console.log('Countdown started:', countdown);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          console.log('Countdown finished, starting exercise');
          setIsPlaying(true);
          return null;
        }
        console.log('Countdown ticking:', prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        console.log('Cleaning up countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [countdown]);

  // Stopwatch logic using ref
  useEffect(() => {
    if (isPlaying && !isHolding) {
      console.log('Starting stopwatch');
      stopwatchTimerRef.current = setInterval(() => {
        setStopwatch((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (stopwatchTimerRef.current) {
        console.log('Cleaning up stopwatch');
        clearInterval(stopwatchTimerRef.current);
        stopwatchTimerRef.current = null;
      }
    };
  }, [isPlaying, isHolding]);

  // Hold timer logic for non-numeric reps (e.g., "10 sec hold")
  useEffect(() => {
    if (isPlaying && !isNumericReps && holdTimer === null) {
      setHoldTimer(holdSeconds);
      setIsHolding(true);
      console.log('Starting hold timer for', holdSeconds, 'seconds');
    }

    if (holdTimer === null) {
      if (holdTimerRef.current) {
        console.log('Clearing hold timer');
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    holdTimerRef.current = setInterval(() => {
      setHoldTimer((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          console.log('Hold timer finished');
          setIsHolding(false);
          setIsPlaying(false);
          handleSetComplete();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (holdTimerRef.current) {
        console.log('Cleaning up hold timer');
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [isPlaying, holdTimer, isNumericReps, holdSeconds]);

  // Rest timer logic using ref
  useEffect(() => {
    if (restTimer === null) {
      if (restTimerRef.current) {
        console.log('Clearing rest timer');
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
      return;
    }

    console.log('Rest timer started:', restTimer);
    restTimerRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          console.log('Rest timer finished:', { currentSet, isLastSet, currentExerciseIndex, isLastExercise });
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
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (restTimerRef.current) {
        console.log('Cleaning up rest timer');
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [restTimer, currentSet, isLastSet, currentExerciseIndex, isLastExercise]);

  const fetchImages = async (exerciseName: string) => {
    try {
      console.log(`Fetching images for exercise: ${exerciseName}`);

      let allFiles: any[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const { data: files, error: listError } = await supabase.storage
          .from('workout-images')
          .list('', { limit, offset });

        if (listError) {
          console.error('Error listing files in workout-images bucket:', listError.message);
          throw new Error('Failed to list images from storage.');
        }

        if (!files || files.length === 0) {
          console.log(`No more files found at offset ${offset}.`);
          hasMore = false;
          break;
        }

        console.log(`Fetched batch at offset ${offset}:`, files.map(f => f.name));
        allFiles = [...allFiles, ...files];
        offset += limit;

        const matchingFiles = files.filter(file => {
          const fileNameWithoutExtension = file.name.replace(/\.png$/, '');
          return fileNameWithoutExtension === exerciseName || fileNameWithoutExtension.startsWith(`${exerciseName} `);
        });

        if (matchingFiles.length > 0) {
          console.log(`Found matching images in batch at offset ${offset - limit}, stopping fetch.`);
          hasMore = false;
        }
      }

      if (allFiles.length === 0) {
        console.log('No files found in workout-images bucket.');
        imageCache.current.set(exerciseName, []);
        setImageUrls([]);
        return;
      }

      console.log('Total files fetched:', allFiles.map(f => f.name));

      const matchingFiles = allFiles.filter(file => {
        const fileNameWithoutExtension = file.name.replace(/\.png$/, '');
        return fileNameWithoutExtension === exerciseName || fileNameWithoutExtension.startsWith(`${exerciseName} `);
      });

      if (matchingFiles.length === 0) {
        console.log(`No matching images found for exercise: ${exerciseName}`);
        imageCache.current.set(exerciseName, []);
        setImageUrls([]);
        return;
      }

      console.log(`Matching files for ${exerciseName}:`, matchingFiles.map(f => f.name));

      const urls = matchingFiles.map(file => {
        const { data } = supabase.storage
          .from('workout-images')
          .getPublicUrl(file.name);
        return data.publicUrl;
      });

      console.log(`Generated public URLs for ${exerciseName}:`, urls);
      imageCache.current.set(exerciseName, urls);
      setImageUrls(urls);
    } catch (err: any) {
      console.error('Error fetching images:', err.message || err);
      imageCache.current.set(exerciseName, []);
      setImageUrls([]);
    }
  };

  const storeExerciseCompletion = async (exercise: Exercise, timeSpent: number, status: 'completed' | 'skipped') => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const effectiveDailyWorkoutId = daily_workout_id ? parseInt(daily_workout_id) : fetchedDailyWorkoutId;
    console.log('Attempting to store completion:', {
      exerciseId: exercise.id,
      exerciseName: exercise.exercise_name,
      timeSpent,
      status,
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

    try {
      const { error, data } = await supabase.from('ExerciseCompletions').insert({
        user_id: user.id,
        workout_id: exercise.id,
        daily_workout_id: effectiveDailyWorkoutId,
        completion_date: new Date().toISOString(),
        time_spent_seconds: Math.round(timeSpent),
        calories_burned: status === 'completed' ? exercise.calories_burned : 0,
        created_at: new Date().toISOString(),
        status,
      }).select('id').single();

      if (error) {
        console.error('Error storing exercise completion:', error.message, error.details);
      } else {
        console.log(`Exercise ${exercise.exercise_name} stored with status ${status} and ID ${data.id}, ${timeSpent} seconds`);
        if (status === 'completed') {
          setCompletedExercises((prev) => [...prev, exercise.id]);
        }
      }
    } catch (err) {
      console.error('Unexpected error storing exercise completion:', err);
    }
  };

  const handleDonePress = () => {
    if (!currentExercise) return;
    console.log('handleDonePress:', { currentSet, isLastSet, stopwatch, totalExerciseTime });
    setIsPlaying(false);
    const newTotalTime = totalExerciseTime + stopwatch;
    setTotalExerciseTime(newTotalTime);
    setStopwatch(0);
    if (isLastSet) {
      storeExerciseCompletion(currentExercise, newTotalTime, 'completed');
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
      storeExerciseCompletion(currentExercise, newTotalTime, 'completed');
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

  const handleSkipExercise = async () => {
    if (!currentExercise) return;

    // Reset timers
    setCountdown(null);
    setRestTimer(null);
    setHoldTimer(null);
    setIsPlaying(false);
    setIsResting(false);
    setIsHolding(false);
    setStopwatch(0);
    setTotalExerciseTime(0);

    // If we're in the rest timer after completing all sets, skip the NEXT exercise
    if (isResting && isLastSet && !isLastExercise) {
      console.log('Skipping NEXT exercise:', {
        currentExerciseIndex,
        currentExerciseName: currentExercise.exercise_name,
        nextExerciseIndex: currentExerciseIndex + 1,
        nextExerciseName: exercises[currentExerciseIndex + 1]?.exercise_name,
      });

      // Move to the next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      const nextExercise = exercises[currentExerciseIndex + 1];

      // Store the next exercise as skipped
      if (nextExercise) {
        await storeExerciseCompletion(nextExercise, 0, 'skipped');
      }

      // Check if the next exercise is the last one
      if (currentExerciseIndex + 1 === exercises.length - 1) {
        setIsFinished(true);
      } else {
        // Move to the exercise after the skipped one
        setCurrentExerciseIndex(currentExerciseIndex + 2);
      }
    } else {
      // Otherwise, skip the current exercise (e.g., during a set or countdown)
      console.log('Skipping CURRENT exercise:', {
        currentExerciseIndex,
        exerciseName: currentExercise.exercise_name,
      });

      // Store the current exercise as skipped
      await storeExerciseCompletion(currentExercise, 0, 'skipped');

      // Advance to the next exercise or finish
      if (isLastExercise) {
        setIsFinished(true);
      } else {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      }
    }

    setCurrentSet(1);
  };

  const handleExitPlayback = async () => {
    console.log('Exiting playback:', { currentExerciseIndex, currentSet, completedExercises });
    router.push({
      pathname: '/(screens)/Exercises',
      params: { day: day || '', source: 'ExercisePlayback' },
    });
  };

  const handleBackPress = () => {
    router.push({
      pathname: '/(screens)/Exercises',
      params: { day: day || '', source: 'ExercisePlayback' },
    });
  };

  if (exercises.length === 0 || !currentExercise) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerText}>No Exercises Available</Text>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerText}>Workout Complete!</Text>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerText}>Error Loading Workout</Text>
        </View>
        <Text style={styles.subHeader}>{error}</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>{currentExercise.exercise_name}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {imageUrls.length > 0 ? (
          <View style={styles.imageContainer}>
            {imageUrls.length > 1 && (
              <View style={styles.sliderIconContainer}>
                <MaterialCommunityIcons
                  name="gesture-swipe"
                  size={20}
                  color="#EC4899"
                />
                <Text style={styles.sliderIconText}>Swipe to view more</Text>
              </View>
            )}
            {imageUrls.length === 1 ? (
              <View style={styles.singleImageContainer}>
                <Image
                  source={{ uri: imageUrls[0] }}
                  style={styles.image}
                  resizeMode="contain"
                  onError={(e) => console.error(`Failed to load image ${imageUrls[0]}:`, e.nativeEvent.error)}
                />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
                contentContainerStyle={styles.imageScrollContent}
              >
                {imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.image}
                    resizeMode="contain"
                    onError={(e) => console.error(`Failed to load image ${url}:`, e.nativeEvent.error)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No images available for this exercise.</Text>
          </View>
        )}

        <View style={styles.setInfoContainer}>
          <Text style={styles.setInfoText}>
            Set {currentSet} of {currentExercise.sets}
          </Text>
          {isNumericReps && (
            <Text style={styles.setInfoText}>
              Total Reps: {repsCount}
            </Text>
          )}
        </View>

        {countdown !== null && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Starting in {countdown}...</Text>
          </View>
        )}

        {countdown === null && isResting && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Rest for {restTimer} seconds</Text>
          </View>
        )}

        {countdown === null && !isResting && isHolding && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Hold for {holdTimer} seconds</Text>
          </View>
        )}

        {countdown === null && !isResting && !isHolding && isPlaying && (
          <>
            <View style={styles.stopwatchContainer}>
              <Text style={styles.stopwatchText}>
                Time: {Math.floor(stopwatch / 60)}:{(stopwatch % 60).toString().padStart(2, '0')}
              </Text>
            </View>
            {isNumericReps && (
              <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipExercise}>
          <Text style={styles.skipButtonText}>Skip Exercise</Text>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="target" size={16} color="#FF6B6B" />
            <Text style={[styles.detailLabel, { color: '#FF6B6B' }]}>Target: </Text>
            <Text style={styles.detailValue}>{currentExercise.target_muscle}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="notebook" size={16} color="#4ECDC4" />
            <Text style={[styles.detailLabel, { color: '#4ECDC4' }]}>Type: </Text>
            <Text style={styles.detailValue}>{currentExercise.type}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="chart-bar" size={16} color="#FFA07A" />
            <Text style={[styles.detailLabel, { color: '#FFA07A' }]}>Difficulty: </Text>
            <Text style={styles.detailValue}>{currentExercise.difficulty}</Text>
          </View>
          
          <Text style={styles.descriptionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{currentExercise.description}</Text>
        </View>

        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Exit Playback</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#d63384',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    marginTop: 10,
  },
  imageScrollView: {
    marginHorizontal: 16,
  },
  imageScrollContent: {
    alignItems: 'center',
  },
  singleImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  image: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  noImageContainer: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sliderIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sliderIconText: {
    fontSize: 12,
    color: '#EC4899',
    marginLeft: 8,
  },
  setInfoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  setInfoText: {
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
    alignSelf: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  stopwatchContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  stopwatchText: {
    fontSize: 18,
    color: '#FF69B4',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginVertical: 20,
    alignSelf: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginVertical: 10,
    alignSelf: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsContainer: {
    padding: 16,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 14,
    color: '#777',
  },
  descriptionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  exitButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExercisePlayback;