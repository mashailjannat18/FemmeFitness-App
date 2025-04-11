import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { setUserData } from '../../datafiles/userData';

const Question2: React.FC = () => {
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

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

  const handleNext = () => {
    console.log(`Next pressed, selectedWeight: ${selectedWeight}`);

    if (selectedWeight === '') {
      Alert.alert('Field Required', 'Please enter your weight before proceeding.', [
        { text: 'OK' },
      ]);
    } else {
      const weight = parseFloat(selectedWeight);
      if (isNaN(weight) || weight < 25 || weight > 200) {
        Alert.alert('Invalid Weight', 'Weight must be between 25 kg and 200 kg.', [
          { text: 'OK' },
        ]);
      } else {
        setUserData('weight', weight);
        setTimeout(() => {
          router.push('/(screens)/Question3');
        }, 500);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>What Is Your Weight (kg)?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your weight (kg)"
        keyboardType="decimal-pad"
        value={selectedWeight}
        onChangeText={handleWeightChange}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
            (selectedWeight === '' || parseFloat(selectedWeight) < 25 || parseFloat(selectedWeight) > 200) &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={selectedWeight === '' || parseFloat(selectedWeight) < 25 || parseFloat(selectedWeight) > 200}
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
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#d63384',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    marginVertical: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
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
});

export default Question2;