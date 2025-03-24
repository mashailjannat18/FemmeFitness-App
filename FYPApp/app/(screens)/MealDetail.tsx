import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window'); // Get screen width

export default function MealDetail() {
  // Retrieve the passed parameters (meal and day)
  const { meal, day } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Pink bar with the dynamic day number */}
      <View style={styles.dayBar}>
        <Text style={styles.dayText}>{meal}</Text>
      </View>

      {/* Content for the image and the nutrients */}
      <View style={styles.contentContainer}>
        {/* Meal Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=1xw:0.9997037914691943xh;center,top' }} // Replace with your image URL
            style={styles.image}
          />
        </View>

        {/* Nutrients of the Day Text and Categories */}
        <View style={styles.nutrientsContainer}>
          <Text style={styles.nutrientsText}>Nutrients of the Day</Text>

          {/* Categories: Protein, Carbs, Fiber */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.categoryText}>Protein: 25g</Text>
            <Text style={styles.categoryText}>Carbs: 40g</Text>
            <Text style={styles.categoryText}>Fiber: 10g</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayBar: {
    width: '100%',
    backgroundColor: '#ff69b4', // Pink color
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align to the top
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%', // Make image container take the full width
    height: 200,  // Set image height
  },
  image: {
    width: width,  // Make image width the same as screen width
    height: 200,   // Keep height fixed
  },
  nutrientsContainer: {
    marginTop: 20,       // Space between the image and text
    alignItems: 'flex-start', // Align text to the left
    width: '100%',       // Make the container take the full width
    paddingRight: 20,    // Add some padding to the right
  },
  nutrientsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriesContainer: {
    marginTop: 10,  // Space between nutrients text and categories
  },
  categoryText: {
    fontSize: 16,
    color: '#555', // Slightly lighter color for the category text
    marginBottom: 5, // Add space between categories
  },
});