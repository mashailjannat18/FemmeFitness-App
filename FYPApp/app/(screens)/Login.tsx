import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showLoginError, setShowLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useUserAuth();

  const handleUsernameChange = (text: string) => {
    const trimmedText = text.trim();
    setUsername(trimmedText);
    setIsUsernameValid(trimmedText.length >= 3 || trimmedText === '');
    setShowUsernameError(trimmedText !== '' && trimmedText.length < 3);
    setShowLoginError(null);
  };

  const handlePasswordChange = (text: string) => {
    const trimmedText = text.trim();
    setPassword(trimmedText);
    setShowPasswordError(trimmedText.length > 0 && trimmedText.length < 6);
    setShowLoginError(null);
  };

  const handleLogin = async () => {
    if (username === '' || password === '') {
      setIsUsernameValid(username !== '');
      setIsPasswordValid(password !== '');
      return;
    }

    if (username.length < 3) {
      setShowUsernameError(true);
      return;
    }

    if (password.length < 6) {
      setShowPasswordError(true);
      return;
    }

    try {
      await login(username, password);
      router.push('../(tabs)');
    } catch (err: any) {
      // Display a standardized error message instead of the error from the login function
      setShowLoginError('Invalid email or password.');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  let passwordInput: TextInput | null = null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Let's get you in</Text>

      {showLoginError && <Text style={styles.errorText}>{showLoginError}</Text>}

      <TextInput
        style={[styles.input, (!isUsernameValid || showLoginError) && styles.invalidInput]}
        placeholder="Enter your username"
        value={username}
        onChangeText={handleUsernameChange}
        onSubmitEditing={() => passwordInput?.focus()}
      />
      {showUsernameError && <Text style={styles.errorText}>Username must be at least 3 characters long.</Text>}

      <TextInput
        ref={(input) => (passwordInput = input)}
        style={[styles.input, (!isPasswordValid || showLoginError) && styles.invalidInput]}
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
            username && password && isUsernameValid && password.length >= 6 ? styles.activeButton : styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={!username || !password || !isUsernameValid || password.length < 6}
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