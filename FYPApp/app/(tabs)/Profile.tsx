import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';
import { MaterialIcons } from '@expo/vector-icons';

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

  const routes = [
    { label: 'Account Information', route: '/(screens)/AccountInformation', icon: 'person' },
    { label: 'Personal Information', route: '/(screens)/PersonalInformation', icon: 'info' },
    { label: 'Disease Information', route: '/(screens)/DiseaseInformation', icon: 'healing' },
    { label: 'Goal Setting', route: '/(screens)/GoalSetting', icon: 'flag' },
    { label: 'Intensity Setting', route: '/(screens)/IntensitySetting', icon: 'fitness-center' },
    { label: 'Reminder', route: '/(screens)/Reminder', icon: 'notifications' },
  ] as const;

  // 👉 You can replace this link with any other image URL
  const backgroundImage = {
    uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k=',
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
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
                  <MaterialIcons name={item.icon} size={26} color="#9B2242" style={styles.icon} />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
                {index < routes.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={22} color="white" style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9B2242',
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
    color: '#822338',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3c1c6',
    marginHorizontal: 24,
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C2185B',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
    shadowColor: '#C2185B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;