import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router'; // Import Expo Router's router
import { Calendar } from 'react-native-calendars'; // Import a calendar component

export default function Periods() {
  // Function to go back to the previous screen
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Display a simple message */}
        <Text style={styles.message}>Hi, Hello!</Text>

        {/* Calendar for the current month */}
        <View style={styles.calendarContainer}>
          <Calendar
            style={styles.calendar}
            current={new Date().toISOString().split('T')[0]} // Set current date
            hideExtraDays={true}
            enableSwipeMonths={true}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#ff69b4',  // Color for the section title (month)
              selectedDayBackgroundColor: '#ff69b4',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#ff69b4',
              dayTextColor: '#333333',
              textDisabledColor: '#d9d9d9',
              arrowColor: '#ff69b4',
              textMonthFontWeight: 'bold', // Make the month header bold
              textDayFontWeight: 'normal', // Changed to 'normal' to remove bold from dates
              monthTextColor: '#ff69b4',  // Set the same color as days for the month name
            }}
          />
        </View>

        {/* Symbols Section with Light Background */}
        <View style={styles.symbolsContainer}>
          <Text style={styles.symbolsHeading}>Symbols</Text>

          {/* Circle 1: Ovulation Window */}
          <View style={styles.symbolContainer}>
            <View style={[styles.circle, styles.ovulationCircle]} />
            <Text style={styles.symbolText}>Ovulation Window</Text>
          </View>

          {/* Circle 2: Luteal Phase (Dotted Circle) */}
          <View style={styles.symbolContainer}>
            <View style={[styles.circle, styles.lutealCircle]} />
            <Text style={styles.symbolText}>Luteal Phase</Text>
          </View>

          {/* Circle 3: Menstrual Phase */}
          <View style={styles.symbolContainer}>
            <View style={[styles.circle, styles.menstrualCircle]} />
            <Text style={styles.symbolText}>Menstrual Phase</Text>
          </View>

          {/* Circle 4: Follicular Phase */}
          <View style={styles.symbolContainer}>
            <View style={[styles.circle, styles.follicularCircle]} />
            <Text style={styles.symbolText}>Follicular Phase</Text>
          </View>
        </View>

        {/* Button to go back */}
        <TouchableOpacity onPress={handleGoBack} style={styles.button}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff', // White background for the entire screen
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF1493', // Pink color
    marginBottom: 20,
  },
  calendarContainer: {
    width: '100%',
    marginBottom: 30,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendar: {
    borderRadius: 10,
  },
  symbolsContainer: {
    width: '100%',
    backgroundColor: '#f8e3f5', // Light pastel pink background for symbols section
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  symbolsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  ovulationCircle: {
    backgroundColor: '#ff69b4', // Pink
  },
  lutealCircle: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ff69b4', // Pink dashed border
    backgroundColor: 'transparent',
  },
  menstrualCircle: {
    backgroundColor: 'red', // Red
  },
  follicularCircle: {
    backgroundColor: 'magenta', // Magenta
  },
  symbolText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#ff69b4', // Pink color for the button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    color: 'white', // White text color
    fontWeight: 'bold',
  },
});