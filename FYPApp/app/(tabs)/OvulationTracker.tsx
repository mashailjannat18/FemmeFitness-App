import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';
import XDate from 'xdate';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Better icons

export default function OvulationTracker() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]); // Track selected symptoms

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);

  const handleLogPeriodPress = () => {
    router.push('/(screens)/Periods');
  };

  const handleHistoryPress = () => {
    router.push('/(screens)/PeriodsHistory');
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((item) => item !== symptom)); // Deselect
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]); // Select
    }
  };

  const renderHeader = (date?: XDate) => {
    if (!date) return null;

    const month = date.toString('MMMM');
    const year = date.getFullYear();
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{`${month} ${year}`}</Text>
      </View>
    );
  };

  // Symptom icons and labels
  const symptoms = [
    { id: 'headache', icon: 'head-outline', label: 'Headache', color: '#FF6F61' },
    { id: 'stomachache', icon: 'stomach', label: 'Stomach Ache', color: '#6B5B95' },
    { id: 'nausea', icon: 'emoticon-sick-outline', label: 'Nausea', color: '#88B04B' },
    { id: 'cramps', icon: 'run-fast', label: 'Cramps', color: '#FFA500' },
    { id: 'backache', icon: 'human-handsup', label: 'Backache', color: '#92A8D1' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Calendar Section */}
        <View style={[styles.calendarContainer, styles.shadow]}>
          <Calendar
            current={currentMonth}
            onDayPress={handleDayPress}
            monthFormat={'MMMM yyyy'}
            markingType={'dot'}
            markedDates={{
              [selectedDate || '']: {
                selected: true,
                selectedColor: '#ff69b4',
                selectedTextColor: 'white',
              },
            }}
            style={styles.calendar}
            horizontal={true}
            pagingEnabled={true}
            hideExtraDays={true}
            firstDay={1}
            enableSwipeMonths={false}
            renderHeader={renderHeader}
            theme={{
              selectedDayBackgroundColor: '#ff69b4',
              selectedDayTextColor: 'white',
              todayTextColor: '#ff69b4',
              arrowColor: '#ff69b4',
              monthTextColor: '#ff69b4',
              dayTextColor: '#333',
              textDayFontWeight: 'bold',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              todayBackgroundColor: '#fff',
              backgroundColor: '#fff',
            }}
          />
        </View>

        {/* Cycle Day and Phase Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.cycleDayText}>Cycle Day 5</Text>
          <Text style={styles.phaseText}>Follicular Phase</Text>
        </View>

        {/* Log Period Button */}
        <TouchableOpacity onPress={handleLogPeriodPress} style={[styles.logPeriodButton, styles.shadow]}>
          <Text style={styles.logPeriodText}>Log Period</Text>
        </TouchableOpacity>

        {/* Symptom Icons Section */}
        <View style={styles.symptomsContainer}>
          {symptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={styles.symptomItem}
              onPress={() => toggleSymptom(symptom.id)}
            >
              {/* Icon */}
              <MaterialCommunityIcons
                name={symptom.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={32}
                color={symptom.color} // Use the color from the symptoms array
              />
              {/* Label */}
              <Text style={styles.symptomLabel}>{symptom.label}</Text>
              {/* Selection Circle */}
              <View
                style={[
                  styles.selectionCircle,
                  {
                    backgroundColor: selectedSymptoms.includes(symptom.id) ? symptom.color : '#ccc',
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* My Cycles Section */}
        <Text style={styles.myCyclesText}>My Cycles</Text>

        {/* History Button */}
        <TouchableOpacity onPress={handleHistoryPress} style={[styles.historyButton, styles.shadow]}>
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#fff',
  },
  calendar: {
    height: 350,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  infoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  cycleDayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  phaseText: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  logPeriodButton: {
    backgroundColor: '#ff69b4',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  logPeriodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  symptomsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  symptomItem: {
    alignItems: 'center',
  },
  symptomLabel: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
  },
  myCyclesText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  historyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  historyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});