import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [skippedExerciseIds, setSkippedExerciseIds] = useState<number[]>([]);
  const [isCurrentDay, setIsCurrentDay] = useState(false);
  const [focusAreaImages, setFocusAreaImages] = useState<string[]>([]);
  const { user } = useUserAuth();
  const router = useRouter();
  const { day, source } = useLocalSearchParams<{ day?: string; source?: string }>();

  // Cache for focus area images to prevent redundant fetches
  const imageCache = useRef<Map<string, string[]>>(new Map());

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
        .select('id, daily_workout_date, focus')
        .eq('workout_plan_id', planData.id)
        .eq('day_name', day)
        .single();

      if (dailyError || !dailyData) {
        console.error('Error fetching daily workout:', dailyError);
        throw new Error(`No daily workout found for day ${day} in workout plan ${planData.id}`);
      }

      console.log('Daily workout found:', dailyData);
      setDailyWorkoutId(dailyData.id);

      // Fetch focus area images if focus is available
      if (dailyData.focus) {
        fetchFocusAreaImages(dailyData.focus);
      } else {
        console.log('No focus area specified for this daily workout:', dailyData.id);
        setFocusAreaImages([]);
      }

      // Compute the current date in the same format as Home.tsx
      const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const workoutDate = dailyData.daily_workout_date.split('T')[0]; // Extract YYYY-MM-DD

      // Log the dates for debugging
      console.log('Comparing dates in Exercises.tsx:');
      console.log('  Current Date (today):', today);
      console.log('  Daily Workout Date (workoutDate):', workoutDate);
      console.log('  Dates Match:', today === workoutDate);

      setIsCurrentDay(today === workoutDate);

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

      // Fetch completed and skipped exercises for this daily_workout_id
      const { data: completions, error: completionError } = await supabase
        .from('ExerciseCompletions')
        .select('workout_id, status')
        .eq('daily_workout_id', dailyData.id)
        .eq('user_id', userId)
        .gte('completion_date', new Date().toISOString().split('T')[0]);

      if (completionError) {
        console.error('Error fetching completions:', completionError);
      } else {
        setCompletedExerciseIds(completions?.filter((c) => c.status === 'completed').map((c) => c.workout_id) || []);
        setSkippedExerciseIds(completions?.filter((c) => c.status === 'skipped').map((c) => c.workout_id) || []);
      }
    } catch (err: any) {
      console.error('Error in fetchExercises:', err.message || err);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFocusAreaImages = async (focus: string) => {
    try {
      console.log(`Fetching focus area images for focus: ${focus}`);

      // Check cache first
      if (imageCache.current.has(focus)) {
        console.log(`Using cached images for focus: ${focus}`);
        setFocusAreaImages(imageCache.current.get(focus)!);
        return;
      }

      let allFiles: any[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const { data: files, error: listError } = await supabase.storage
          .from('focus-area-images')
          .list('', { limit, offset });

        if (listError) {
          console.error('Error listing files in focus-area-images bucket:', listError.message);
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
          return fileNameWithoutExtension === focus || fileNameWithoutExtension.startsWith(`${focus} `);
        });

        if (matchingFiles.length > 0) {
          console.log(`Found matching images in batch at offset ${offset - limit}, stopping fetch.`);
          hasMore = false;
        }
      }

      if (allFiles.length === 0) {
        console.log('No files found in focus-area-images bucket.');
        imageCache.current.set(focus, []);
        setFocusAreaImages([]);
        return;
      }

      console.log('Total files fetched:', allFiles.map(f => f.name));

      const matchingFiles = allFiles.filter(file => {
        const fileNameWithoutExtension = file.name.replace(/\.png$/, '');
        return fileNameWithoutExtension === focus || fileNameWithoutExtension.startsWith(`${focus} `);
      });

      if (matchingFiles.length === 0) {
        console.log(`No matching images found for focus: ${focus}`);
        imageCache.current.set(focus, []);
        setFocusAreaImages([]);
        return;
      }

      console.log(`Matching files for focus ${focus}:`, matchingFiles.map(f => f.name));

      const urls = matchingFiles.map(file => {
        const { data } = supabase.storage
          .from('focus-area-images')
          .getPublicUrl(file.name);
        return data.publicUrl;
      });

      console.log(`Generated public URLs for focus ${focus}:`, urls);
      imageCache.current.set(focus, urls);
      setFocusAreaImages(urls);
    } catch (err: any) {
      console.error('Error fetching focus area images:', err.message || err);
      imageCache.current.set(focus, []);
      setFocusAreaImages([]);
    }
  };

  const handleExercisePress = (exerciseId: number) => {
    console.log('Navigating to ExerciseDetail with exerciseId:', exerciseId);
    router.push({
      pathname: '/(screens)/ExerciseDetail',
      params: { id: exerciseId.toString(), day: day || '', source: source || '' },
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
    const startIndex = exercises.findIndex((ex) => !completedExerciseIds.includes(ex.id) && !skippedExerciseIds.includes(ex.id));
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
      const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      
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
      setSkippedExerciseIds([]);  // Reset UI state
      handlePlayAll(); // Start fresh
    } catch (err) {
      console.error('Unexpected error in handleRestart:', err);
    }
  };

  const handleBackPress = () => {
    if (source === 'Home') {
      router.push('/(tabs)/Home');
    } else {
      router.push('/(tabs)/Workouts');
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[
        styles.exerciseCard,
        completedExerciseIds.includes(item.id) && styles.completedExercise,
        skippedExerciseIds.includes(item.id) && styles.skippedExercise,
      ]}
      onPress={() => handleExercisePress(item.id)}
    >
      <Text style={styles.exerciseName}>{item.exercise_name}</Text>
      
      <View style={styles.exerciseDetailRow}>
        <MaterialCommunityIcons name="target" size={16} color="#FF6B6B" />
        <Text style={[styles.exerciseDetailLabel, { color: '#FF6B6B' }]}>Target: </Text>
        <Text style={styles.exerciseDetailValue}>{item.target_muscle}</Text>
      </View>
      
      <View style={styles.exerciseDetailRow}>
        <MaterialCommunityIcons name="notebook" size={16} color="#4ECDC4" />
        <Text style={[styles.exerciseDetailLabel, { color: '#4ECDC4' }]}>Type: </Text>
        <Text style={styles.exerciseDetailValue}>{item.type}</Text>
      </View>
      
      <View style={styles.exerciseDetailRow}>
        <MaterialCommunityIcons name="chart-bar" size={16} color="#FFA07A" />
        <Text style={[styles.exerciseDetailLabel, { color: '#FFA07A' }]}>Difficulty: </Text>
        <Text style={styles.exerciseDetailValue}>{item.difficulty}</Text>
      </View>
      
      {completedExerciseIds.includes(item.id) && (
        <View style={styles.completedContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
      {skippedExerciseIds.includes(item.id) && (
        <View style={styles.completedContainer}>
          <Ionicons name="close-circle" size={16} color="#ff4500" />
          <Text style={styles.skippedText}>Skipped</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const allExercisesDone = exercises.length > 0 && exercises.every((ex) => completedExerciseIds.includes(ex.id) || skippedExerciseIds.includes(ex.id));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>{day || 'Selected Day'}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Focus Area Images */}
        {focusAreaImages.length > 0 ? (
          <View style={styles.imageContainer}>
            {focusAreaImages.length > 1 && (
              <View style={styles.sliderIconContainer}>
                <MaterialCommunityIcons
                  name="gesture-swipe"
                  size={20}
                  color="#EC4899"
                />
                <Text style={styles.sliderIconText}>Swipe to view more</Text>
              </View>
            )}
            {focusAreaImages.length === 1 ? (
              <View style={styles.singleImageContainer}>
                <Image
                  source={{ uri: focusAreaImages[0] }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(e) => console.error(`Failed to load image ${focusAreaImages[0]}:`, e.nativeEvent.error)}
                />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
                contentContainerStyle={styles.imageScrollContent}
              >
                {focusAreaImages.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={(e) => console.error(`Failed to load image ${url}:`, e.nativeEvent.error)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No focus area images available.</Text>
          </View>
        )}

        {exercises.length === 0 ? (
          <Text style={styles.noExercisesText}>No exercises found for this day.</Text>
        ) : (
          <>
            <View style={styles.buttonSpacer} />
            
            {completedExerciseIds.length > 0 || skippedExerciseIds.length > 0 ? (
              <View style={styles.buttonContainer}>
                {!allExercisesDone && (
                  <TouchableOpacity
                    style={[styles.playButton, (!dailyWorkoutId /* || !isCurrentDay */) && styles.playButtonDisabled]}
                    onPress={handleResume}
                    disabled={!dailyWorkoutId /* || !isCurrentDay */}
                  >
                    <Text style={styles.playButtonText}>Resume</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.restartButton, (!dailyWorkoutId /* || !isCurrentDay */) && styles.playButtonDisabled]}
                    onPress={handleRestart}
                    disabled={!dailyWorkoutId /* || !isCurrentDay */}
                  >
                    <Text style={styles.playButtonText}>Restart Workouts</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.playButton, (loading || !dailyWorkoutId || !isCurrentDay ) && styles.playButtonDisabled]}
                  onPress={handlePlayAll}
                  disabled={loading || !dailyWorkoutId || !isCurrentDay }
                >
                  <Text style={styles.playButtonText}>Play All</Text>
                </TouchableOpacity>
              )}
            
            <View style={styles.buttonSpacer} />
            
            <FlatList
              data={exercises}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#d63384',
    zIndex: 10,
    elevation: 4,
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
  scrollView: {
    flex: 1,
    marginTop: 60, // Header height
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    height: 230,
    width: '100%',
    marginTop: 10, // Offset for header
  },
  singleImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageScrollView: {
    marginHorizontal: 16,
  },
  imageScrollContent: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 230,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  noImageContainer: {
    height: 180,
    width: '100%',
    marginTop: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  playButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 2,
  },
  restartButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 2,
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
    backgroundColor: '#FCE7F3',
  },
  skippedExercise: {
    backgroundColor: '#FFE4E1',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exerciseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseDetailLabel: {
    fontSize: 14,
    marginLeft: 6,
  },
  exerciseDetailValue: {
    fontSize: 14,
    color: '#777',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  skippedText: {
    fontSize: 14,
    color: '#ff4500',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
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
  buttonSpacer: {
    height: 16,
  },
});

export default Exercises;