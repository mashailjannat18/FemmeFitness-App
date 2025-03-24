import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'; // Import Expo Router's router

export default function Periods() {
  // Function to go back to the previous screen
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Display a simple message */}
      <Text style={styles.message}>Hi, Hello!</Text>

      {/* Button to go back */}
      <TouchableOpacity onPress={handleGoBack} style={styles.button}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4', // Pink color
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff69b4', // Pink color for the button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: 'white', // White text color
    fontWeight: 'bold',
  },
});