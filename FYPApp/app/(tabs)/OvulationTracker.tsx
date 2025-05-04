import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserAuth } from '@/context/UserAuthContext';
import Logo from '@/assets/images/Logo.png';

export default function OvulationTracker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const { user } = useUserAuth();

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

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <Image
          source={Logo}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Ovulation Tracker</Text>
        <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        <View style={styles.infoContainer}>
          <Text style={[styles.cycleDayText, { color: '#FF1493' }]}>Cycle Day 5</Text>
          <Text style={[styles.phaseText, styles.textColor]}>Follicular Phase</Text>
        </View>

        <TouchableOpacity onPress={handleLogPeriodPress} style={[styles.button, styles.shadow]}>
          <Text style={styles.buttonText}>Log Period</Text>
        </TouchableOpacity>

        <View style={styles.symptomsWrapper}>
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
                <Text style={[styles.symptomLabel, styles.textColor]}>{symptom.label}</Text>
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
        </View>

        <Text style={[styles.myCyclesText, styles.textColor]}>My Cycles</Text>

        <TouchableOpacity onPress={handleHistoryPress} style={[styles.button, styles.shadow]}>
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ff1297',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Content Styles
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  infoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  cycleDayText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  phaseText: {
    fontSize: 18,
    marginTop: 5,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF69B4', // Pink button color from first file
    borderRadius: 25,
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
  symptomsWrapper: {
    backgroundColor: '#f8e3f5', // Light pink background from first file
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 30,
    width: '100%',
  },
  symptomsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  symptomItem: {
    alignItems: 'center',
    width: '20%',
  },
  symptomLabel: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
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
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  textColor: {
    color: 'black',
  },
});