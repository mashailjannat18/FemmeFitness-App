import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { setUserData } from '../../datafiles/userData';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For calendar icon

const Question4: React.FC = () => {
  const router = useRouter();
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState<string>('');
  const [bleedingDays, setBleedingDays] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Format Date for display
  const formattedDate = lastPeriodDate ? lastPeriodDate.toISOString().split('T')[0] : '';

  // Validate Cycle Length (21-35 days)
  const cycleLengthNum = parseInt(cycleLength, 10);
  const isCycleLengthValid = !isNaN(cycleLengthNum) && cycleLengthNum >= 21 && cycleLengthNum <= 35;
  const cycleLengthError = cycleLength.trim() !== '' && !isCycleLengthValid
    ? 'Your entered cycle length is not in the typical (21-35) days range. Predictions may be inaccurate for irregular cycles.'
    : '';

  // Validate Bleeding Days (2-7 days)
  const bleedingDaysNum = parseInt(bleedingDays, 10);
  const isBleedingDaysValid = !isNaN(bleedingDaysNum) && bleedingDaysNum >= 2 && bleedingDaysNum <= 7;
  const bleedingDaysError = bleedingDays.trim() !== '' && !isBleedingDaysValid
    ? 'Your entered bleeding days is not in the typical (2-7) days range. Predictions may be inaccurate for irregular cycles.'
    : '';

  // Form is complete if all fields are filled and valid
  const isFormComplete = lastPeriodDate !== null && cycleLength.trim() !== '' && isCycleLengthValid && bleedingDays.trim() !== '' && isBleedingDaysValid;

  // Handle Next button press to save data and navigate
  const handleNext = () => {
    if (isFormComplete) {
      setUserData('lastPeriodDate', lastPeriodDate!);
      setUserData('cycleLength', parseInt(cycleLength, 10));
      setUserData('bleedingDays', parseInt(bleedingDays, 10));
      router.push('/(screens)/Question5');
    }
  };

  // Handle date selection from calendar
  const onDayPress = (day: any) => {
    const selectedDate = new Date(day.dateString);
    setLastPeriodDate(selectedDate);
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Menstrual Cycle Information</Text>
      <View style={styles.optionsContainer}>
        <Text style={styles.label}>Last Period Date (YYYY-MM-DD)</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={formattedDate}
            onChangeText={(text) => {
              const date = new Date(text);
              if (!isNaN(date.getTime())) setLastPeriodDate(date);
            }}
            placeholder="e.g., 2025-05-01"
            placeholderTextColor="#999999"
          />
          <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarIcon}>
            <Icon name="calendar-today" size={24} color="#d63384" />
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Cycle Length (days)</Text>
        <TextInput
          style={styles.input}
          value={cycleLength}
          onChangeText={setCycleLength}
          placeholder="e.g., 28"
          placeholderTextColor="#999999"
          keyboardType="numeric"
        />
        {cycleLengthError ? <Text style={styles.errorText}>{cycleLengthError}</Text> : null}
        <Text style={styles.label}>Bleeding Days</Text>
        <TextInput
          style={styles.input}
          value={bleedingDays}
          onChangeText={setBleedingDays}
          placeholder="e.g., 5"
          placeholderTextColor="#999999"
          keyboardType="numeric"
        />
        {bleedingDaysError ? <Text style={styles.errorText}>{bleedingDaysError}</Text> : null}
      </View>
      {showCalendar && (
        <View style={styles.calendarModal}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={{
              [formattedDate]: { selected: true, marked: true, selectedColor: '#d63384' },
            }}
            theme={{
              selectedDayBackgroundColor: '#d63384',
              todayTextColor: '#d63384',
              arrowColor: '#d63384',
            }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Link href="/(screens)/Question3" style={[styles.button, styles.backButton]}>
          <Text style={styles.buttonText}>Back</Text>
        </Link>
        {isFormComplete ? (
          <Link href="/(screens)/Question5" style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </Link>
        ) : (
          <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled={true}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333333',
    textAlign: 'center',
  },
  optionsContainer: {
    width: 250,
    padding: 15,
    backgroundColor: '#ffe6f0',
    borderRadius: 12,
    elevation: 2,
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#333333',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ffccdd',
    backgroundColor: '#fff5f8',
    padding: 12,
    fontSize: 16,
    color: '#333333',
    elevation: 1,
  },
  dateInput: {
    flex: 1,
  },
  calendarIcon: {
    padding: 10,
    marginLeft: -40,
  },
  errorText: {
    fontSize: 12,
    color: '#d81b60',
    marginTop: 6,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#a9a9a9',
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  calendarModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#d63384',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Question4;