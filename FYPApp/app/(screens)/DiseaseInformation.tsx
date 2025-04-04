import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const DiseaseInformation = () => {
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  const diseases: string[] = ['Hypertension', 'Diabetes Type 2', 'Menopause', 'No Disease'];

  const toggleSelection = (disease: string) => {
    if (disease === 'No Disease') {
      setSelectedDiseases(['No Disease']);
    } else {
      setSelectedDiseases((prevSelected) => {
        if (prevSelected.includes(disease)) {
          return prevSelected.filter((item) => item !== disease);
        } else {
          return prevSelected.filter((item) => item !== 'No Disease').concat(disease);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Current Disease</Text>
      <Text style={styles.selected}>{selectedDiseases.length > 0 ? selectedDiseases.join(', ') : ''}</Text>
      
      <Text style={styles.heading}>Add or Edit Disease</Text>
      <View style={styles.optionsContainer}>
        {diseases.map((disease) => (
          <TouchableOpacity
            key={disease}
            style={[styles.option, selectedDiseases.includes(disease) && styles.selectedOption]}
            onPress={() => toggleSelection(disease)}
          >
            <Text style={styles.optionText}>{disease}</Text>
            {selectedDiseases.includes(disease) && (
              <MaterialIcons name="check" size={20} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333', // Dark grey for contrast
    marginBottom: 10,
  },
  selected: {
    fontSize: 18,
    color: '#333', // Dark grey for text
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ffccd5', // Lighter pink border
    borderRadius: 5,
    backgroundColor: '#ffe4e9', // Softer pink option background
  },
  selectedOption: {
    backgroundColor: '#ff99aa', // Lighter dark pink when selected
  },
  optionText: {
    fontSize: 18,
    color: '#000000', // Black text for better visibility
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default DiseaseInformation;
