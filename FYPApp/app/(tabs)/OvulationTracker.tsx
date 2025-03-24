import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars'; // Import calendar component
import { router } from 'expo-router'; // Import Expo Router's router
import XDate from 'xdate'; // Import XDate

export default function OvulationTracker() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Handle date selection from the calendar
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7); // Get current month in 'YYYY-MM' format

  // Handle Log Period button press
  const handleLogPeriodPress = () => {
    router.push('/(screens)/Periods'); // Correct route path
  };

  // Handle History button press
  const handleHistoryPress = () => {
    router.push('/(screens)/PeriodsHistory'); // Navigate to PeriodsHistory screen
  };

  // Custom header component
  const renderHeader = (date?: XDate) => {
    if (!date) return null; // Handle undefined case

    const month = date.toString('MMMM'); // Get full month name
    const year = date.getFullYear(); // Get year
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{`${month} ${year}`}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Calendar on top */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={currentMonth} // Set current month
          onDayPress={handleDayPress}
          monthFormat={'MMMM yyyy'} // Format to display full month name and year
          markingType={'dot'} // Marking type for selected dates
          markedDates={{
            [selectedDate || '']: {
              selected: true,
              selectedColor: '#ff69b4', // Pink color for selected date
              selectedTextColor: 'white',
            },
          }}
          style={styles.calendar}
          horizontal={true} // Enable horizontal scrolling
          pagingEnabled={true} // Enable paging between months
          hideExtraDays={true} // Hide days from other months
          firstDay={1} // Start the week on Monday
          enableSwipeMonths={false} // Disable swiping between months
          renderHeader={renderHeader} // Custom header component
          theme={{
            selectedDayBackgroundColor: '#ff69b4', // Pink background for selected date
            selectedDayTextColor: 'white',
            todayTextColor: '#ff69b4', // Pink color for today's date
            arrowColor: '#ff69b4', // Pink color for the navigation arrows
            monthTextColor: '#ff69b4', // Pink color for the month name
            dayTextColor: '#333', // Dark text color for days
            textDayFontWeight: 'bold', // Bold text for days
            textMonthFontWeight: 'bold', // Bold text for month name
            textDayHeaderFontWeight: 'bold', // Bold text for day headers
            todayBackgroundColor: '#fff', // White background for today's box
            backgroundColor: '#fff', // White background for the calendar
          }}
        />
      </View>

      {/* Cycle Day Text */}
      <Text style={styles.cycleDayText}>Cycle Day</Text>

      {/* Phase Text */}
      <Text style={styles.phaseText}>Phase</Text>

      {/* Log Period TouchableOpacity */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogPeriodPress} // Handle button press
          style={styles.optionButton}
        >
          <Text style={styles.optionText}>Log Period</Text>
        </TouchableOpacity>
      </View>

      {/* My Cycles Text */}
      <Text style={styles.myCyclesText}>My Cycles</Text>

      {/* History Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleHistoryPress} // Handle button press
          style={[styles.optionButton, { backgroundColor: '#4CAF50' }]} // Green color for the button
        >
          <Text style={styles.optionText}>History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // Ensure background color is white
  },
  calendarContainer: {
    width: '100%',
    marginBottom: 20, // Ensure marginBottom is defined here
    alignItems: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    height: 350, // Fixed height for the calendar
    width: '100%', // Ensure the calendar takes full width
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4', // Pink color for header text
  },
  cycleDayText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  phaseText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '30%', // Adjust width to make the button smaller
    alignSelf: 'center', // Center the button horizontally
  },
  optionButton: {
    backgroundColor: 'red', // Red color for the button
    borderRadius: 5,
    paddingVertical: 10, // Padding for button height
    alignItems: 'center', // Center text inside button
  },
  optionText: {
    fontSize: 16,
    color: 'white', // White text color
    fontWeight: 'bold',
  },
  myCyclesText: {
    fontSize: 16,
    marginTop: 20,
    color: '#555',
    textAlign: 'center',
  },
});