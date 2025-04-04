import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';

const { width } = Dimensions.get('window');

const IntensitySetting = () => {
  const [selectedIntensity, setSelectedIntensity] = useState<string | null>(null);
  const [animation] = useState(new Animated.Value(0));

  const intensities = [
    { level: 'Beginner', emoji: '🌱', color: '#7FB77E' },
    { level: 'Mediocre', emoji: '🔥', color: '#FFB562' },
    { level: 'Intense', emoji: '💥', color: '#FF6B6B' }
  ];

  const handlePress = (level: string) => {
    setSelectedIntensity(level);
    
    // Bounce animation
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
    outputRange: [1, 1.1, 1]
  });

  return (
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

      {/* Added Edit Intensity section */}
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
                transform: [{ scale: scaleInterpolate }]
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => handlePress(item.level)}
              activeOpacity={0.8}
              style={styles.cardContent}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[
                styles.levelText,
                selectedIntensity === item.level && styles.selectedLevelText
              ]}>
                {item.level}
              </Text>
              <View style={[
                styles.indicator,
                selectedIntensity === item.level && styles.activeIndicator
              ]} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 10,
    fontFamily: 'Helvetica Neue',
    letterSpacing: 0.5,
  },
  currentIntensity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLabel: {
    fontSize: 16,
    color: '#718096',
    marginRight: 5,
  },
  selectedIntensity: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  // New styles for Edit Intensity section
  editSection: {
    marginBottom: 25,
    marginTop: 10,
  },
  editHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: '#E2E8F0',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  selectedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
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
    color: '#2D3748',
    textAlign: 'center',
  },
  selectedLevelText: {
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  indicator: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 15,
  },
  activeIndicator: {
    backgroundColor: '#FFF',
    width: 30,
    height: 6,
  },
});

export default IntensitySetting;