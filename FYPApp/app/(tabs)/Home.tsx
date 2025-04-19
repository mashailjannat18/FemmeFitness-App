import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Svg, { Circle, LinearGradient, Defs, Stop, Path, Rect } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { Calendar } from 'react-native-calendars';

// Types
type Exercise = {
  id: string;
  exercise_name: string;
  calories_burned: number;
  reps: string;
  description: string;
  daily_workout_id: string;
  image?: string;
};

type DailyWorkout = {
  id: string;
  day_name: string;
  daily_workout_date: string;
  focus: string;
  total_duration_min: number;
  total_calories_burned: number;
  exercises: Exercise[];
};

type DailyMeal = {
  id: string;
  day_number: number;
  daily_calories: number;
  carbs_grams: number;
  protein_grams: number;
  fat_grams: number;
};

type WorkoutDay = {
  day_number: number;
  day_name: string;
  date: string;
};

// Circular Progress Component
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  displayText?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 160,
  strokeWidth = 16,
  gradientId,
  displayText,
}): JSX.Element => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const stops =
    gradientId === 'caloriesBurntGradient'
      ? [
          { offset: '0%', stopColor: '#FF4040' },
          { offset: '100%', stopColor: '#8B0000' },
        ]
      : gradientId === 'caloriesGainedGradient'
      ? [
          { offset: '0%', stopColor: '#FF69B4' },
          { offset: '100%', stopColor: '#FF1493' },
        ]
      : [
          { offset: '0%', stopColor: '#BA55D3' },
          { offset: '100%', stopColor: '#4B0082' },
        ];

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {stops.map((stop, index) => (
              <Stop key={index} offset={stop.offset} stopColor={stop.stopColor} />
            ))}
          </LinearGradient>
        </Defs>
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={2}
        />
        <Circle
          stroke={`url(#${gradientId})`}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {displayText && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color:
                gradientId === 'caloriesBurntGradient'
                  ? '#FF4040'
                  : gradientId === 'caloriesGainedGradient'
                  ? '#FF69B4'
                  : '#BA55D3',
            }}
          >
            {displayText}
          </Text>
        </View>
      )}
    </View>
  );
};

// Water Glass Component
interface WaterGlassProps {
  progress: number;
  size?: number;
}

const WaterGlass: React.FC<WaterGlassProps> = ({ progress, size = 120 }): JSX.Element => {
  const glassWidth = size * 0.7;
  const glassHeight = size * 1.2;
  const glassX = (size - glassWidth) / 2;
  const glassBottomY = size - 15;
  const glassTopY = 15;
  const waterMaxHeight = glassHeight - 40;
  const waterHeight = (progress / 100) * waterMaxHeight;
  const waterY = glassBottomY - waterHeight;

  const glassPath = `
    M ${glassX + 10},${glassTopY} 
    C ${glassX},${glassTopY + 20} ${glassX},${glassTopY + 40} ${glassX + 5},${glassTopY + 60} 
    L ${glassX + 15},${glassBottomY - 20} 
    C ${glassX + 10},${glassBottomY} ${glassX + glassWidth - 10},${glassBottomY} ${glassX + glassWidth - 15},${glassBottomY - 20} 
    L ${glassX + glassWidth - 5},${glassTopY + 60} 
    C ${glassX + glassWidth},${glassTopY + 40} ${glassX + glassWidth},${glassTopY + 20} ${glassX + glassWidth - 10},${glassTopY} 
    Z
  `;

  const waterPath = `
    M ${glassX + 15},${glassBottomY - 20} 
    C ${glassX + 10},${glassBottomY} ${glassX + glassWidth - 10},${glassBottomY} ${glassX + glassWidth - 15},${glassBottomY - 20} 
    L ${glassX + glassWidth - 5},${glassTopY + 60} 
    L ${glassX + glassWidth - 5},${waterY} 
    L ${glassX + 5},${waterY} 
    L ${glassX + 5},${glassTopY + 60} 
    Z
  `;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E0F7FA" stopOpacity={0.6} />
          <Stop offset="50%" stopColor="#81D4FA" stopOpacity={0.8} />
          <Stop offset="100%" stopColor="#0288D1" stopOpacity={0.9} />
        </LinearGradient>
      </Defs>
      <Path d={glassPath} stroke="#B0B0B0" strokeWidth={1.5} fill="rgba(255, 255, 255, 0.1)" />
      <Path d={waterPath} fill="url(#waterGradient)" />
    </Svg>
  );
};

// Sleep Card Component
interface SleepCardProps {
  progress: number;
}

