import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';

type DailyWorkout = {
  id: string;
  day_name: string;
  day_number: number;
  daily_workout_date: string;
  focus: string;
  total_calories_burned: number;
  total_duration_min: number;
};

export default function Workouts() {
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkout[]>([]);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    // Null check for user
    if (!user || !user.id) {
      router.push('/Login');
      return;
    }

    const fetchWorkoutPlan = async () => {
      try {
        const { data: planData, error: planError } = await supabase
          .from('WorkoutPlans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (planError || !planData) {
          throw new Error('No active workout plan found');
        }

        const { data: dailyData, error: dailyError } = await supabase
          .from('DailyWorkouts')
          .select('id, day_name, day_number, daily_workout_date, focus, total_calories_burned, total_duration_min')
          .eq('workout_plan_id', planData.id)
          .order('day_number', { ascending: true });

        if (dailyError) {
          throw new Error('Error fetching daily workouts: ' + dailyError.message);
        }

        setDailyWorkouts(dailyData || []);
      } catch (error: any) {
        console.error('Error fetching workout plan:', error.message);
        setDailyWorkouts([]);
      }
    };

    fetchWorkoutPlan();
  }, [user, router]);

  const navigateToExercises = (dayName: string) => {
    router.push(`/(screens)/Exercises?day=${dayName}`);
  };

  // Render login prompt if user is null
  if (!user || !user.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please Log In</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/Login')}>
          <Text style={styles.workoutTitle}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/images/2.jpg')} style={styles.image} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Workout of the Day</Text>
        <Text style={styles.description}>Select a day to view its workout plan.</Text>

        <View style={styles.options}>
          {dailyWorkouts.length > 0 ? (
            dailyWorkouts.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigateToExercises(item.day_name)}
                style={styles.optionButton}
              >
                <View style={styles.dayContainer}>
                  <View style={styles.dayNumberContainer}>
                    <Text style={styles.dayNumber}>{item.day_number}</Text>
                    <View style={styles.separator} />
                  </View>

                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle}>{item.focus}</Text>
                    <View style={styles.metaContainer}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="local-fire-department" size={14} color="#FFA500" />
                        <Text style={styles.metaText}>{item.total_calories_burned || 0} kcal</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="access-time" size={14} color="#1E90FF" />
                        <Text style={styles.metaText}>{item.total_duration_min || 0} min</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.rightSection}>
                    <View style={styles.separator} />
                    <MaterialIcons name="check-circle" size={24} color="#FF1493" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noWorkoutsText}>No workout plan available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  content: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#FF1493',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
  },
  options: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  dayNumberContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF1493',
    marginRight: 12,
  },
  separator: {
    height: 40,
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  workoutInfo: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF1493',
    marginBottom: 8,
  },
  metaContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  metaText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  rightSection: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  noWorkoutsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
  },
});