import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

export default function Meals() {
  const [imageUrl] = useState(
    'https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top'
  );
  const [meals, setMeals] = useState<string[]>([]);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user) {
        console.error('No user logged in');
        return;
      }

      try {
        const { data: workoutPlan, error: workoutPlanError } = await supabase
          .from('WorkoutPlans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (workoutPlanError || !workoutPlan) {
          console.error('Error fetching workout plan:', workoutPlanError?.message || 'No active workout plan found');
          return;
        }

        const { data: mealPlan, error: mealPlanError } = await supabase
          .from('DailyMealPlans')
          .select('day_number')
          .eq('workout_plan_id', workoutPlan.id)
          .order('day_number', { ascending: true });

        if (mealPlanError || !mealPlan) {
          console.error('Error fetching meal plan:', mealPlanError?.message || 'No meal plan found');
          return;
        }

        const mealDays = mealPlan.map((meal) => `Day ${meal.day_number}`);
        setMeals(mealDays);
      } catch (error) {
        console.error('Error fetching meal plan:', error);
      }
    };

    fetchMealPlan();
  }, [user]);

  const navigateToMealDetail = (meal: string, dayNumber: number) => {
    router.push({
      pathname: '../(screens)/MealDetail',
      params: { meal, day: dayNumber },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Meals</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>Select a meal to view its details.</Text>
        </View>

        <View style={styles.options}>
          {meals.length > 0 ? (
            meals.map((meal, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToMealDetail(meal, index + 1)}
                style={styles.optionButton}
              >
                <Text style={styles.optionText}>{meal}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noMealsText}>No meal plan available.</Text>
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#FF1493', // Pink color from the first file
  },
  descriptionContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  description: {
    fontSize: 16,
    color: '#555',
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
    alignItems: 'center',
  },
  optionText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noMealsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});