import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';

const Profile = () => {
  const router = useRouter();
  const { logout } = useUserAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const iconColors = [
    '#FF6B6B',
    '#6B8E23',
    '#20B2AA',
    '#9370DB',
    '#FF8C00',
    '#1E90FF',
  ];

  const routes = [
    { label: 'Account Information', route: '/(screens)/AccountInformation', icon: 'person' },
    { label: 'Personal Information', route: '/(screens)/PersonalInformation', icon: 'info' },
    { label: 'Disease Information', route: '/(screens)/DiseaseInformation', icon: 'healing' },
    { label: 'Goal Setting', route: '/(screens)/GoalSetting', icon: 'flag' },
    { label: 'Intensity Setting', route: '/(screens)/IntensitySetting', icon: 'fitness-center' },
    { label: 'Reminder', route: '/(screens)/Reminder', icon: 'notifications' },
  ] as const;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile Settings</Text>

        <View style={styles.optionsContainer}>
          {routes.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => router.push(item.route)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={26}
                  color={iconColors[index % iconColors.length]}
                  style={styles.icon}
                />
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
              {index < routes.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="white" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF1493',
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f3c1c6',
    shadowColor: '#9B2242',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 14,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3c1c6',
    marginHorizontal: 24,
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;