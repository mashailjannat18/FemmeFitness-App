import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons'; 
import { setUserData } from '../../datafiles/userData';

// Mapping between display text and backend-friendly values
const goalMapping = {
  "Lose weight": "lose_weight",
  "Gain weight": "gain_weight",
  "Muscle build": "build_muscle",
  "Stay fit": "stay_fit",
};

const goals = Object.keys(goalMapping); // ["Lose weight", "Gain weight", "Muscle build", "Stay fit"]

const Question5: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null); 
  const [scaleValue] = useState(new Animated.Value(1)); 
  const router = useRouter();

  const toggleGoal = (goal: string) => {
    const updatedGoal = selectedGoal === goal ? null : goal;
    setSelectedGoal(updatedGoal);
    console.log("Selected Goal:", updatedGoal || "None");
    animateSelection();
  };

  const animateSelection = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (!selectedGoal) {
      Alert.alert("Selection Required", "Please select a goal before proceeding.");
      return;
    }

    // Map the selected goal to the backend-friendly value
    const backendFriendlyGoal = goalMapping[selectedGoal as keyof typeof goalMapping];
    setUserData("goal", backendFriendlyGoal); 
    router.push("/(screens)/Question6");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Goal</Text>
      <View style={styles.cardsContainer}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.card,
              selectedGoal === goal && styles.selectedCard,
              { transform: [{ scale: selectedGoal === goal ? scaleValue : 1 }] },
            ]}
            onPress={() => toggleGoal(goal)}
          >
            <MaterialIcons
              name={goal === "Muscle build" ? "fitness-center" : goal === "Lose weight" ? "emoji-food-beverage" : goal === "Gain weight" ? "restaurant" : "directions-run"}
              size={30}
              color={selectedGoal === goal ? "#fff" : "#d63384"}
              style={styles.icon}
            />
            <Text style={[styles.cardText, selectedGoal === goal && styles.selectedText]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.push("/(screens)/Question4")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedGoal ? styles.nextButton : styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedGoal}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  card: {
    width: "40%",
    padding: 20,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    height: 200,
    position: "relative",
  },
  selectedCard: {
    backgroundColor: "#d63384",
    borderColor: "#d63384",
    elevation: 8,
  },
  icon: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  selectedText: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 40,
    marginHorizontal: 10,
  },
  backButton: {
    backgroundColor: "#a9a9a9",
  },
  nextButton: {
    backgroundColor: "#d63384",
  },
  disabledButton: {
    backgroundColor: "#a9a9a9",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Question5;