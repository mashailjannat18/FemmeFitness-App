import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Link } from 'expo-router';

const FullScreenImageWithButton: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/1.jpg')} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.mainText}>Welcome to FemmeFitness</Text>
        <Text style={styles.subText}>Your Path to a Happier, Healthier You!</Text>
        <View style={styles.container1}>
          <Link
            href={{
              pathname: `./Question1`,
            }}
            style={styles.button1}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </Link>
          <Link
            href={{
              pathname: `./Login`,
            }}
            style={styles.button2}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Link>
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  mainText: {
    color: 'white',
    fontSize: 32,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  container1: {
    flexDirection: 'row',
    gap: 50,
  },
  button1: {
    backgroundColor: '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  button2: {
    backgroundColor: '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FullScreenImageWithButton;
