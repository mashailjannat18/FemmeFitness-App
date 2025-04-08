import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext'; // Import useUserAuth

const Profile = () => {
  const router = useRouter();
  const { logout } = useUserAuth(); // Access logout from context

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from context
      router.push('/Login'); // Redirect to Login screen after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally display an error message to the user
      // For now, we'll just log the error as in Home.tsx
    }
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
    backgroundColor: '#d63384', // Match Home.tsx logoutButton style
    paddingVertical: 8, // Match Home.tsx
    paddingHorizontal: 25, // Match Home.tsx
    borderRadius: 8, // Match Home.tsx
    alignItems: 'center', // Match Home.tsx
    justifyContent: 'center', // Match Home.tsx
  },
  logoutText: {
    color: '#fff', // Match Home.tsx buttonText style
    fontSize: 16, // Match Home.tsx
    fontWeight: '600', // Match Profile.tsx existing logoutText
  },
});

export default Profile;