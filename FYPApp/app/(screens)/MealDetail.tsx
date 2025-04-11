import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

const { width } = Dimensions.get('window');

export default function MealDetail() {
  const { meal, day } = useLocalSearchParams();
  const { user } = useUserAuth();
  const [mealDetails, setMealDetails] = useState({
    daily_calories: 0,
    carbs_grams: 0,
    protein_grams: 0,
    fat_grams: 0,
  });

  useEffect(() => {
    const fetchMealDetails = async () => {
      if (!user || !day) {
        console.error('No user logged in or day parameter missing');
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

        const { data: mealData, error: mealError } = await supabase
          .from('DailyMealPlans')
          .select('daily_calories, carbs_grams, protein_grams, fat_grams')
          .eq('workout_plan_id', workoutPlan.id)
          .eq('day_number', Number(day))
          .single();

        if (mealError || !mealData) {
          console.error('Error fetching meal details:', mealError?.message || 'No meal data found for this day');
          return;
        }

        setMealDetails({
          daily_calories: mealData.daily_calories,
          carbs_grams: mealData.carbs_grams,
          protein_grams: mealData.protein_grams,
          fat_grams: mealData.fat_grams,
        });
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
    };

    fetchMealDetails();
  }, [user, day]);

  return (
    <View style={styles.container}>
      <View style={styles.dayBar}>
        <Text style={styles.dayText}>{meal}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top' }}
            style={styles.image}
          />
        </View>

        <View style={styles.nutrientsContainer}>
          <Text style={styles.nutrientsText}>Nutrients of the Day</Text>

          <View style={styles.categoriesContainer}>
            <Text style={styles.categoryText}>Calories: {mealDetails.daily_calories.toFixed(1)} kcal</Text>
            <Text style={styles.categoryText}>Protein: {mealDetails.protein_grams.toFixed(1)}g</Text>
            <Text style={styles.categoryText}>Carbs: {mealDetails.carbs_grams.toFixed(1)}g</Text>
            <Text style={styles.categoryText}>Fat: {mealDetails.fat_grams.toFixed(1)}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayBar: {
    width: '100%',
    backgroundColor: '#ff69b4',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: width,
    height: 200,
  },
  nutrientsContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
    width: '100%',
    paddingRight: 20,
  },
  nutrientsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
});