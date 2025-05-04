import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { setUserData } from '../../datafiles/userData';

const Question2: React.FC = () => {
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [selectedHeight, setSelectedHeight] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  const heightRange = Array.from({ length: 36 }, (_, i) => (3 + i * 0.1).toFixed(1));

  const handleWeightChange = (text: string) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setSelectedWeight(text);

      const weight = parseFloat(text);
      if (text !== '' && !isNaN(weight)) {
        if (weight < 25) {
          setErrorMessage('Weight must be 25 kg or above.');
        } else if (weight > 200) {
          setErrorMessage('Weight must not exceed 200 kg.');
        } else {
          setErrorMessage('');
        }
      } else if (text !== '') {
        setErrorMessage('Please enter a valid number.');
      } else {
        setErrorMessage('');
      }
    }
  };

  const handleHeightSelect = (height: string) => {
    const selected = parseFloat(height);
    setSelectedHeight(selected);
    setUserData('height', selected);
  };

  const handleNext = () => {
    if (selectedWeight === '' || selectedHeight === null) {
      Alert.alert('Incomplete Fields', 'Please enter both your weight and height before proceeding.', [{ text: 'OK' }]);
    } else {
      const weight = parseFloat(selectedWeight);
      if (isNaN(weight) || weight < 25 || weight > 200) {
        Alert.alert('Invalid Weight', 'Weight must be between 25 kg and 200 kg.', [{ text: 'OK' }]);
      } else {
        setUserData('weight', weight);
        router.push('/(screens)/Question3');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Let's Get Your Basics</Text>

      {/* Weight Input */}
      <Text style={styles.label}>What is your Weight (kg)?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your weight"
        keyboardType="decimal-pad"
        value={selectedWeight}
        onChangeText={handleWeightChange}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Height Picker */}
      <Text style={styles.label}>What is your Height (ft)?</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedHeight?.toString()}
          onValueChange={handleHeightSelect}
          style={styles.picker}
        >
          <Picker.Item label="Select Height" value={null} />
          {heightRange.map((height) => (
            <Picker.Item key={height} label={`${height} ft`} value={height} />
          ))}
        </Picker>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.push('/(screens)/Question1')}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (selectedWeight === '' ||
              parseFloat(selectedWeight) < 25 ||
              parseFloat(selectedWeight) > 200 ||
              selectedHeight === null) && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={
            selectedWeight === '' ||
            parseFloat(selectedWeight) < 25 ||
            parseFloat(selectedWeight) > 200 ||
            selectedHeight === null
          }
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
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#d63384',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginTop: 10,  // Increased the marginTop to lower the label
    color: '#333',
  },
  input: {
    width: '100%',
    height: 55,
    borderColor: '#d63384',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginTop: 8,
  },
  pickerContainer: {
    width: '100%',
    height: 55,
    borderColor: '#d63384',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 10,  // Lowered picker container a little
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#666',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#a9a9a9',
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Question2;