import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Exercises() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const router = useRouter();
  const navigation = useNavigation(); // Get the navigation instance

  useEffect(() => {
    fetchExercises();
    loadCompletedExercises();
  }, []);

  useEffect(() => {
    // Ensure the back button navigates to the workout screen
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase.from('Exercises').select('*');
      if (error) throw error;
      setExercises(data || []);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  };

  const loadCompletedExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem('completedExercises');
      if (storedExercises) {
        setCompletedExercises(JSON.parse(storedExercises));
      }
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    }
  };

  const allExercisesCompleted = exercises.length > 0 && completedExercises.length === exercises.length;

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Exercises</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/ExerciseDetail?id=${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.exerciseImage} />
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.exercise_name}</Text>
              <Text style={styles.repetitions}>{item.repetitions} reps</Text>
            </View>
            {completedExercises.includes(item.id) && (
              <Ionicons name="checkmark-circle" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        )}
      />

      {/* Finish Button (Enabled only when all exercises are completed) */}
      <TouchableOpacity
        style={[styles.doneButton, !allExercisesCompleted && styles.disabledButton]}
        disabled={!allExercisesCompleted}
        onPress={() => console.log('All exercises completed!')}
      >
        <Text style={styles.doneButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20 
  },

  headerText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginVertical: 20 
    
  },

  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd' 
  },

  exerciseImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    marginRight: 10 
  },


  exerciseInfo: { 
    flex: 1 

  },

  exerciseName: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  repetitions: { 
    fontSize: 14, 
    color: '#555' 
  },

  checkIcon: { 
    fontSize: 24, 
    color: 'green', 
    marginLeft: 10 
  },

  doneButton: { 
    backgroundColor: '#ff69b4', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 20, 
    alignItems: 'center'
   },

  disabledButton: { 
    backgroundColor: '#ccc'
   },

  doneButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold'
   },
});
