import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ImageBackground,
} from 'react-native';

const { width } = Dimensions.get('window');

const IntensitySetting = () => {
  const [selectedIntensity, setSelectedIntensity] = useState<string | null>(null);
  const [animation] = useState(new Animated.Value(0));

  const intensities = [
    { level: 'Beginner', emoji: '🌸', color: '#F8BBD0' },
    { level: 'Mediocre', emoji: '🌷', color: '#F48FB1' },
    { level: 'Intense', emoji: '🌺', color: '#EC407A' },
  ];

  const handlePress = (level: string) => {
    setSelectedIntensity(level);
    animation.setValue(0);
    Animated.spring(animation, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const scaleInterpolate = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <ImageBackground
      source={{ uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k=' }} // Replace with your Google image URL
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Workout Intensity</Text>
          <View style={styles.currentIntensity}>
            <Text style={styles.currentLabel}>Current:</Text>
            <Text style={styles.selectedIntensity}>
              {selectedIntensity || 'Not selected'}
            </Text>
          </View>
        </View>

        <View style={styles.editSection}>
          <Text style={styles.editHeading}>Edit Intensity</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.cardsContainer}>
          {intensities.map((item) => (
            <Animated.View
              key={item.level}
              style={[
                styles.card,
                { backgroundColor: item.color },
                selectedIntensity === item.level && styles.selectedCard,
                selectedIntensity === item.level && {
                  transform: [{ scale: scaleInterpolate }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handlePress(item.level)}
                activeOpacity={0.8}
                style={styles.cardContent}
              >
                <Text style={[styles.emoji, { color: selectedIntensity === item.level ? '#FFF' : '#000' }]}>
                  {item.emoji}
                </Text>
                <Text
                  style={[
                    styles.levelText,
                    selectedIntensity === item.level && styles.selectedLevelText,
                    { color: selectedIntensity === item.level ? '#FFF' : '#4A148C' }
                  ]}
                >
                  {item.level}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D81B60',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  currentIntensity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLabel: {
    fontSize: 16,
    color: '#C2185B',
    marginRight: 5,
  },
  selectedIntensity: {
    fontSize: 20,
    fontWeight: '700',
    color: '#880E4F',
  },
  editSection: {
    marginBottom: 25,
    marginTop: 10,
  },
  editHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AD1457',
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: '#F8BBD0',
    width: '40%',
    alignSelf: 'center',
    borderRadius: 2,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  card: {
    width: width / 3.5,
    height: 180,
    borderRadius: 20,
    padding: 15,
    justifyContent: 'center',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedLevelText: {
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default IntensitySetting;
