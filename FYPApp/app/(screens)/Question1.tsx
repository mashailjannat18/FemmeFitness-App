import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { setUserData } from '../../datafiles/userData';

const Question1: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const router = useRouter();

  // Adjusted age range from 14 to 90
  const ageRange = Array.from({ length: 90 - 12 + 1 }, (_, i) => i + 14);

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    console.log(`Age selected: ${age}`);
  };

  const handleNext = () => {
    console.log(`Next pressed, selectedAge: ${selectedAge}`);

    if (selectedAge === null) {
      console.log('No age selected, showing alert');
      Alert.alert('Field Required', 'Please select your age before proceeding.', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Alert closed');
          },
        },
      ]);
    } else {
      console.log('Age selected, navigating to Question2');
      setUserData('age', selectedAge);

      setTimeout(() => {
        router.push('/(screens)/Question2');
      }, 500);
    }
  };

  const renderAgeItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={[
        styles.ageItem,
        item === selectedAge && styles.selectedAge,
      ]}
      onPress={() => handleAgeSelect(item)}
    >
      <Text
        style={[
          styles.ageText,
          item === selectedAge && styles.selectedAgeText,
          (selectedAge !== null && (item === selectedAge - 1 || item === selectedAge + 1)) && styles.boldAgeText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>What Is Your Age?</Text>
      <View style={styles.ageListContainer}>
        <FlatList
          data={ageRange}
          keyExtractor={(item) => item.toString()}
          renderItem={renderAgeItem}
          contentContainerStyle={styles.ageList}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.push('/(screens)')}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedAge === null && styles.disabledButton]}
          onPress={handleNext}
          disabled={selectedAge === null}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 150,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ageListContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  ageList: {
    alignItems: 'center',
  },
  ageItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  selectedAge: {
    borderWidth: 2,
    borderColor: '#d63384',
    borderRadius: 10,
  },
  ageText: {
    fontSize: 18,
    color: '#666',
  },
  selectedAgeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d63384',
  },
  boldAgeText: {
    fontWeight: 'bold',
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

export default Question1;