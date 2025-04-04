import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type UserData = {
  name: string;
  weight: string;
  height: string;
  challenge: string;
  activityLevel: string;
};

type Section = {
  key: keyof UserData;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
};

const PersonalInformation = () => {
  const [expandedSection, setExpandedSection] = useState<keyof UserData | null>(null);
  const spinValue = new Animated.Value(0);

  // Sample user data
  const user: UserData = {
    name: "Alex Johnson",
    weight: "68 kg (150 lbs)",
    height: "175 cm (5'9\")",
    challenge: "30-day core strength challenge",
    activityLevel: "🏃‍♀️ 4 workouts/week"
  };

  const sections: Section[] = [
    { key: 'name', icon: 'person', label: 'User Name' },
    { key: 'weight', icon: 'fitness-center', label: 'Weight' },
    { key: 'height', icon: 'height', label: 'Height' },
    { key: 'challenge', icon: 'stars', label: 'Current Challenge' },
    { key: 'activityLevel', icon: 'directions-run', label: 'Activity Level' }
  ];

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const toggleSection = (key: keyof UserData) => {
    if (expandedSection === key) {
      setExpandedSection(null);
    } else {
      setExpandedSection(key);
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true
      }).start();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>My Profile</Text>
        
        {sections.map((section) => (
          <TouchableOpacity 
            key={section.key}
            onPress={() => toggleSection(section.key)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.card,
              expandedSection === section.key && styles.expandedCard
            ]}>
              <View style={styles.cardHeader}>
                <MaterialIcons 
                  name={section.icon} 
                  size={24} 
                  color="#FF6B8B" 
                  style={styles.icon}
                />
                <Text style={styles.subHeader}>{section.label}</Text>
                <Animated.View style={{ transform: [{ rotate: expandedSection === section.key ? spin : '0deg' }] }}>
                  <MaterialIcons 
                    name="keyboard-arrow-down" 
                    size={24} 
                    color="#FF6B8B" 
                  />
                </Animated.View>
              </View>
              
              {expandedSection === section.key && (
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>{user[section.key]}</Text>
                  {section.key === 'challenge' && (
                    <TouchableOpacity style={styles.editButton}>
                      <Text style={styles.editButtonText}>Join New Challenge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF0F5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D23369',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'sans-serif-condensed',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#FF6B8B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  expandedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B8B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D23369',
    flex: 1,
  },
  infoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#FFE4E9',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  editButton: {
    backgroundColor: '#FF6B8B20',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FF6B8B',
    fontWeight: '600',
  },
});

export default PersonalInformation;