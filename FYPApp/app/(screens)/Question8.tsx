import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { setUserData } from '@/datafiles/userData';

type RestDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

const Question8: React.FC = () => {
  const [selectedRestDay, setSelectedRestDay] = useState<RestDay | null>(null);
  const router = useRouter();

  const handleNext = () => {
    if (!selectedRestDay) {
      Alert.alert('Error', 'Please select a rest day');
    } else {
      setUserData('restDay', selectedRestDay);
      router.push('/(screens)/Question10');
    }
  };

  const handleBack = () => {
    router.push('/(screens)/Question9');
  };

  const toggleRestDay = (day: RestDay) => {
    setSelectedRestDay(day === selectedRestDay ? null : day);
  };

  const daysOfWeek: RestDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Preferred Rest Day</Text>

      {/* Grid Layout for Days */}
      <View style={styles.gridContainer}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.option,
              selectedRestDay === day ? styles.selectedOption : styles.unselectedOption,
            ]}
            onPress={() => toggleRestDay(day)}
          >
            <Text
              style={[
                styles.optionText,
                selectedRestDay === day && styles.selectedOptionText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            !selectedRestDay ? styles.disabledButton : styles.activeButton,
          ]}
          onPress={handleNext}
          disabled={!selectedRestDay}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'black',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  option: {
    width: '48%',
    paddingVertical: 18,
    marginVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  selectedOption: {
    backgroundColor: '#d63384',
    borderColor: '#d63384',
  },
  unselectedOption: {
    backgroundColor: 'white',
  },
  optionText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#a9a9a9',
  },
  activeButton: {
    backgroundColor: '#d63384',
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Question8;