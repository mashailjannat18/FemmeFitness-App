import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

const DiseaseInformation = () => {
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  const diseases = [
    {
      title: 'Hypertension',
      description: 'High blood pressure condition',
      icon: <MaterialIcons name="favorite" size={28} color="#b03060" />,
    },
    {
      title: 'Diabetes Type 2',
      description: 'Chronic sugar metabolism issue',
      icon: <FontAwesome5 name="syringe" size={24} color="#b03060" />,
    },
    {
      title: 'Menopause',
      description: 'Natural aging transition',
      icon: <MaterialIcons name="female" size={28} color="#b03060" />,
    },
    {
      title: 'Nothing',
      description: 'No current conditions',
      icon: <MaterialIcons name="check-circle" size={28} color="#b03060" />,
    },
  ];

  const scaleAnimations = diseases.map(() => new Animated.Value(1));

  const handlePress = (index: number, disease: string) => {
    if (disease === 'Nothing') {
      setSelectedDiseases([]); // Clear all selections when "Nothing" is clicked
    } else {
      setSelectedDiseases(prevState => {
        if (prevState.includes(disease)) {
          return prevState.filter(item => item !== disease); // Unselect if already selected
        } else {
          return [...prevState, disease]; // Add to selection
        }
      });
    }

    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 0.96,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Current Condition</Text>
      <View style={styles.currentGoalContainer}>
        <Text style={styles.selectedGoal}>
          {selectedDiseases.length > 0
            ? selectedDiseases.join(', ')
            : 'Not selected yet'}
        </Text>
      </View>

      <Text style={styles.subHeading}>Select your conditions</Text>
      <View style={styles.cardsContainer}>
        {diseases.map((disease, index) => (
          <Animated.View
            key={disease.title}
            style={[styles.cardContainer, { transform: [{ scale: scaleAnimations[index] }] }]}
          >
            <TouchableOpacity
              style={[styles.card, selectedDiseases.includes(disease.title) && styles.selectedCard]}
              onPress={() => handlePress(index, disease.title)}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>{disease.icon}</View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{disease.title}</Text>
                <Text style={styles.cardDescription}>{disease.description}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff', // Set background color to white
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF1493',
    marginBottom: 12,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    marginVertical: 20,
    textAlign: 'center',
  },
  currentGoalContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  selectedGoal: {
    fontSize: 18,
    color: '#b03060',
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  cardContainer: {
    width: width * 0.9,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ffe0ea',
  },
  selectedCard: {
    borderColor: '#b03060',
    borderWidth: 2,
    shadowColor: '#FF69B4',
    shadowOpacity: 0.4,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffe4ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    color: '#FF69B4', // Updated color
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default DiseaseInformation;