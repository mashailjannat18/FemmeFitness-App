import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // Using expo-router for navigation

const Profile = () => {
  const router = useRouter(); // Router hook for navigation

  const handleLogout = () => {
    // You might want to add your logout logic here (clearing tokens, etc.)
    console.log('User logged out');
    // Then navigate to the login screen
    // router.push('/Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile Settings</Text>

        <View style={styles.optionsContainer}>
          {/* Account Information */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/AccountInformation')}
          >
            <Text style={styles.optionText}>Account Information</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* Personal Information */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/PersonalInformation')}
          >
            <Text style={styles.optionText}>Personal Information</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* Disease Information */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/DiseaseInformation')}
          >
            <Text style={styles.optionText}>Disease Information</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* Goal Setting */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/GoalSetting')}
          >
            <Text style={styles.optionText}>Goal Setting</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* Intensity Setting */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/IntensitySetting')}
          >
            <Text style={styles.optionText}>Intensity Setting</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* Reminder */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/Reminder')}
          >
            <Text style={styles.optionText}>Reminder</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 32,
    color: '#2c3e50',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  option: {
    padding: 18,
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
  },
  logoutContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Profile;