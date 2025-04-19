import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
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

  const user: UserData = {
    name: 'Alex Johnson',
    weight: '68 kg (150 lbs)',
    height: "175 cm (5'9\")",
    challenge: '30-day core strength challenge',
    activityLevel: '🏃‍♀️ 4 workouts/week',
  };

  const sections: Section[] = [
    { key: 'name', icon: 'person', label: 'User Name' },
    { key: 'weight', icon: 'fitness-center', label: 'Weight' },
    { key: 'height', icon: 'height', label: 'Height' },
    { key: 'challenge', icon: 'stars', label: 'Current Challenge' },
    { key: 'activityLevel', icon: 'directions-run', label: 'Activity Level' },
  ];

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
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
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>My Profile</Text>

      {sections.map((section) => (
        <TouchableOpacity
          key={section.key}
          onPress={() => toggleSection(section.key)}
          activeOpacity={0.9}
        >
          <View
            style={[styles.card, expandedSection === section.key && styles.expandedCard]}
          >
            <View style={styles.cardHeader}>
              <MaterialIcons
                name={section.icon}
                size={22}
                color="#FF69B4" // Set the icon color to pink
                style={styles.icon}
              />
              <Text style={styles.subHeader}>{section.label}</Text>
              <Animated.View
                style={{
                  transform: [{ rotate: expandedSection === section.key ? spin : '0deg' }],
                }}
              >
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color="#FF69B4" // Set the arrow icon color to pink
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FF1493', // Change the header text color to pink
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  expandedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF69B4',
    backgroundColor: '#FFF0F3',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 10,
  },
  subHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
    flex: 1,
  },
  infoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F9DDE2',
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  editButton: {
    backgroundColor: '#F9DDE2',
    padding: 10,
    borderRadius: 6,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#C94C7C',
    fontWeight: '600',
  },
});

export default PersonalInformation;