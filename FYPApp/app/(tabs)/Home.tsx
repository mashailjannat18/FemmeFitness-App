import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Exercises = {
  image: string;
  exercise_name: string;
  calories_burn: number;
  repetitions: number;
  id: string;
};

function getCurrentMonth() {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getCurrentMonthDates() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dates = [];
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push({ day: i.toString(), date: `${now.getFullYear()}-${now.getMonth() + 1}-${i}` });
  }
  return dates;
}

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [exercises, setExercises] = useState<Exercises | null>(null);
  const dates = getCurrentMonthDates();
  const router = useRouter();

  useEffect(() => {
    const fetchFirstExercise = async () => {
      const { data, error } = await supabase
        .from('Exercises')
        .select('image, exercise_name, calories_burn, repetitions, id')
        .limit(1)
        .single();
      if (error) {
        console.error('Error fetching exercise:', error);
      } else {
        setExercises(data);
      }
    };

    fetchFirstExercise();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section1}>
        <View style={styles.streakHeadingContainer}>
          <Text style={styles.streakText}>Streak</Text>
          <Text style={styles.monthText}>{currentMonth}</Text>
        </View>

        <FlatList
          data={dates}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.dateCircle}>
              <Text style={styles.dateText}>{item.day}</Text>
            </View>
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
                  style={[
                    styles.progressFill,
                    { width: `${(item.value / item.target) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressValue}>
                {item.value}/{item.target}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section3}>
        <Text style={styles.heading}>Today's Workout</Text>
        {exercises && (
          <TouchableOpacity
          style={styles.exerciseContainer}
          onPress={() => router.push(`/ExerciseDetail?id=${exercises.id}`)} 
        >
          <Image source={{ uri: exercises?.image }} style={styles.exerciseImage} />
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercises?.exercise_name}</Text>
            <View style={styles.exerciseStats}>
              <Text style={styles.statsText}>🔥 {exercises?.calories_burn} cal</Text>
              <Text style={styles.statsText}>🔁 {exercises?.repetitions} reps</Text>
            </View>
          </View>
        </TouchableOpacity>
             
        )}
      </View>

      <View style={styles.section4}>
        <Text style={styles.heading}>Today's Meal</Text>
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
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    height: 150,
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
});
