import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { setUserData } from '../../datafiles/userData';

const Question1: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const router = useRouter();

  const ageRange = Array.from({ length: 90 - 14 + 1 }, (_, i) => i + 14);

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
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.ageText,
          item === selectedAge && styles.selectedAgeText,
          (selectedAge !== null &&
            (item === selectedAge - 1 || item === selectedAge + 1)) &&
            styles.nearbyAgeText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/age.jpeg')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <View style={styles.ageListContainer}>
        <FlatList
          data={ageRange}
          keyExtractor={(item) => item.toString()}
          renderItem={renderAgeItem}
          contentContainerStyle={styles.ageList}
          style={styles.flatList}
          showsVerticalScrollIndicator={false} // SCROLLBAR HIDDEN ✅
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
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 45,
  },
  headerImage: {
    width: '85%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  ageListContainer: {
    width: '30%', // Smaller container
    height: 320, // Height for 4 items (4 * (60 + 8 + 8) + padding)
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1, // Thinner border
    borderColor: '#ffb6c1', // Light pink border
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  flatList: {
    flexGrow: 0, // Prevent FlatList from expanding beyond container
  },
  ageList: {
    alignItems: 'center',
  },
  ageItem: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedAge: {
    borderColor: '#ff69b4',
    borderWidth: 2,
    backgroundColor: '#ffe4e1',
    transform: [{ scale: 1.05 }],
  },
  ageText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  selectedAgeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
  },
  nearbyAgeText: {
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
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