import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserData } from '@/datafiles/userData';
import { useUserAuth } from '@/context/UserAuthContext';
import { Ionicons } from '@expo/vector-icons';

const Question10: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [showSignupError, setShowSignupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signUp } = useUserAuth();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleEmailChange = (text: string) => {
    const trimmedText = text.trim();
    setEmail(trimmedText);
    setIsEmailValid(emailRegex.test(trimmedText) || trimmedText === '');
    setShowEmailError(trimmedText !== '' && !emailRegex.test(trimmedText));
    setShowSignupError(null);
  };

  const handlePasswordChange = (text: string) => {
    const trimmedText = text.trim();
    setPassword(trimmedText);
    setShowPasswordError(trimmedText.length > 0 && trimmedText.length < 6);
    setShowSignupError(null);
  };

  const handleUsernameChange = (text: string) => {
    const trimmedText = text.trim();
    setUsername(trimmedText);
    setShowUsernameError(trimmedText.length > 0 && trimmedText.length < 3);
    setShowSignupError(null);
  };

  const handleBack = () => {
    router.push('/(screens)/Question8');
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setShowSignupError(null);

      if (!email || !password || !username || !isEmailValid || password.length < 6 || username.length < 3) {
        setShowEmailError(!isEmailValid && email !== '');
        setShowPasswordError(password.length < 6 && password !== '');
        setShowUsernameError(username.length < 3 && username !== '');
        throw new Error('Please fill all fields with valid data.');
      }

      const userData = getUserData();
      const challengeDays = userData.challengeDays;

      if (!challengeDays || challengeDays <= 0) {
        throw new Error('Challenge days must be selected and greater than 0.');
      }

      // Initiate signup and send confirmation code
      await signUp(email, password, username, challengeDays);

      // Navigate to confirmation screen
      router.push({
        pathname: './ConfirmCode',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      console.error('Signup error:', err.message);
      if (err.message === 'This email has already been signed up with') {
        setShowSignupError('This email is already registered.');
      } else if (err.message === 'This username is taken') {
        setShowSignupError('This username is already taken.');
      } else {
        setShowSignupError(err.message || 'An error occurred during signup.');
      }
    } finally {
      setLoading(false);
    }
  };

  let passwordInput: TextInput | null = null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>
          Please wait while we process your information
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create an Account</Text>

      {showSignupError && <Text style={styles.errorText}>{showSignupError}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, !isEmailValid && styles.invalidInput]}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          onSubmitEditing={() => passwordInput?.focus()}
        />
      </View>
      {showEmailError && <Text style={styles.errorText}>Please enter a valid email address.</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, showUsernameError && styles.invalidInput]}
          placeholder="Enter your username"
          value={username}
          onChangeText={handleUsernameChange}
        />
      </View>
      {showUsernameError && <Text style={styles.errorText}>Username must be at least 3 characters long.</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          ref={(input) => (passwordInput = input)}
          style={[styles.input, styles.passwordInput, showPasswordError && styles.invalidInput]}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={handlePasswordChange}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>
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
  inputContainer: {
    width: '80%',
    position: 'relative',
    marginVertical: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
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