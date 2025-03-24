import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

function PeriodsHistory() {
  const navigation = useNavigation();

  const getPastMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 5; i++) {
      const pastDate = new Date(currentDate);
      pastDate.setMonth(currentDate.getMonth() - i);
      const year = pastDate.getFullYear();
      const month = String(pastDate.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }
    return months;
  };

  const pastMonths = getPastMonths();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section (No Back Arrow) */}
      <View style={styles.header}>
        <Text style={styles.heading}>📅 Periods History</Text>
        <Text style={styles.subHeading}>Track your cycle with ease</Text>
      </View>

      {/* Scrollable Calendar Section */}
      {pastMonths.map((month, index) => (
        <View key={index} style={styles.calendarContainer}>
          <Text style={styles.monthHeader}>
            {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <Calendar
            current={month}
            style={styles.calendar}
            hideExtraDays={true}
            firstDay={1}
            theme={{
              monthTextColor: '#ff69b4',
              dayTextColor: '#333',
              textDayFontWeight: 'bold',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              selectedDayBackgroundColor: '#ff69b4',
              selectedDayTextColor: '#fff',
              todayTextColor: '#ff69b4',
              arrowColor: '#ff69b4',
              textSectionTitleColor: '#ff69b4',
              textDisabledColor: '#d3d3d3',
              dotColor: '#ff69b4',
              selectedDotColor: '#fff',
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
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4081',
  },
  subHeading: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  calendarContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffb6c1',
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4081',
    marginBottom: 10,
    textAlign: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ffb6c1',
    borderRadius: 12,
    minHeight: 320,
    width: '100%',
  },
});

export default PeriodsHistory;
