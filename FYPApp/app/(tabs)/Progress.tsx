import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, Image } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useUserAuth } from '@/context/UserAuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar } from 'react-native-calendars';
import { useRouter, useFocusEffect } from 'expo-router';
import Logo from '@/assets/images/Logo.png';

const screenWidth = Dimensions.get('window').width;

interface Metrics {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
}

interface MarkedDate {
  [date: string]: { marked: boolean; dotColor: string };
}

interface DailyCalories {
  date: string;
  caloriesBurned: number;
  caloriesGained: number;
}

interface DailySleep {
  date: string;
  sleepHours: number;
}

export default function Progress() {
  const { user } = useUserAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics>({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
  });
  const [signupMonth, setSignupMonth] = useState<string>('');
  const [signupDate, setSignupDate] = useState<Date | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDate>({});
  const [caloriesData, setCaloriesData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user logged in, cannot fetch data');
      return;
    }

    try {
      // Fetch signup date from User table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching signup date from User:', userError);
        return;
      }

      if (userData && userData.created_at) {
        const signup = new Date(userData.created_at);
        setSignupDate(signup);
        setSignupMonth(signup.toISOString().substring(0, 7));
      }

      // Fetch data from ExerciseCompletions
      const { data: completionsData, error: completionsError } = await supabase
        .from('ExerciseCompletions')
        .select('calories_burned, time_spent_seconds, completion_date, status')
        .eq('user_id', user.id);

      if (completionsError) {
        console.error('Error fetching metrics from ExerciseCompletions:', completionsError);
        return;
      }

      // Fetch data from DailyMealPlans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('DailyMealPlans')
        .select(`
          calories_intake,
          DailyWorkouts (
            id,
            daily_workout_date
          )
        `)
        .not('calories_intake', 'is', null)
        .in(
          'daily_workout_id',
          await supabase
            .from('DailyWorkouts')
            .select('id')
            .in(
              'workout_plan_id',
              await supabase
                .from('WorkoutPlans')
                .select('id')
                .eq('user_id', user.id)
                .then(({ data }) => data?.map((wp) => wp.id) || [])
            )
            .then(({ data }) => data?.map((dw) => dw.id) || [])
        );

      if (mealPlansError) {
        console.error('Error fetching data from DailyMealPlans:', mealPlansError);
        return;
      }

      // Fetch data from DailySleepRecords
      const { data: sleepRecordsData, error: sleepRecordsError } = await supabase
        .from('DailySleepRecords')
        .select('sleep_date, sleep_hours')
        .eq('user_id', user.id);

      if (sleepRecordsError) {
        console.error('Error fetching data from DailySleepRecords:', sleepRecordsError);
        return;
      }

      // Process calories data
      const caloriesBurnedByDate: { [key: string]: number } = {};
      if (completionsData) {
        completionsData.forEach((record) => {
          if (record.status === 'completed') {
            const date = record.completion_date.split('T')[0];
            if (!caloriesBurnedByDate[date]) {
              caloriesBurnedByDate[date] = 0;
            }
            caloriesBurnedByDate[date] += record.calories_burned || 0;
          }
        });
      }

      const caloriesGainedByDate: { [key: string]: number } = {};
      if (mealPlansData) {
        mealPlansData.forEach((record) => {
          if (record.calories_intake && record.DailyWorkouts?.daily_workout_date) {
            const date = record.DailyWorkouts.daily_workout_date.split('T')[0];
            caloriesGainedByDate[date] = record.calories_intake;
          }
        });
      }

      const allDates = Array.from(
        new Set([
          ...Object.keys(caloriesBurnedByDate),
          ...Object.keys(caloriesGainedByDate),
        ])
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      if (allDates.length === 0) {
        console.log('No exercises or meal plans found for user:', user.id);
        setCaloriesData({
          labels: ['No Data'],
          datasets: [
            {
              data: [0],
              color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
              strokeWidth: 3,
              withDots: true,
            },
            {
              data: [0],
              color: (opacity = 1) => `rgba(72, 61, 139, ${opacity})`,
              strokeWidth: 3,
              withDots: true,
            },
            {
              data: [1000], // Dummy dataset to set y-axis range
              color: (opacity = 1) => `rgba(0, 0, 0, 0)`, // Invisible
              strokeWidth: 0,
              withDots: false,
            },
          ],
        });
      } else {
        const dailyCalories: DailyCalories[] = allDates.map((date) => ({
          date,
          caloriesBurned: caloriesBurnedByDate[date] || 0,
          caloriesGained: caloriesGainedByDate[date] || 0,
        }));

        const labels: string[] = [];
        const caloriesBurnedData: number[] = [];
        const caloriesGainedData: number[] = [];

        dailyCalories.forEach((entry) => {
          const date = new Date(entry.date);
          const day = date.getDate();
          const month = date.toLocaleString('default', { month: 'short' });
          labels.push(`${day} ${month}`);
          caloriesBurnedData.push(entry.caloriesBurned);
          caloriesGainedData.push(entry.caloriesGained);
        });

        setCaloriesData({
          labels,
          datasets: [
            {
              data: caloriesGainedData,
              color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
              strokeWidth: 3,
              withDots: true,
            },
            {
              data: caloriesBurnedData,
              color: (opacity = 1) => `rgba(72, 61, 139, ${opacity})`,
              strokeWidth: 3,
              withDots: true,
            },
          ],
        });
      }

      // Process sleep data
      if (!sleepRecordsData || sleepRecordsData.length === 0) {
        console.log('No sleep records found for user:', user.id);
        setSleepData({
          labels: ['No Data'],
          datasets: [
            {
              data: [0],
              color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`,
            },
            {
              data: [8],
              color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`,
            },
          ],
        });
      } else {
        const sleepRecords: DailySleep[] = sleepRecordsData.map((record) => ({
          date: record.sleep_date,
          sleepHours: record.sleep_hours,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const labels: string[] = [];
        const sleepHoursData: number[] = [];
        const targetSleepHoursData: number[] = [];

        sleepRecords.forEach((entry) => {
          const date = new Date(entry.date);
          const day = date.getDate();
          const month = date.toLocaleString('default', { month: 'short' });
          labels.push(`${day} ${month}`);
          sleepHoursData.push(entry.sleepHours);
          targetSleepHoursData.push(8);
        });

        setSleepData({
          labels,
          datasets: [
            {
              data: sleepHoursData,
              color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`,
            },
            {
              data: targetSleepHoursData,
              color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`,
            },
          ],
        });
      }

      // Calculate metrics for completed exercises
      const completedExercises = completionsData?.filter((record) => record.status === 'completed') || [];
      const totalWorkouts = completedExercises.length;
      const totalCalories = completedExercises.reduce(
        (sum, record) => sum + (record.calories_burned || 0),
        0
      );
      const totalDurationSeconds = completedExercises.reduce(
        (sum, record) => sum + (record.time_spent_seconds || 0),
        0
      );
      const totalDuration = totalDurationSeconds / 60;

      setMetrics({
        totalWorkouts,
        totalCalories,
        totalDuration,
      });

      // Mark dates with completed or skipped exercises
      const marked: MarkedDate = {};
      if (completionsData) {
        completionsData.forEach((record) => {
          const date = record.completion_date.split('T')[0];
          marked[date] = {
            marked: true,
            dotColor: record.status === 'completed' ? '#00FF00' : '#FF0000',
          };
        });
      }
      setMarkedDates(marked);
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    }
  }, [user?.id]);

  // Reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Set up real-time subscriptions for database changes
  useEffect(() => {
    if (!user?.id) return;

    // Subscription for ExerciseCompletions table
    const exerciseSubscription = supabase
      .channel('exercise-completions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ExerciseCompletions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('ExerciseCompletions change detected:', payload);
          fetchData();
        }
      )
      .subscribe();

    // Subscription for DailyMealPlans table
    const mealPlanSubscription = supabase
      .channel('daily-meal-plans-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'DailyMealPlans',
        },
        (payload) => {
          console.log('DailyMealPlans change detected:', payload);
          fetchData();
        }
      )
      .subscribe();

    // Subscription for DailySleepRecords table
    const sleepSubscription = supabase
      .channel('daily-sleep-records-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'DailySleepRecords',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('DailySleepRecords change detected:', payload);
          fetchData();
        }
      )
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      supabase.removeChannel(exerciseSubscription);
      supabase.removeChannel(mealPlanSubscription);
      supabase.removeChannel(sleepSubscription);
    };
  }, [user?.id, fetchData]);

  const handleDayPress = (day: { dateString: string }) => {
    router.push({
      pathname: '/DailyProgress',
      params: { selectedDate: day.dateString },
    });
  };

  const chartWidth = caloriesData
    ? Math.max(screenWidth - 60, caloriesData.labels.length * 60)
    : screenWidth - 60;
  const chartHeight = 200;

  const sleepChartWidth = sleepData
    ? Math.max(screenWidth - 80, sleepData.labels.length * 60)
    : screenWidth - 80;
  const sleepChartHeight = 220;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.headerText}>Progress</Text>
        <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.row}>
          <View style={styles.item}>
            <FontAwesome name="heartbeat" size={24} color="#FF0000" />
            <Text style={styles.itemText}>Workouts</Text>
            <View style={styles.metricContainer}>
              <Text style={styles.animatedText}>{metrics.totalWorkouts.toFixed(0)}</Text>
              <Text style={styles.metricText}> workouts</Text>
            </View>
          </View>
          <View style={styles.item}>
            <MaterialIcons name="local-fire-department" size={24} color="#FFA500" />
            <Text style={styles.itemText}>Calories</Text>
            <View style={styles.metricContainer}>
              <Text style={styles.animatedText}>{metrics.totalCalories.toFixed(1)}</Text>
              <Text style={styles.metricText}> calories</Text>
            </View>
          </View>
          <View style={styles.item}>
            <FontAwesome name="clock-o" size={24} color="#00008B" />
            <Text style={styles.itemText}>Duration</Text>
            <View style={styles.metricContainer}>
              <Text style={styles.animatedText}>{metrics.totalDuration.toFixed(1)}</Text>
              <Text style={styles.metricText}> minutes</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>History</Text>
          <View style={styles.calendarContainer}>
            {signupMonth ? (
              <Calendar
                current={signupMonth}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={{
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#333',
                  selectedDayBackgroundColor: '#d63384',
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#00adf5',
                  dayTextColor: '#333',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#00FF00',
                  selectedDotColor: '#fff',
                  arrowColor: '#d63384',
                  monthTextColor: '#333',
                  textDayFontWeight: '400',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                }}
              />
            ) : (
              <Text style={styles.noDataText}>No workout history available.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Calories Gained vs Burned</Text>
          <View style={styles.chartContainer}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={{ flexGrow: 0 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={true}
                style={{ height: chartHeight + 20 }}
              >
                {caloriesData && (
                  <LineChart
                    data={caloriesData}
                    width={chartWidth}
                    height={chartHeight}
                    yAxisSuffix=" cal"
                    yAxisInterval={400}
                    withDots={true}
                    withShadow={false}
                    withInnerLines={true}
                    withOuterLines={true}
                    withHorizontalLines={true}
                    withVerticalLines={true}
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForDots: {
                        r: 5,
                        strokeWidth: 2,
                      },
                      propsForBackgroundLines: {
                        strokeWidth: 0.5,
                        stroke: '#e0e0e0',
                      },
                      fillShadowGradient: 'transparent',
                      fillShadowGradientOpacity: 0,
                    }}
                    bezier
                    style={styles.chartStyle}
                    formatXLabel={(label) => label}
                  />
                )}
              </ScrollView>
            </ScrollView>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6a5acd' }]} />
              <Text style={styles.legendText}>Gained</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#483d8b' }]} />
              <Text style={styles.legendText}>Burned</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Sleep Track</Text>
          <View style={styles.chartContainer}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={{ flexGrow: 0 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={true}
                style={{ height: sleepChartHeight + 20 }}
              >
                {sleepData && (
                  <BarChart
                    data={sleepData}
                    width={sleepChartWidth}
                    height={sleepChartHeight}
                    yAxisLabel=""
                    yAxisSuffix=" hrs"
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForBackgroundLines: {
                        strokeWidth: 0.4,
                        stroke: '#e0e0e0',
                      },
                      barPercentage: 0.9,
                    }}
                    style={styles.chartStyle}
                  />
                )}
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  row: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 35,
  },
  item: {
    alignItems: 'center',
  },
  itemText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#2F4F4F',
  },
  animatedText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  metricContainer: {
    display: 'flex',
    flexDirection: "row",
  },
  metricText: {
    fontSize: 12,
    paddingTop: 12,
  },
  section: {
    marginBottom: 20,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartStyle: {
    borderRadius: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  reportButtonContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  reportButton: {
    backgroundColor: '#FF69B4',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    width: '50%',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});