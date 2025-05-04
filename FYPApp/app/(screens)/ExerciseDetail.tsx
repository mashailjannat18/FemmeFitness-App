import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, TouchableOpacity, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  const { id: idString, day, source } = useLocalSearchParams<{ id: string; day?: string; source?: string }>();
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetailType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]); // State to hold image URLs
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || !user.id) {
      setErrorMessage('No user logged in. Redirecting to Login...');
      setTimeout(() => router.push('/Login'), 2000);
      setIsLoading(false);
      return;
    }

    if (idString) {
      const exerciseId = parseInt(idString, 10);
      if (isNaN(exerciseId)) {
        setErrorMessage('Invalid exercise ID.');
        setIsLoading(false);
        return;
      }

      const fetchData = async () => {
        try {
          await fetchExerciseDetail(exerciseId);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to load exercise details.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      setErrorMessage('No exercise selected.');
      setIsLoading(false);
    }
  }, [idString, user, router]);

  const fetchExerciseDetail = async (exerciseId: number) => {
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

    if (error || !data) throw new Error('Error fetching exercise detail.');

    const dailyWorkout = data.DailyWorkouts as unknown as DailyWorkout;
    if (!dailyWorkout?.WorkoutPlans?.user_id || dailyWorkout.WorkoutPlans.user_id !== parseInt(user!.id)) {
      throw new Error('You do not have permission to view this exercise.');
    }

    setExerciseDetail({
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
    });

    // Fetch images from the storage bucket
    await fetchImages(data.exercise_name);
  };

  const fetchImages = async (exerciseName: string) => {
    try {
      console.log(`Fetching images for exercise: ${exerciseName}`);
      
      let allFiles: any[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      // Fetch files in batches until all are retrieved
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

        // Stop early if we find matching images
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
        setImageUrls([]);
        return;
      }

      console.log('Total files fetched:', allFiles.map(f => f.name));

      // Filter files that exactly match the exercise name
      const matchingFiles = allFiles.filter(file => {
        const fileNameWithoutExtension = file.name.replace(/\.png$/, '');
        return fileNameWithoutExtension === exerciseName || fileNameWithoutExtension.startsWith(`${exerciseName} `);
      });

      if (matchingFiles.length === 0) {
        console.log(`No matching images found for exercise: ${exerciseName}`);
        setImageUrls([]);
        return;
      }

      console.log(`Matching files for ${exerciseName}:`, matchingFiles.map(f => f.name));

      // Generate public URLs for the matching files
      const urls = matchingFiles.map(file => {
        const { data } = supabase.storage
          .from('workout-images')
          .getPublicUrl(file.name);
        return data.publicUrl;
      });

      console.log(`Generated public URLs for ${exerciseName}:`, urls);
      setImageUrls(urls);
    } catch (err: any) {
      console.error('Error fetching images:', err.message || err);
      setImageUrls([]);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderDetailRow = (label: string, value: string | number) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.push({
              pathname: '/(screens)/Exercises',
              params: { day: day || '', source: source || '' },
            })
          }
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!exerciseDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise details not found.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.push({
              pathname: '/(screens)/Exercises',
              params: { day: day || '', source: source || '' },
            })
          }
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>{exerciseDetail.exercise_name}</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subHeaderText}>
          Date: {exerciseDetail.workout_date || 'Not available'}
        </Text>

        {/* Image Section */}
        {imageUrls.length > 0 ? (
          <View style={styles.imageContainer}>
            {/* Slider Icon for Multiple Images */}
            {imageUrls.length > 1 && (
              <View style={styles.sliderIconContainer}>
                <MaterialCommunityIcons
                  name="gesture-swipe"
                  size={24}
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

        <View style={styles.content}>
          <Text style={styles.title}>Description</Text>
          <Text style={styles.description}>{exerciseDetail.description}</Text>

          <Text style={styles.title}>Details</Text>
          {renderDetailRow('Reps', exerciseDetail.reps)}
          {renderDetailRow('Sets', exerciseDetail.sets)}
          {renderDetailRow('Rest Time', `${exerciseDetail.rest_time_sec} seconds`)}
          {renderDetailRow('Duration', `${exerciseDetail.duration_min} minutes`)}
          {renderDetailRow('Calories Burned Estimated', exerciseDetail.calories_burned)}
          {renderDetailRow('Target Muscle', exerciseDetail.target_muscle)}
          {renderDetailRow('Type', exerciseDetail.type)}
          {renderDetailRow('Difficulty', exerciseDetail.difficulty)}

          {exerciseDetail.caution && (
            <View style={styles.cautionContainer}>
              <Text style={styles.cautionLabel}>Caution:</Text>
              <Text style={styles.cautionText}>{exerciseDetail.caution}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // Header Styles
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  // Main Content Styles
  contentContainer: {
    paddingBottom: 20,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 10,
    textAlign: 'center',
  },
  // Image Styles
  imageContainer: {
    marginBottom: 30,
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
    width: 230,
    height: 330,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  noImageContainer: {
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Slider Icon Styles
  sliderIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sliderIconText: {
    fontSize: 14,
    color: '#EC4899',
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
    color: 'black',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'baseline',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 140,
    color: '#ec4899',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flexShrink: 1,
  },
  cautionContainer: {
    backgroundColor: '#fff0f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  cautionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d63384',
    marginBottom: 4,
  },
  cautionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#EC4899',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});