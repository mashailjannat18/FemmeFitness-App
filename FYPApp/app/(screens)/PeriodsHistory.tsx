import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function PeriodsHistory() {
  // Function to get the past 5 months in 'YYYY-MM' format
  const getPastMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 5; i++) {
      const pastDate = new Date(currentDate);
      pastDate.setMonth(currentDate.getMonth() - i);
      const year = pastDate.getFullYear();
      const month = String(pastDate.getMonth() + 1).padStart(2, '0'); // Ensure two digits
      months.push(`${year}-${month}`);
    }
    return months;
  };

  const pastMonths = getPastMonths();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false} // Hide scroll indicator
    >
      {/* Display calendars for the past 5 months */}
      {pastMonths.map((month, index) => (
        <View key={index} style={styles.calendarContainer}>
          <Text style={styles.monthHeader}>
            {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <Calendar
            current={month} // Set current month
            style={styles.calendar}
            hideExtraDays={true} // Hide days from other months
            firstDay={1} // Start the week on Monday
            theme={{
              monthTextColor: '#ff69b4', // Pink color for the month name
              dayTextColor: '#333', // Dark text color for days
              textDayFontWeight: 'bold', // Bold text for days
              textMonthFontWeight: 'bold', // Bold text for month name
              textDayHeaderFontWeight: 'bold', // Bold text for day headers
              backgroundColor: '#fff', // White background for the calendar
              calendarBackground: '#fff', // White background for the calendar
              selectedDayBackgroundColor: '#ff69b4', // Pink background for selected date
              selectedDayTextColor: '#fff', // White text for selected date
              todayTextColor: '#ff69b4', // Pink color for today's date
              arrowColor: '#ff69b4', // Pink color for navigation arrows
              textSectionTitleColor: '#ff69b4', // Pink color for day headers
              textDisabledColor: '#d3d3d3', // Light gray for disabled days
              dotColor: '#ff69b4', // Pink color for dots
              selectedDotColor: '#fff', // White color for selected dots
            }}
            // Custom styles for the calendar
            markingType={'custom'}
            markedDates={{
              [month]: {
                customStyles: {
                  container: styles.calendarDayContainer, // Style for the day container
                  text: styles.calendarDayText, // Style for the day text
                },
              },
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom for the last calendar
    backgroundColor: '#f9f9f9', // Light gray background for the screen
  },
  calendarContainer: {
    marginBottom: 40, // Consistent spacing between calendars
    backgroundColor: '#fff', // White background for each calendar container
    borderRadius: 15, // Rounded corners
    padding: 15, // Padding inside the container
    shadowColor: '#000', // Shadow for a card-like effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Elevation for Android
    borderWidth: 1, // Clear border around the container
    borderColor: '#ddd', // Light gray border color
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4', // Pink color for the month header
    marginBottom: 10,
    textAlign: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#eee', // Light border color
    borderRadius: 10,
    height: 320, // Increased height for the calendar to fit all dates
    width: '100%', // Ensure the calendar takes full width
  },
  calendarDayContainer: {
    // Custom styles for the day container
    borderWidth: 1,
    borderColor: '#eee', // Light border color for each day
    borderRadius: 5,
    margin: 2, // Add margin to ensure spacing between days
    justifyContent: 'center',
    alignItems: 'center',
    height: 36, // Slightly reduced height for better alignment
    width: 36, // Slightly reduced width for better alignment
  },
  calendarDayText: {
    // Custom styles for the day text
    color: '#333', // Dark text color
    fontWeight: 'bold',
  },
});