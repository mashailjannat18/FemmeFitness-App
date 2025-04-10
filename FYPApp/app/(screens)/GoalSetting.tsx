import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const GoalSetting = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    {
      title: 'Lose Weight',
      description: 'Burn fat & get lean',
      icon: <Feather name="trending-down" size={28} color="#b03060" />,
    },
    {
      title: 'Gain Weight',
      description: 'Healthy weight increase',
      icon: <Feather name="trending-up" size={28} color="#b03060" />,
    },
    {
      title: 'Muscle Build',
      description: 'Build strength & power',
      icon: <MaterialIcons name="fitness-center" size={28} color="#b03060" />,
    },
    {
      title: 'Stay Fit',
      description: 'Maintain your wellness',
      icon: <MaterialIcons name="self-improvement" size={28} color="#b03060" />,
    },
  ];

  const scaleAnimations = goals.map(() => new Animated.Value(1));

  const handlePress = (index: number, goal: string) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 0.96,
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
    <ImageBackground
      source={{
        uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k=',
      }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false} // Hides the scroll indicator
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
              style={[styles.cardContainer, { transform: [{ scale: scaleAnimations[index] }] }]}
            >
              <TouchableOpacity
                style={[styles.card, selectedGoal === goal.title && styles.selectedCard]}
                onPress={() => handlePress(index, goal.title)}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircle}>{goal.icon}</View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{goal.title}</Text>
                  <Text style={styles.cardDescription}>{goal.description}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    flexGrow: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#b03060',
    marginBottom: 12,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#a83260',
    marginVertical: 20,
    textAlign: 'center',
  },
  currentGoalContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#d48fb0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffe0ea',
  },
  selectedGoal: {
    fontSize: 18,
    color: '#b03060',
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  cardContainer: {
    width: width * 0.9,
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#f3c0d6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ffe0ea',
    transform: [{ rotate: '0deg' }],
  },
  selectedCard: {
    borderColor: '#b03060',
    borderWidth: 2,
    shadowColor: '#b03060',
    shadowOpacity: 0.4,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffe4ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    color: '#b03060',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default GoalSetting;
