import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';
import { Ionicons } from '@expo/vector-icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showLoginError, setShowLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useUserAuth();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleEmailChange = (text: string) => {
    const trimmedText = text.trim();
    setEmail(trimmedText);
    setIsEmailValid(emailRegex.test(trimmedText) || trimmedText === '');
    setShowEmailError(trimmedText !== '' && !emailRegex.test(trimmedText));
    setShowLoginError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setIsPasswordValid(text.length >= 6 || text === '');
    setShowPasswordError(text.length > 0 && text.length < 6);
    setShowLoginError(null);
  };

  const handleLogin = async () => {
    if (!email || !password || !isEmailValid || !isPasswordValid) {
      setShowEmailError(!isEmailValid && email !== '');
      setShowPasswordError(!isPasswordValid && password !== '');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      router.push('../(tabs)');
    } else {
      setShowLoginError(result.error || 'Invalid email or password.');
    }
  };

  const handleBack = () => {
    router.push('./EntryScreen');
  };

  let passwordInput: TextInput | null = null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Let's get you in</Text>

      {showLoginError && <Text style={styles.errorText}>{showLoginError}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, (!isEmailValid || showLoginError) && styles.invalidInput]}
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
          ref={(input) => (passwordInput = input)}
          style={[styles.input, styles.passwordInput, (!isPasswordValid || showLoginError) && styles.invalidInput]}
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
            email && password && isEmailValid && isPasswordValid ? styles.activeButton : styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={!email || !password || !isEmailValid || !isPasswordValid}
        >
          <Text style={styles.buttonText}>Login</Text>
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
});

export default Login;