const SleepCard: React.FC<SleepCardProps> = ({ progress }): JSX.Element => {
  return (
    <View style={styles.sleepContainer}>
      <Svg width="100%" height="100%" style={styles.sleepBackground}>
        <Defs>
          <LinearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9C27B0" />
            <Stop offset="100%" stopColor="#673AB7" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx="16" fill="url(#sleepGradient)" />
      </Svg>
      <View style={styles.sleepContent}>
        <Text style={styles.sleepIcon}>🌙</Text>
        <Text style={styles.sleepTitle}>Sleep</Text>
        <Text style={styles.sleepProgressText}>
          {progress}/{8} hrs
        </Text>
      </View>
    </View>
  );
};

// Helper Functions
function getCurrentMonth() {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getWorkoutDays(challengeDays: number, startDate: string): WorkoutDay[] {
  const days: WorkoutDay[] = [];
  const start = new Date(startDate);
  for (let i = 1; i <= challengeDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + (i - 1));
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    days.push({
      day_number: i,
      day_name: `Day ${i} (${dayName})`,
      date: date.toISOString().split('T')[0],
    });
  }
  return days;
}

// Main Component
export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [dailyMeal, setDailyMeal] = useState<DailyMeal | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [streak, setStreak] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [preferredRestDay, setPreferredRestDay] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const router = useRouter();
  const { user } = useUserAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/Login');
      return;
    }
  }, [user, router]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutData();
      const backAction = () => true;
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, [user])
  );

  const fetchWorkoutData = async () => {
    if (!user || !user.id) return;
    try {
      // Fetch user details for rest day
      const { data: userData } = await supabase
        .from('User')
        .select('preferred_rest_day')
        .eq('id', user.id)
        .single();
      setPreferredRestDay(userData?.preferred_rest_day || null);

      // Fetch workout plan
      const { data: planData, error: planError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date, challenge_days')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (planError || !planData) throw new Error('No active workout plan found.');

      const days = getWorkoutDays(planData.challenge_days || 30, planData.start_date);
      setWorkoutDays(days);

      const today = new Date().toISOString().split('T')[0];

      // Fetch daily workout
      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .select('id, day_name, daily_workout_date, focus, total_duration_min, total_calories_burned')
        .eq('workout_plan_id', planData.id)
        .eq('daily_workout_date', today)
        .single();

      if (!dailyError && dailyData) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('Workouts')
          .select('id, exercise_name, calories_burned, reps, description, daily_workout_id')
          .eq('daily_workout_id', dailyData.id);

        if (exerciseError) throw new Error('Error fetching exercises.');

        // Fetch completions for today
        const { data: completionData, error: completionError } = await supabase
          .from('ExerciseCompletions')
          .select('workout_id')
          .eq('user_id', user.id)
          .eq('daily_workout_id', dailyData.id)
          .eq('completion_date::date', today);

        if (completionError) throw new Error('Error fetching completions.');

        const totalExercises = exerciseData?.length || 1;
        const completedExercises = completionData?.length || 0;
        const calculatedPercentage = Math.round((completedExercises / totalExercises) * 100);

        setProgressPercentage(calculatedPercentage);

        setDailyWorkout({
          id: dailyData.id,
          day_name: dailyData.day_name,
          daily_workout_date: dailyData.daily_workout_date,
          focus: dailyData.focus,
          total_duration_min: dailyData.total_duration_min,
          total_calories_burned: dailyData.total_calories_burned,
          exercises: exerciseData || [],
        });
      } else {
        setDailyWorkout(null);
        setProgressPercentage(0);
      }

      // Fetch daily meal
      const { data: mealData, error: mealError } = await supabase
        .from('DailyMealPlans')
        .select('id, day_number, daily_calories, carbs_grams, protein_grams, fat_grams')
        .eq('workout_plan_id', planData.id)
        .eq('day_number', days.find((day) => day.date === today)?.day_number || 0)
        .single();

      if (!mealError && mealData) {
        setDailyMeal({
          id: mealData.id,
          day_number: mealData.day_number,
          daily_calories: mealData.daily_calories,
          carbs_grams: mealData.carbs_grams,
          protein_grams: mealData.protein_grams,
          fat_grams: mealData.fat_grams,
        });
      } else {
        setDailyMeal(null);
      }

      // Fetch streak and calendar data
      await fetchStreakAndCalendar(planData.start_date, planData.challenge_days, userData?.preferred_rest_day);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setDailyWorkout(null);
      setDailyMeal(null);
      setWorkoutDays([]);
      setProgressPercentage(0);
    }
  };

  const fetchStreakAndCalendar = async (startDate: string, challengeDays: number, restDay: string | null) => {
    if (!user || !user.id) return;
    try {
      const days = getWorkoutDays(challengeDays, startDate);
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + challengeDays - 1);

      // Fetch all completions within the plan period
      const { data: completions } = await supabase
        .from('ExerciseCompletions')
        .select('completion_date')
        .eq('user_id', user.id)
        .gte('completion_date', start.toISOString())
        .lte('completion_date', end.toISOString());

      const workoutDates = completions?.map((c) => new Date(c.completion_date).toISOString().split('T')[0]) || [];
      const uniqueWorkoutDates = Array.from(new Set(workoutDates));

      // Mark calendar dates
      const marked: any = {};
      let currentStreak = 0;
      let streakBroken = false;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      for (let i = 0; i < challengeDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleString('default', { weekday: 'long' });

        if (restDay && dayName === restDay) {
          marked[dateStr] = { customStyles: { container: { backgroundColor: '#D3D3D3' }, text: { color: '#FFF' } } };
          continue;
        }

        if (uniqueWorkoutDates.includes(dateStr)) {
          marked[dateStr] = { customStyles: { container: { backgroundColor: '#FF69B4' }, text: { color: '#FFF' } } };
          if (!streakBroken) currentStreak++;
        } else if (date <= today && !streakBroken) {
          streakBroken = true;
        }

        if (dateStr === tomorrow.toISOString().split('T')[0] && uniqueWorkoutDates.includes(today.toISOString().split('T')[0])) {
          marked[dateStr] = { customStyles: { container: { borderWidth: 2, borderColor: '#FF69B4' }, text: { color: '#000' } } };
        }
      }

      setMarkedDates(marked);
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error fetching streak:', error);
      setMarkedDates({});
      setStreak(0);
    }
  };

  const navigateToExercises = (dayName: string) => {
    router.push(`/(screens)/Exercises?day=${dayName}`);
  };

  if (!user || !user.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Please Log In</Text>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/Login')}>
          <Text style={styles.seeAllText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Streak Card */}
      <View style={[styles.card, styles.streakCard]}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakTitle}>🔥 Current Streak</Text>
          <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
            <Text style={styles.calendarLink}>Calendar</Text>
          </TouchableOpacity>
          <Text style={styles.streakDays}>{streak} days</Text>
        </View>
        <Text style={styles.month}>{currentMonth}</Text>

        {showCalendar ? (
          <Calendar
            markedDates={markedDates}
            markingType={'custom'}
            style={styles.calendar}
            theme={{
              calendarBackground: '#FFF',
              textSectionTitleColor: '#000',
              todayTextColor: '#EC4899',
              dayTextColor: '#000',
              arrowColor: '#EC4899',
            }}
            onDayPress={(day) => {
              const selectedDay = workoutDays.find((d) => d.date === day.dateString);
              if (selectedDay) navigateToExercises(selectedDay.day_name);
            }}
          />
        ) : (
          <FlatList
            data={workoutDays}
            keyExtractor={(item) => item.date}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item, index }) => {
              const today = new Date().toISOString().split('T')[0];
              const isCurrentDate = item.date === today;
              return (
                <TouchableOpacity
                  style={[
                    styles.dateItem,
                    index < 7 && styles.activeDateItem,
                    isCurrentDate && styles.currentDateItem,
                  ]}
                  onPress={() => navigateToExercises(item.day_name)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      isCurrentDate && styles.currentDateText,
                    ]}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index % 7]}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      isCurrentDate && styles.currentDateText,
                    ]}
                  >
                    {item.day_number}
                  </Text>
                  {isCurrentDate && <View style={styles.currentDayIndicator} />}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.progressGrid}>
          <View style={[styles.progressCard, { height: 260 }]}>
            <Text style={styles.progressIcon}>📈</Text>
            <Text style={styles.progressTitle}>Calories Gained</Text>
            <CircularProgress
              progress={dailyMeal ? (dailyMeal.daily_calories / 2000) * 100 : 0}
              gradientId="caloriesGainedGradient"
              displayText={dailyMeal ? `${dailyMeal.daily_calories.toFixed(1)}/2000 cal` : '0/2000 cal'}
            />
          </View>

          <View style={[styles.progressCard, { height: 260 }]}>
            <Text style={styles.progressIcon}>🔥</Text>
            <Text style={styles.progressTitle}>Calories Burnt</Text>
            <CircularProgress
              progress={dailyWorkout ? (dailyWorkout.total_calories_burned / 500) * 100 : 0}
              gradientId="caloriesBurntGradient"
              displayText={dailyWorkout ? `${dailyWorkout.total_calories_burned}/500 cal` : '0/500 cal'}
            />
          </View>

          <View style={[styles.progressCard, { height: 260 }]}>
            <SleepCard progress={6} />
          </View>

          <View style={[styles.progressCard, { height: 260 }]}>
            <Text style={styles.progressIcon}>💧</Text>
            <Text style={styles.progressTitle}>Water</Text>
            <WaterGlass progress={66.67} />
            <Text style={styles.progressText}>2/3 L</Text>
          </View>
        </View>
      </View>

      {/* Workout Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          <TouchableOpacity onPress={() => navigateToExercises(dailyWorkout?.day_name || 'Today')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {dailyWorkout ? (
          dailyWorkout.focus.toLowerCase().includes('rest') ? (
            <View style={[styles.card, styles.workoutCard]}>
              <Text style={styles.noWorkoutText}>Today is a Rest Day. No exercises scheduled.</Text>
            </View>
          ) : dailyWorkout.exercises.length > 0 ? (
            <TouchableOpacity
              style={[styles.card, styles.workoutCard]}
              onPress={() => navigateToExercises(dailyWorkout.day_name)}
            >
              <View style={styles.workoutRow}>
                <Image
                  source={{
                    uri: dailyWorkout.exercises[0].image || 'https://via.placeholder.com/80',
                  }}
                  style={styles.workoutImage}
                />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{dailyWorkout.exercises[0].exercise_name}</Text>
                  <View style={styles.workoutStats}>
                    <View style={styles.workoutStatItem}>
                      <Text style={styles.workoutStatIcon}>🔥</Text>
                      <Text style={styles.workoutStatText}>
                        {dailyWorkout.exercises[0].calories_burned} cal
                      </Text>
                    </View>
                    <View style={styles.workoutStatItem}>
                      <Text style={styles.workoutStatIcon}>🔁</Text>
                      <Text style={styles.workoutStatText}>
                        {dailyWorkout.exercises[0].reps} reps
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.workoutProgress}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressLabel}>{progressPercentage}% completed</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, styles.workoutCard]}>
              <Text style={styles.noWorkoutText}>No exercises scheduled for today.</Text>
            </View>
          )
        ) : (
          <View style={[styles.card, styles.workoutCard]}>
            <Text style={styles.noWorkoutText}>No workout scheduled for today.</Text>
          </View>
        )}
      </View>

      {/* Nutrition Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/(screens)/MealDetail?meal=Day ${dailyMeal?.day_number || 'Today'}&day=${
                  dailyMeal?.day_number || 0
                }`
              )
            }
          >
            <Text style={styles.seeAllText}>See Details</Text>
          </TouchableOpacity>
        </View>
        {dailyMeal ? (
          <View style={[styles.card, styles.mealContainer]}>
            <Text style={styles.mealText}>Day {dailyMeal.day_number}</Text>
            <View style={styles.mealDetails}>
              <Text style={styles.mealDetailText}>
                Calories: {dailyMeal.daily_calories.toFixed(1)} kcal
              </Text>
              <Text style={styles.mealDetailText}>
                Carbs: {dailyMeal.carbs_grams.toFixed(1)}g
              </Text>
              <Text style={styles.mealDetailText}>
                Protein: {dailyMeal.protein_grams.toFixed(1)}g
              </Text>
              <Text style={styles.mealDetailText}>
                Fat: {dailyMeal.fat_grams.toFixed(1)}g
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.mealContainer]}>
            <Text style={styles.noMealText}>No meal plan available for today.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  streakCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
    paddingLeft: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  calendarLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  streakDays: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
  },
  month: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  dateList: {
    paddingVertical: 8,
  },
  dateItem: {
    width: 44,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeDateItem: {
    backgroundColor: '#FCE7F3',
    borderColor: '#EC4899',
  },
  currentDateItem: {
    width: 48,
    height: 72,
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentDateText: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentDayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  calendar: {
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    marginVertical: 20,
    backgroundColor: '#EC4899',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  progressIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  sleepContainer: {
    borderRadius: 16,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  sleepBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sleepContent: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    padding: 16,
  },
  sleepIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#FFF',
  },
  sleepTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sleepProgressText: {
    color: '#FFF',
    fontSize: 25,
    fontWeight: '600',
    marginTop: 8,
  },
  workoutCard: {
    padding: 0,
    overflow: 'hidden',
  },
  workoutRow: {
    flexDirection: 'row',
    padding: 16,
  },
  workoutImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
  },
  workoutStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatIcon: {
    marginRight: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: '#4B5563',
  },
  workoutProgress: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    padding: 16,
  },
  mealContainer: {
    padding: 16,
  },
  mealText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  mealDetails: {
    width: '100%',
    alignItems: 'flex-start',
  },
  mealDetailText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 2,
  },
  noMealText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    padding: 16,
  },
});