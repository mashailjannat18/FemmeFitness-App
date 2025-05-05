import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { Link } from 'expo-router';

const IntroMessageScreen: React.FC = () => {
  return (
    <ImageBackground
      source={require('../../assets/images/3.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay}>
        {/* Skip button */}
        <View style={styles.skipContainer}>
          <Link href="./EntryScreen" asChild>
            <TouchableOpacity>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.content}>
          <Text style={styles.mainText}>Welcome to FemmeFitness</Text>

          <Text style={styles.subText}>
            Empower Your Mind. Strengthen Your Body. Celebrate Your Journey!
          </Text>

          <Text style={styles.messageText}>
            Join a community built for strong, unstoppable women. Personalized workouts, motivation, and support — all designed to help you shine from within.
          </Text>

          <Link href="./MessageScreen" asChild>
            <TouchableOpacity style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 70,
  },
  skipText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    color: '#d63384',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
  },
  subText: {
    color: '#ff69b4',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  messageText: {
    color: '#7d4c5e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  nextButton: {
    backgroundColor: '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default IntroMessageScreen;