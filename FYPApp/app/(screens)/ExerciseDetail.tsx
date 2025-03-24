import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ExerciseDetailType = {
  id: string;
  exercise_name: string;
  description: string;
  reps: string;
  calories_burned: number;
};

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetailType | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) fetchExerciseDetail(id);
  }, [id]);

  const fetchExerciseDetail = async (exerciseId: string) => {
    try {
      const { data, error } = await supabase
        .from('Workouts')
        .select('id, exercise_name, description, reps, calories_burned')
        .eq('id', exerciseId)
        .single();

      if (error) throw new Error('Error fetching exercise detail: ' + error.message);
      setExerciseDetail(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleDonePress = async () => {
    if (!id) return;
    try {
      const storedExercises = await AsyncStorage.getItem('completedExercises');
      const completedExercises = storedExercises ? JSON.parse(storedExercises) : [];

      if (!completedExercises.includes(id)) {
        const updatedExercises = [...completedExercises, id];
        await AsyncStorage.setItem('completedExercises', JSON.stringify(updatedExercises));
      }

      router.push('/(screens)/Exercises');
    } catch (error) {
      console.error('Error saving completed exercise:', error);
    }
  };

  if (!exerciseDetail) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{exerciseDetail.exercise_name}</Text>
      </View>

      <Image source={{ uri: 'https://via.placeholder.com/230' }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>Description</Text>
        <Text style={styles.description}>{exerciseDetail.description}</Text>

        <Text style={styles.title}>Details</Text>
        <Text style={styles.description}>Reps: {exerciseDetail.reps}</Text>
        <Text style={styles.description}>Calories Burned: {exerciseDetail.calories_burned}</Text>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#d63384',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -25,
  },
  image: {
    width: '100%',
    height: 230,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 30,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  doneButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});