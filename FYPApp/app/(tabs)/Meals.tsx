import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '@/assets/images/Logo.png';

type MealPlan = {
  dayName: string;
  dailyWorkoutId: string;
  dailyCalories: number;
  caloriesIntake: number;
  isCompleted: boolean;
};

export default function Meals() {
  const [imageUrl] = useState(
    'https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top'
  );
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const router = useRouter();
  const { user } = useUserAuth();

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user) {
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

        const { data: mealPlans, error: mealPlanError } = await supabase
          .from('DailyMealPlans')
          .select(`
            daily_workout_id,
            daily_calories,
            calories_intake,
            DailyWorkouts (
              id,
              day_name
            )
          `)
          .eq('workout_plan_id', workoutPlan.id)
          .order('daily_workout_id', { ascending: true });

        if (mealPlanError || !mealPlans) {
          console.error('Error fetching meal plan:', mealPlanError?.message || 'No meal plan found');
          return;
        }

        const mealData = mealPlans.map((meal) => {
          const dailyCalories = meal.daily_calories || 0;
          const caloriesIntake = meal.calories_intake || 0;
          const isCompleted = caloriesIntake >= dailyCalories && dailyCalories > 0;

          return {
            dayName: meal.DailyWorkouts?.day_name || `Day ${meal.daily_workout_id}`,
            dailyWorkoutId: meal.daily_workout_id,
            dailyCalories: dailyCalories,
            caloriesIntake: caloriesIntake,
            isCompleted: isCompleted,
          };
        });

        setMeals(mealData);
      } catch (error) {
        console.error('Error fetching meal plan:', error);
      }
    };

    fetchMealPlan();
  }, [user]);

  const navigateToMealDetail = (meal: string, dailyWorkoutId: string) => {
    router.push({
      pathname: '../(screens)/MealDetail',
      params: { meal, dailyWorkoutId, from: 'meals' },
    });
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.headerText}>Meals</Text>
        <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
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
                  onPress={() => navigateToMealDetail(meal.dayName, meal.dailyWorkoutId)}
                  style={styles.calendarDay}
                >
                  <View style={styles.dayContainer}>
                    <View style={styles.dayNumberContainer}>
                      <View style={styles.dayNumberSquare}>
                        <Text style={styles.dayNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.separator} />
                    </View>

                    <View style={styles.workoutInfo}>
                      <Text style={styles.dayFocus}>{meal.dayName}</Text>
                      <View style={styles.dayStats}>
                        <View style={styles.statItem}>
                          <MaterialIcons name="local-fire-department" size={scaleFont(14)} color="#FFA500" />
                          <Text style={styles.statText}>{meal.dailyCalories} cal</Text>
                        </View>
                      </View>
                    </View>

                    {meal.isCompleted && (
                      <View style={styles.rightSection}>
                        <View style={styles.separator} />
                        <MaterialIcons name="check-circle" size={scaleFont(20)} color="#FF1493" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noWorkoutsText}>No meal plan available.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Responsive utilities
const { width, height } = Dimensions.get('window');
const scale = (size: number) => Math.min(width, 500) / 375 * size; // Cap at 500px for large screens
const scaleFont = (size: number) => Math.round(Math.min(width, 500) / 375 * size);
const isLargeScreen = width >= 600;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ff1297',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  content: {
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#FF1493',
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    color: '#555',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: scale(12),
    backgroundColor: 'white',
  },
  calendarDay: {
    width: isLargeScreen ? '31%' : width < 400 ? '100%' : '48%', // 1 column on small, 2 on medium, 3 on large
    backgroundColor: '#fff',
    borderRadius: scale(10),
    padding: scale(10),
    marginBottom: scale(12),
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
    backgroundColor: '#fff',
  },
  dayNumberContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(10),
  },
  dayNumberSquare: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(8),
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  separator: {
    height: scale(36),
    width: scale(1),
    backgroundColor: '#e0e0e0',
    marginHorizontal: scale(8),
  },
  workoutInfo: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: scale(8),
  },
  dayFocus: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(6),
  },
  dayStats: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(8),
    marginBottom: scale(4),
    backgroundColor: 'white',
  },
  statText: {
    fontSize: scaleFont(12),
    color: '#555',
    marginLeft: scale(4),
  },
  rightSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  noWorkoutsText: {
    fontSize: scaleFont(14),
    color: '#555',
    textAlign: 'center',
    marginTop: scale(12),
    width: '100%',
  },
});