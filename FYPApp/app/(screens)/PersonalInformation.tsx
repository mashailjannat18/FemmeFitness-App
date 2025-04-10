import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  ImageBackground,
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
    <ImageBackground
      source={{
        uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k=', // Use your full base64 string here
      }}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>My Profile</Text>

        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            onPress={() => toggleSection(section.key)}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.card,
                expandedSection === section.key && styles.expandedCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name={section.icon}
                  size={22}
                  color="#D26B8C"
                  style={styles.icon}
                />
                <Text style={styles.subHeader}>{section.label}</Text>
                <Animated.View
                  style={{
                    transform: [
                      { rotate: expandedSection === section.key ? spin : '0deg' },
                    ],
                  }}
                >
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    color="#D26B8C"
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#C94C7C',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#D26B8C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  expandedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#D26B8C',
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
    color: '#C94C7C',
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
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  backgroundImageStyle: {
    opacity: 1,
  },
});

export default PersonalInformation;
