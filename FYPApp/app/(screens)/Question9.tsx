import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { setUserData } from '@/datafiles/userData'; 

type ChallengeOption = {
  display: '15 Days' | '30 Days' | '45 Days' | '90 Days' | 'Continue Without Challenge';
  value: number;
};

const challengeOptions: ChallengeOption[] = [
  { display: '15 Days', value: 15 },
  { display: '30 Days', value: 30 },
  { display: '45 Days', value: 45 },
  { display: '90 Days', value: 90 },
  { display: 'Continue Without Challenge', value: 15 },
];

const Question9: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeOption | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const router = useRouter();

  const handleNext = () => {
    if (!selectedChallenge) {
      Alert.alert('Error', 'Please select a challenge option or continue without a challenge');
    } else {
      setUserData('challengeDays', selectedChallenge.value); 
      router.push('/(screens)/Question8');
    }
  };

  const handleBack = () => {
    router.push('/(screens)/Question7');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Challenge</Text>

      <TouchableOpacity style={styles.dropdownContainer} onPress={toggleDropdown}>
        <Text style={styles.dropdownText}>
          {selectedChallenge ? selectedChallenge.display : 'Select a challenge'}
        </Text>
        <Ionicons name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={24} color="#fff" />
      </TouchableOpacity>

      {isDropdownOpen && (
        <View style={styles.optionsContainer}>
          {challengeOptions.map((option) => (
            <TouchableOpacity
              key={option.display}
              style={[
                styles.option,
                selectedChallenge?.display === option.display ? styles.selectedOption : styles.unselectedOption,
              ]}
              onPress={() => {
                setSelectedChallenge(option);
                setIsDropdownOpen(false);
              }}
            >
              <Text style={styles.optionText}>{option.display}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !selectedChallenge ? styles.disabledButton : styles.activeButton]}
          onPress={handleNext}
          disabled={!selectedChallenge}
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
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  dropdownContainer: {
    width: '80%',
    padding: 12,
    backgroundColor: '#d63384',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 18,
  },
  optionsContainer: {
    width: '80%',
  },
  option: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  selectedOption: {
    backgroundColor: '#d63384',
  },
  unselectedOption: {
    backgroundColor: '#ccc',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginTop: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 40,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#ccc',
  },
  activeButton: {
    backgroundColor: '#d63384',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Question9;