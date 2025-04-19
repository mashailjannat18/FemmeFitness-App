import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

const { width } = Dimensions.get('window');

// TypeScript interface for nutrients
interface Nutrient {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  value: number;
  color: string;
  name: string;
}

export default function MealDetail() {
  const { meal, day } = useLocalSearchParams();
  const { user } = useUserAuth();
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);

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

        // Map fetched data to nutrients array
        setNutrients([
          { name: 'Protein', value: mealData.protein_grams, color: '#8e44ad' },
          { name: 'Carbs', value: mealData.carbs_grams, color: '#e67e22' },
          { name: 'Fat', value: mealData.fat_grams, color: '#16a085' },
        ]);
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
    };

    fetchMealDetails();
  }, [user, day]);

  const DonutChart: React.FC<DonutChartProps> = ({ value, color, name }) => {
    const radius = 60;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const percentage = value / (value + 100); // Normalize for display
    const strokeDashoffset = circumference * (1 - percentage);
    const svgSize = 140;

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.categoryText, { color }]}>{name}</Text>
        <Svg width={svgSize} height={svgSize} style={styles.chartSvg}>
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation={-90}
            originX={svgSize / 2}
            originY={svgSize / 2}
          />
          <SvgText
            x={svgSize / 2}
            y={svgSize / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="18"
            fill="#333"
          >
            {`${value.toFixed(1)}g`}
          </SvgText>
        </Svg>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.dayBar}>
          <Text style={styles.dayText}>{meal}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                'https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top',
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.nutrientsTitle}>Nutrient Breakdown</Text>
        <View style={styles.chartRow}>
          {nutrients.map((nutrient) => (
            <DonutChart
              key={nutrient.name}
              value={nutrient.value}
              color={nutrient.color}
              name={nutrient.name}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 10,
  },
  dayBar: {
    backgroundColor: '#f06292',
    width: width,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  dayText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginVertical: 10,
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  nutrientsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#444',
  },
  chartRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    margin: 10,
  },
  chartSvg: {
    marginTop: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});