import React from 'react';
import { StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';

const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

export default function Workouts() {
  const router = useRouter();

  const navigateToExercises = (day: string) => {
    router.push(`../(screens)/Exercises?day=${day}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.imageContainer}>
        <Image source={require('../../assets/images/2.jpg')} style={styles.image} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Workout of the Day</Text>
        <Text style={styles.description}>
          Select a day to view its workout plan.
        </Text>

        <View style={styles.options}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigateToExercises(day)} 
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>{day}</Text>
            </TouchableOpacity>
          ))}
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
  description: {
    fontSize: 16,
    marginBottom: 16,
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
  },
  optionText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
