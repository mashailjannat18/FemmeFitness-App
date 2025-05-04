import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { setUserData } from '../../datafiles/userData';

const Question3: React.FC = () => {
  const diseases = ["Hypertension", "Diabetes Type 2", "Menopause"];
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);

  const toggleDisease = (disease: string) => {
    if (noneSelected) {
      setNoneSelected(false);
    }
  
    if (selectedDiseases.includes(disease)) {
      setSelectedDiseases((prevDiseases) => {
        const updatedDiseases = prevDiseases.filter((d) => d !== disease);
        return updatedDiseases;
      });
    } else {
      setSelectedDiseases((prevDiseases) => {
        const updatedDiseases = [...prevDiseases, disease];
        return updatedDiseases;
      });
    }
  };
  
  const toggleNone = () => {
    if (!noneSelected) {
      setSelectedDiseases([]); 
    }
    setNoneSelected((prevNoneSelected) => !prevNoneSelected);
  };

  const isNextDisabled = selectedDiseases.length === 0 && !noneSelected;

  const handleNext = () => {
    setUserData('diseases', selectedDiseases);
  };

  const nextPath = selectedDiseases.includes("Menopause") ? "/(screens)/Question5" : "/(screens)/Question4";

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Diseases</Text>
      {diseases.map((disease) => (
        <TouchableOpacity
          key={disease}
          style={[
            styles.option,
            selectedDiseases.includes(disease) && styles.selectedOption,
          ]}
          onPress={() => toggleDisease(disease)}
        >
          <Text style={[styles.optionText, styles.boldText]}>
            {disease} {selectedDiseases.includes(disease) && "✓"}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.option, noneSelected && styles.selectedOption]}
        onPress={toggleNone}
      >
        <Text style={[styles.optionText, styles.boldText]}>
          None {noneSelected && "✓"}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Link href="/(screens)/Question2" style={[styles.button, styles.backButton]}>
          <Text style={styles.buttonText}>Back</Text>
        </Link>
        {isNextDisabled ? (
          <View style={[styles.button, styles.disabledButton]}>
            <Text style={styles.buttonText}>Next</Text>
          </View>
        ) : (
          <Link href={nextPath} style={[styles.button, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </Link>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  option: {
    width: "80%",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  selectedOption: {
    borderColor: "#d63384",
  },
  optionText: {
    fontSize: 18,
    color: "#000",
  },
  boldText: {
    fontWeight: "bold",
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

export default Question3;