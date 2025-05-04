import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '@/assets/images/Logo.png';

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useUserAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/Login');
    } catch (error) {
      
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
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <Image
          source={Logo}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Profile</Text>
        <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ff1297',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Content Styles
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 20,
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