import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';

type Exercise = {
  id: string;
  exercise_name: string;
  calories_burned: number;
  reps: string;
  description: string;
  daily_workout_id: string;
};

type DailyWorkout = {
  id: string;
  day_name: string;
  daily_workout_date: string;
  focus: string;
  exercises: Exercise[];
};

type WorkoutDay = {
  day_number: number;
  day_name: string;
  date: string;
};

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

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const router = useRouter();
  const { user, logout } = useUserAuth();

  useEffect(() => {
    if (!user || !user.id) {
      console.log('No user logged in or invalid user ID, redirecting to Login');
      router.push('/Login');
      return;
    }

    console.log('Logged-in user:', user);
    fetchWorkoutData();
  }, [user, router]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => true;
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, [])
  );

  const fetchWorkoutData = async () => {
    if (!user || !user.id) {
      console.log('Cannot fetch workout data: user or user.id is missing');
      return;
    }

    try {
      // Step 1: Fetch active workout plan for the logged-in user
      const { data: planData, error: planError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date, challenge_days')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (planError || !planData) {
        console.error('Error fetching workout plan for user', user.id, ':', planError);
        throw new Error('No active workout plan found for this user. Please create a new workout plan.');
      }

      console.log('WorkoutPlans query result for user', user.id, ':', { planData, planError });

      // Step 2: Set workout days based on the plan
      const days = getWorkoutDays(planData.challenge_days || 30, planData.start_date);
      setWorkoutDays(days);

      // Step 3: Fetch today's workout
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching workout for today:', today, 'for user', user.id);
      console.log('Workout plan ID:', planData.id);

      const { data: dailyData, error: dailyError } = await supabase
        .from('DailyWorkouts')
        .select('id, day_name, daily_workout_date, focus')
        .eq('workout_plan_id', planData.id)
        .eq('daily_workout_date', today)
        .single();

      if (dailyError || !dailyData) {
        console.log('No workout found for today for user', user.id, ':', dailyError?.message || 'No data');
        setDailyWorkout(null);
        return;
      }

      console.log('DailyWorkouts query result for user', user.id, ':', { dailyData, dailyError });

      // Step 4: Fetch exercises for today's workout
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('Workouts')
        .select('id, exercise_name, calories_burned, reps, description, daily_workout_id')
        .eq('daily_workout_id', dailyData.id);

      if (exerciseError) {
        console.error('Error fetching exercises for user', user.id, ':', exerciseError);
        throw new Error('Error fetching exercises: ' + exerciseError.message);
      }

      console.log('Workouts query result for user', user.id, ':', { exerciseData, exerciseError });

      setDailyWorkout({
        id: dailyData.id,
        day_name: dailyData.day_name,
        daily_workout_date: dailyData.daily_workout_date,
        focus: dailyData.focus,
        exercises: exerciseData || [],
      });
    } catch (error: any) {
      console.error('Error fetching workout data for user', user?.id, ':', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred while fetching workout data.');
      setDailyWorkout(null);
      setWorkoutDays([]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section1}>
        <View style={styles.streakHeadingContainer}>
          <Text style={styles.streakText}>Streak</Text>
          <Text style={styles.monthText}>{currentMonth}</Text>
        </View>

        <FlatList
          data={workoutDays}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dateCircle}
              onPress={() => router.push(`/Exercises?day=${item.day_name}`)}
            >
              <Text style={styles.dateText}>{item.day_number}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.datesContainer}
        />

        <TouchableOpacity onPress={() => console.log('Open Calendar')}>
          <Text style={styles.linkText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section2}>
        <Text style={styles.heading1}>Daily Progress</Text>
        {[
          { title: 'Calories Burnt', value: 300, target: 500 },
          { title: 'Calories Gained', value: 1500, target: 2000 },
          { title: 'Sleep Intake', value: 6, target: 8 },
          { title: 'Water Intake', value: 2, target: 3 },
        ].map((item, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <Text style={styles.progressTitle}>{item.title}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${(item.value / item.target) * 100}%` }]}
                />
              </View>
              <Text style={styles.progressValue}>{item.value}/{item.target}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section3}>
        <Text style={styles.heading}>Today's Workout</Text>
        {dailyWorkout ? (
          dailyWorkout.focus === 'Rest Day' ? (
            <Text style={styles.noWorkoutText}>Today is a Rest Day. No exercises scheduled.</Text>
          ) : dailyWorkout.exercises.length > 0 ? (
            dailyWorkout.exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseContainer}
                onPress={() => router.push(`/ExerciseDetail?id=${exercise.id}`)}
              >
                <Image
                  source={{ uri: 'https://via.placeholder.com/100' }}
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.statsText}>🔥 {exercise.calories_burned} cal</Text>
                    <Text style={styles.statsText}>🔁 {exercise.reps} reps</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noWorkoutText}>No exercises found for today.</Text>
          )
        ) : (
          <Text style={styles.noWorkoutText}>No workout scheduled for today.</Text>
        )}
      </View>

      <View style={styles.section4}>
        <Text style={styles.heading}>Today's Meal</Text>
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  streakHeadingContainer: {
    flexDirection: 'row',
    gap: 145,
  },
  monthText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
  },
  streakText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
  },
  datesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCircle: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateText: {
    fontSize: 16,
    color: 'black',
  },
  linkText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  section1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 100,
  },
  section2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 25,
  },
  section3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  section4: {
    marginBottom: 50,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -115,
  },
  progressBarContainer: {
    marginVertical: 7,
    width: '100%',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 7.5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d63384',
  },
  progressValue: {
    fontSize: 14,
    color: 'black',
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
    padding: 15,
    marginTop: 10,
    width: '100%',
  },
  exerciseImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsText: {
    fontSize: 16,
    marginLeft: 5,
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#d63384',
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});