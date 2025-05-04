import React, { useState, useEffect } from 'react';
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

const ConfirmResetCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 1 minute
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyResetCode, resendCode } = useUserAuth();

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    if (timeLeft <= 0) {
      setError('Confirmation code has expired.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!email) {
        throw new Error('Email is missing.');
      }

      await verifyResetCode(email, code);

      router.push({
        pathname: '/ResetPassword',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      console.error('Verification error:', err.message);
      setError(err.message || 'Invalid or expired confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);
      setTimeLeft(600);
      setResendCooldown(60);

      if (!email) {
        throw new Error('Email is missing.');
      }

      await resendCode(email);
    } catch (err: any) {
      console.error('Resend error:', err.message);
      if (err.message === 'Maximum resend attempts reached. Please restart the process.') {
        router.push('/ForgotPassword');
      }
      setError(err.message || 'Failed to resend confirmation code.');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Verifying your code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Enter Confirmation Code</Text>
        <Text style={styles.subHeader}>
          We sent a 6-digit code to {email}. It expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} minutes.
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error && styles.invalidInput]}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
            maxLength={6}
            value={code}
            onChangeText={(text) => {
              setCode(text.trim());
              setError(null);
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, code.length === 6 && timeLeft > 0 ? styles.activeButton : styles.disabledButton]}
            onPress={handleVerify}
            disabled={code.length !== 6 || timeLeft <= 0 || loading}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resendLoading || resendCooldown > 0}
          style={styles.resendContainer}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color="#d63384" />
          ) : (
            <Text
              style={[
                styles.resendText,
                resendCooldown > 0 ? styles.resendTextDisabled : styles.resendTextActive,
              ]}
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#ccc',
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
    textAlign: 'center',
  },
  invalidInput: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
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
  resendContainer: {
    marginTop: 20,
  },
  resendText: {
    fontSize: 16,
  },
  resendTextActive: {
    color: '#d63384',
  },
  resendTextDisabled: {
    color: '#ccc',
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

export default ConfirmResetCode;