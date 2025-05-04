import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const IntensitySetting: React.FC = () => {
  const { user } = useUserAuth();
  const [intensity, setIntensity] = useState<string | null>(null);
  const [animation] = useState(new Animated.Value(0));
  const router = useRouter();

  // Mapping from model intensity to UI display
  const intensityMap: { [key: string]: string } = {
    low: 'Beginner',
    moderate: 'Mediocre',
    high: 'Intense',
  };

  const intensities = [
    { level: 'Beginner', emoji: '🌸', color: '#F8BBD0' },
    { level: 'Mediocre', emoji: '🌷', color: '#F48FB1' },
    { level: 'Intense', emoji: '🌺', color: '#EC407A' },
  ];

  useEffect(() => {
    const fetchIntensity = async () => {
      if (!user?.id) {
        console.error('No user ID available to fetch intensity');
        setIntensity(null);
        return;
      }

      try {
        console.log('Fetching intensity for user:', user.id);
        const { data, error } = await supabase
          .from('User')
          .select('intensity')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching intensity:', error.message);
          setIntensity(null);
          return;
        }

        if (data && data.intensity) {
          const mappedIntensity = intensityMap[data.intensity.toLowerCase()] || 'Not selected';
          console.log('Fetched intensity:', data.intensity, 'Mapped to:', mappedIntensity);
          setIntensity(mappedIntensity);

          // Trigger animation when intensity is fetched
          animation.setValue(0);
          Animated.spring(animation, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }).start();
        } else {
          console.log('No intensity found for user:', user.id);
          setIntensity('Not selected');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching intensity:', err.message);
        setIntensity('Not selected');
      }
    };

    fetchIntensity();
  }, [user?.id]);

  const scaleInterpolate = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('../(tabs)/Profile')}>
          <MaterialIcons name="arrow-back" size={24} color="#FF69B4" />
        </TouchableOpacity>
        <Text style={styles.header}>Intensity Setting</Text>
      </View>

      <View style={styles.headerContent}>
        <Text style={styles.heading}>Current Intensity</Text>
        <View style={styles.currentIntensity}>
          <Text style={styles.selectedIntensity}>
            {intensity || 'Not selected'}
          </Text>
        </View>
      </View>

      <View style={styles.editSection}>
        <Text style={styles.editHeading}>Edit your workout intensity</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.cardsContainer}>
        {intensities.map((item) => (
          <Animated.View
            key={item.level}
            style={[
              styles.card,
              { backgroundColor: item.color },
              intensity === item.level && styles.selectedCard,
              intensity === item.level && {
                transform: [{ scale: scaleInterpolate }],
              },
            ]}
          >
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.emoji,
                  { color: intensity === item.level ? '#FFF' : '#000' },
                ]}
              >
                {item.emoji}
              </Text>
              <Text
                style={[
                  styles.levelText,
                  intensity === item.level && styles.selectedLevelText,
                  { color: intensity === item.level ? '#FFF' : '#4A148C' },
                ]}
              >
                {item.level}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FF1493',
    textAlign: 'center',
    flex: 1,
  },
  headerContent: {
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
    width: width / 4,
    height: 160,
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
    fontSize: 10,
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