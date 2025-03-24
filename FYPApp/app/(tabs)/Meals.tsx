import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const meals = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

export default function Meals() {
  const [imageUrl] = useState('https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top');  // Set default image URL
  const router = useRouter();

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
          {meals.map((meal, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigateToMealDetail(meal, index + 1)} // Pass the index + 1 as the day number
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>{meal}</Text>
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
  descriptionContainer: {
    marginBottom: 16,  // Adjust spacing between description and meal list
    alignItems: 'flex-start',  // Align text to the left
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
});