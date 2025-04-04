import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  ViewStyle,
  TextStyle,
  ScrollView,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

type Styles = {
  container: ViewStyle;
  heading: TextStyle;
  subHeading: TextStyle;
  currentGoalContainer: ViewStyle;
  selectedGoal: TextStyle;
  scrollContainer: ViewStyle;
  cardsContainer: ViewStyle;
  cardContainer: ViewStyle; // Added this line
  card: ViewStyle;
  selectedCard: ViewStyle;
  emoji: TextStyle;
  cardText: TextStyle;
};

const GoalSetting = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const goals = [
    { title: 'Lose Weight', emoji: '🏃‍♂️', color: '#FF6B6B' },
    { title: 'Gain Weight', emoji: '💪', color: '#4ECDC4' },
    { title: 'Muscle Build', emoji: '🏋️‍♂️', color: '#45B7D1' },
    { title: 'Stay Fit', emoji: '🧘‍♀️', color: '#A0DAA9' },
  ];
  
  const scaleAnimations = goals.map(() => new Animated.Value(1));

  const handlePress = (index: number, goal: string) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 0.95,
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

    setSelectedGoal(goal);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Current Goal</Text>
      <View style={styles.currentGoalContainer}>
        <Text style={styles.selectedGoal}>
          {selectedGoal || 'Not selected yet'}
        </Text>
      </View>
      
      <Text style={styles.subHeading}>Edit your goal</Text>
      <View style={styles.cardsContainer}>
        {goals.map((goal, index) => (
          <Animated.View 
            key={goal.title}
            style={[
              styles.cardContainer,
              { transform: [{ scale: scaleAnimations[index] }] }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: goal.color },
                selectedGoal === goal.title && styles.selectedCard
              ]}
              onPress={() => handlePress(index, goal.title)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{goal.emoji}</Text>
              <Text style={styles.cardText}>{goal.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginVertical: 20,
    textAlign: 'center',
  },
  currentGoalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedGoal: {
    fontSize: 18,
    color: '#555',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  cardContainer: {
    width: width * 0.9,
    marginBottom: 15,
  },
  card: {
    width: '100%',
    height: 120,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  emoji: {
    fontSize: 36,
    marginRight: 15,
  },
  cardText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default GoalSetting;