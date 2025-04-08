import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

type DailyWorkout = {
  id: string;
  day_name: string;
  day_number: number;
  daily_workout_date: string;
};

export default function Workouts() {
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkout[]>([]);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user) {
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

        if (planError || !planData) throw new Error('No active workout plan found');

        const { data: dailyData, error: dailyError } = await supabase
          .from('DailyWorkouts')
          .select('id, day_name, day_number, daily_workout_date')
          .eq('workout_plan_id', planData.id)
          .order('day_number', { ascending: true });

        if (dailyError) throw dailyError;
        setDailyWorkouts(dailyData || []);
      } catch (error) {
        console.error('Error fetching workout plan:', error);
        setDailyWorkouts([]);
      }
    };

    fetchWorkoutPlan();
  }, [user, router]);

  const navigateToExercises = (dayName: string) => {
    router.push(`/(screens)/Exercises?day=${dayName}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/images/2.jpg')} style={styles.image} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Workout of the Day</Text>
        <Text style={styles.description}>Select a day to view its workout plan.</Text>

        <View style={styles.options}>
          {dailyWorkouts.map((day) => (
            <TouchableOpacity
              key={day.id}
              onPress={() => navigateToExercises(day.day_name)}
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>{day.day_name}</Text>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  options: {
    marginTop: 16,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  optionText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});