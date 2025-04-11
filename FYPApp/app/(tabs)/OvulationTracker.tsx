import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OvulationTracker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleLogPeriodPress = () => {
    router.push('/(screens)/Periods');
  };

  const handleHistoryPress = () => {
    router.push('/(screens)/PeriodsHistory');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const symptoms = [
    { id: 'headache', icon: 'head-outline', label: 'Headache', color: '#FF6F61' },
    { id: 'stomachache', icon: 'stomach', label: 'Stomach Ache', color: '#6B5B95' },
    { id: 'nausea', icon: 'emoticon-sick-outline', label: 'Nausea', color: '#88B04B' },
    { id: 'cramps', icon: 'run-fast', label: 'Cramps', color: '#FFA500' },
    { id: 'backache', icon: 'human-handsup', label: 'Backache', color: '#92A8D1' },
  ];

  const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k='; // truncated for brevity

  return (
    // <ImageBackground source={{ uri: base64Image }} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        <View style={styles.infoContainer}>
          <Text style={styles.cycleDayText}>Cycle Day 5</Text>
          <Text style={styles.phaseText}>Follicular Phase</Text>
        </View>

        <TouchableOpacity onPress={handleLogPeriodPress} style={[styles.button, styles.shadow]}>
          <Text style={styles.buttonText}>Log Period</Text>
        </TouchableOpacity>

        <View style={styles.symptomsContainer}>
          {symptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={styles.symptomItem}
              onPress={() => toggleSymptom(symptom.id)}
            >
              <MaterialCommunityIcons
                name={symptom.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={28}
                color={selectedSymptoms.includes(symptom.id) ? symptom.color : '#333'}
              />
              <Text style={styles.symptomLabel}>{symptom.label}</Text>
              <View
                style={[
                  styles.selectionCircle,
                  {
                    backgroundColor: selectedSymptoms.includes(symptom.id)
                      ? symptom.color
                      : '#ccc',
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.myCyclesText}>My Cycles</Text>

        <TouchableOpacity onPress={handleHistoryPress} style={[styles.button, styles.shadow]}>
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
      </ScrollView>
    // </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  cycleDayText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#B03060',
  },
  phaseText: {
    fontSize: 18,
    marginTop: 5,
    color: '#B03060',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#8B004F', // Dark pink
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  symptomsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  symptomItem: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  symptomLabel: {
    fontSize: 13,
    color: '#333',
    marginTop: 5,
  },
  selectionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
  },
  myCyclesText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#B03060',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});