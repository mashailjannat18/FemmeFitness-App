import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";
import { useRouter } from "expo-router"; 
import { MaterialIcons } from '@expo/vector-icons';
import { setUserData } from "@/datafiles/userData";

const Question6: React.FC = () => {
  const areas = ["Arms", "Stomach", "Hips", "Legs", "Full Body"];
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [scaleValue] = useState(new Animated.Value(1)); 
  const router = useRouter(); 

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas((prevAreas) => {
        const updatedAreas = prevAreas.filter((a) => a !== area);
        console.log("Selected Areas:", updatedAreas);
        return updatedAreas;
      });
    } else {
      setSelectedAreas((prevAreas) => {
        const updatedAreas = [...prevAreas, area];
        console.log("Selected Areas:", updatedAreas); 
        return updatedAreas;
      });
    }
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
    if (selectedAreas.length === 0) {
      Alert.alert("Selection Required", "Please select at least one area to focus on.");
      return;
    }
    setUserData('areasOfFocus', selectedAreas);  
    router.push("/(screens)/Question7");
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Which Areas Do You Want to Focus On?</Text>
      <View style={styles.optionsContainer}>
        {areas.map((area) => (
          <TouchableOpacity
            key={area}
            style={[
              styles.option,
              selectedAreas.includes(area) && styles.selectedOption,
              { transform: [{ scale: selectedAreas.includes(area) ? scaleValue : 1 }] },
            ]}
            onPress={() => toggleArea(area)}
          >
            <MaterialIcons
              name={area === "Arms" ? "fitness-center" : area === "Stomach" ? "spa" : area === "Hips" ? "directions-run" : area === "Legs" ? "accessibility" : "person"}
              size={30}
              color={selectedAreas.includes(area) ? "#fff" : "#d63384"}
              style={styles.icon}
            />
            <Text style={[styles.optionText, selectedAreas.includes(area) && styles.selectedText]}>
              {area}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.push("/(screens)/Question5")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedAreas.length > 0 ? styles.nextButton : styles.disabledButton]}
          onPress={handleNext}
          disabled={selectedAreas.length === 0} 
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
    textAlign: "center",
    color: "#333",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  option: {
    width: 100, 
    height: 100, 
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 50, 
    borderWidth: 2,
    borderColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5, 
    position: "relative",
  },
  selectedOption: {
    backgroundColor: "#d63384",
    borderColor: "#d63384",
    elevation: 8, 
  },
  icon: {
    marginBottom: 10,
  },
  optionText: {
    fontSize: 13,
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

export default Question6;
