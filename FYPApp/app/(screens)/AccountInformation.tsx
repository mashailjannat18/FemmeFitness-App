import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useUserAuth } from '@/context/UserAuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter, Link } from 'expo-router';

const AccountInformation = () => {
  const { user, refreshUser } = useUserAuth();
  const router = useRouter();
  const [editField, setEditField] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEdit = (field: string, currentValue: string) => {
    if (field === 'email') {
      router.push({ pathname: '/VerifyCurrentEmail', params: { email: user?.email || '' } });
      return;
    }
    setEditField(field);
    setTempValue(field === 'password' ? '' : currentValue);
    if (field === 'password') {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = async (field: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'No user logged in.');
      return;
    }

    try {
      let updateData: { [key: string]: string } = {};
      let trimmedValue = tempValue.trim();

      if (field === 'username') {
        if (!trimmedValue) {
          Alert.alert('Error', 'Username cannot be empty.');
          return;
        }
        const { data: existingUser } = await supabase
          .from('User')
          .select('id')
          .eq('username', trimmedValue.toLowerCase())
          .neq('id', user.id)
          .single();
        if (existingUser) {
          Alert.alert('Error', 'This username is already taken.');
          return;
        }
        updateData.username = trimmedValue.toLowerCase();
      } else if (field === 'password') {
        const { data: userData, error: fetchError } = await supabase
          .from('User')
          .select('password')
          .eq('id', user.id)
          .single();
        if (fetchError || !userData) {
          throw new Error('Failed to fetch user data.');
        }
        if (userData.password !== oldPassword) {
          Alert.alert('Error', 'Old password is incorrect.');
          return;
        }
        if (!newPassword || newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters long.');
          return;
        }
        if (newPassword !== confirmPassword) {
          Alert.alert('Error', 'New password and confirm password do not match.');
          return;
        }
        updateData.password = newPassword;
      }

      const { error } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw new Error('Failed to update user information: ' + error.message);
      }

      await refreshUser();

      if (field === 'username') setUsername(trimmedValue);
      setEditField(null);
      setTempValue('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('Success', 'Information updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update information.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('../(tabs)/Profile')}>
          <MaterialIcons name="arrow-back" size={24} color="#FF69B4" />
        </TouchableOpacity>
        <Text style={styles.header}>Account Information</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="user" size={22} color="#FF69B4" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Username</Text>
          </View>
          {editField === 'username' ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={tempValue}
                onChangeText={setTempValue}
                autoCapitalize="none"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={() => handleSave('username')}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.cardValue}>{username}</Text>
              <TouchableOpacity onPress={() => handleEdit('username', username)}>
                <MaterialIcons name="edit" size={20} color="#FF69B4" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="lock" size={22} color="#FF69B4" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Password</Text>
          </View>
          {editField === 'password' ? (
            <View style={styles.editContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  placeholder="Old Password"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <Ionicons
                    name={showOldPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="New Password"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm New Password"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={() => handleSave('password')}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.cardValue}>••••••••••</Text>
              <TouchableOpacity onPress={() => handleEdit('password', '')}>
                <MaterialIcons name="edit" size={20} color="#FF69B4" />
              </TouchableOpacity>
            </View>
          )}
          <Link href="/ForgotPassword" asChild>
            <TouchableOpacity style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="mail" size={22} color="#FF69B4" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Email Address</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.cardValue}>{email}</Text>
            <TouchableOpacity onPress={() => handleEdit('email', email)}>
              <MaterialIcons name="edit" size={20} color="#FF69B4" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  header: {
    fontSize: 23,
    fontWeight: '700',
    color: '#FF1493',
    textAlign: 'center',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#FF69B4',
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
  editContainer: {
    marginTop: 10,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#FF69B4',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#FF69B4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#FF69B4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default AccountInformation;