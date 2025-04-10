import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { useUserAuth } from '@/context/UserAuthContext'; // Import the auth context

export default function Meals() {
  const [imageUrl] = useState('https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top');
  const [meals, setMeals] = useState<string[]>([]); // State to store meal plan days
  const router = useRouter();
  const { user } = useUserAuth(); // Get the logged-in user

  // Fetch the meal plan for the logged-in user
  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user) {
        console.error('No user logged in');
        return;
      }

      try {
        // Fetch the user's active workout plan
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

        // Fetch the meal plan associated with the workout plan
        const { data: mealPlan, error: mealPlanError } = await supabase
          .from('DailyMealPlans')
          .select('day_number')
          .eq('workout_plan_id', workoutPlan.id)
          .order('day_number', { ascending: true });

        if (mealPlanError || !mealPlan) {
          console.error('Error fetching meal plan:', mealPlanError?.message || 'No meal plan found');
          return;
        }

        // Map the meal plan days to the format "Day X"
        const mealDays = mealPlan.map((meal) => `Day ${meal.day_number}`);
        setMeals(mealDays);
      } catch (error) {
        console.error('Error fetching meal plan:', error);
      }
    };

    fetchMealPlan();
  }, [user]);

  // Function to navigate to MealDetail screen and pass the day number as 'day'
  const navigateToMealDetail = (meal: string, dayNumber: number) => {
    router.push({
      pathname: '../(screens)/MealDetail',
      params: { meal, day: dayNumber }, // Pass meal name and day number
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Meals</Text>

        {/* Description placed under the heading, aligned to the left */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Select a meal to view its details.
          </Text>
        </View>

        {/* List of meal options */}
        <View style={styles.options}>
          {meals.length > 0 ? (
            meals.map((meal, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToMealDetail(meal, index + 1)} // Pass the index + 1 as the day number
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
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  noMealsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});