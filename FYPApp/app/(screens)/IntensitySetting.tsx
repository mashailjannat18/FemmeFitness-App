import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
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
              <Text
                style={[
                  styles.emoji,
                  { color: selectedIntensity === item.level ? '#FFF' : '#000' },
                ]}
              >
                {item.emoji}
              </Text>
              <Text
                style={[
                  styles.levelText,
                  selectedIntensity === item.level && styles.selectedLevelText,
                  { color: selectedIntensity === item.level ? '#FFF' : '#4A148C' },
                ]}
              >
                {item.level}
              </Text>
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
    backgroundColor: '#FFFFFF', // White background for the entire screen
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF1493',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  currentIntensity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLabel: {
    fontSize: 16,
    color: 'black',
    marginRight: 5,
  },
  selectedIntensity: {
    fontSize: 20,
    fontWeight: '700',
    color: '#b03060',
  },
  editSection: {
    marginBottom: 25,
    marginTop: 10,
  },
  editHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
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