import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';
import { Ionicons } from '@expo/vector-icons';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showPasswordError, setShowPasswordError] = useState<boolean>(false);
  const [showConfirmError, setShowConfirmError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resetPassword, refreshUser } = useUserAuth();

  const handlePasswordChange = (text: string) => {
    const trimmedText = text.trim();
    setNewPassword(trimmedText);
    setShowPasswordError(trimmedText.length > 0 && trimmedText.length < 6);
    setShowConfirmError(confirmPassword && trimmedText !== confirmPassword);
  };

  const handleConfirmChange = (text: string) => {
    const trimmedText = text.trim();
    setConfirmPassword(trimmedText);
    setShowConfirmError(trimmedText !== newPassword);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setShowPasswordError(false);
      setShowConfirmError(false);

      if (!newPassword || newPassword.length < 6) {
        setShowPasswordError(true);
        throw new Error('Password must be at least 6 characters long.');
      }

      if (newPassword !== confirmPassword) {
        setShowConfirmError(true);
        throw new Error('Passwords do not match.');
      }

      if (!email) {
        throw new Error('Email is missing.');
      }

      await resetPassword(email, newPassword);
      await refreshUser();

      Alert.alert('Success', 'Password updated successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace('/AccountInformation'),
        },
      ]);
    } catch (err: any) {
      console.error('Password reset error:', err.message);
      Alert.alert('Error', err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Updating your password...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Reset Password</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.header}>Set New Password</Text>
        <Text style={styles.subHeader}>
          Enter and confirm your new password.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, showPasswordError && styles.invalidInput]}
            placeholder="New Password"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={handlePasswordChange}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(prev => !prev)}
          >
            <Ionicons
              name={showNewPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {showPasswordError && (
          <Text style={styles.errorText}>Password must be at least 6 characters long.</Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, showConfirmError && styles.invalidInput]}
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={handleConfirmChange}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(prev => !prev)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {showConfirmError && (
          <Text style={styles.errorText}>Passwords do not match.</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, newPassword && confirmPassword && !showPasswordError && !showConfirmError ? styles.activeButton : styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!newPassword || !confirmPassword || showPasswordError || showConfirmError}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#d63384',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
    paddingRight: 40,
  },
  invalidInput: {
    borderColor: '#e74c3c',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 15,
    width: '80%',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
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
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});

export default ResetPassword;