import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { addUserToSupabase, setUserData } from '@/datafiles/userData';
import { useUserAuth } from '@/context/UserAuthContext';
import { supabase } from '@/lib/supabase';

const Question10: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();
  const { signUp, updateUser } = useUserAuth();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(emailRegex.test(text) || text === '');
    setShowEmailError(text !== '' && !emailRegex.test(text));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setShowPasswordError(text.length > 0 && text.length < 6);
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setShowUsernameError(text.length > 0 && text.length < 3);
  };

  const handleBack = () => {
    router.push('/(screens)/Question9');
  };

  const handleSignUp = async () => {
    try {
      setLoading(true); // Show loading screen
      setUserData('email', email.trim());
      setUserData('password', password.trim());
      setUserData('username', username.trim().toLowerCase());
      await signUp(email, password, username);
      await addUserToSupabase();
      const { data, error } = await supabase
        .from('User')
        .select('id, username')
        .eq('username', username.trim().toLowerCase())
        .single();
      if (error) throw error;
      updateUser(data.username, data.id);
      router.push('../(tabs)');
    } catch (err: any) {
      console.error('Signup error:', err);
      Alert.alert('Error', err.message);
      setLoading(false); // Hide loading screen on error
    }
  };

  let passwordInput: TextInput | null = null;

  // If loading, show the loading screen instead of the form
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>
          Please wait for a minute while we process your information
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create an Account</Text>

      <TextInput
        style={[styles.input, !isEmailValid && styles.invalidInput]}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={handleEmailChange}
        onSubmitEditing={() => passwordInput?.focus()}
      />
      {showEmailError && <Text style={styles.errorText}>Please enter a valid email address.</Text>}

      <TextInput
        style={[styles.input, showUsernameError && styles.invalidInput]}
        placeholder="Enter your username"
        value={username}
        onChangeText={handleUsernameChange}
      />
      {showUsernameError && <Text style={styles.errorText}>Username must be at least 3 characters long.</Text>}

      <TextInput
        ref={(input) => (passwordInput = input)}
        style={[styles.input, showPasswordError && styles.invalidInput]}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={handlePasswordChange}
      />
      {showPasswordError && <Text style={styles.errorText}>Password must be at least 6 characters long.</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            email && password && username && isEmailValid && password.length >= 6 && username.length >= 3
              ? styles.activeButton
              : styles.disabledButton,
          ]}
          onPress={handleSignUp}
          disabled={!email || !password || !username || !isEmailValid || password.length < 6 || username.length < 3}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '80%',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  invalidInput: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    width: '80%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 40,
    marginHorizontal: 3,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#ccc',
  },
  activeButton: {
    backgroundColor: '#d63384',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Styles for the loading screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default Question10;