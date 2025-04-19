import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const AccountInformation = () => {
  const user = {
    username: 'creative_coder_42',
    email: 'myemail@example.com',
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Username Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="user" size={22} color="#FF69B4" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Username</Text>
        </View>
        <Text style={styles.cardValue}>{user.username}</Text>
      </View>

      {/* Password Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="lock" size={22} color="#FF69B4" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Password</Text>
        </View>
        <Text style={styles.cardValue}>••••••••••</Text>
      </View>

      {/* Email Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="mail" size={22} color="#FF69B4" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Email Address</Text>
        </View>
        <Text style={styles.cardValue}>{user.email}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#ffffff', // White background for the screen
  },
  card: {
    backgroundColor: '#ffffff', // White card background
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#FF69B4', // Pink shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FF69B4', // Pink border
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
    color: '#FF69B4', // Pink color for headings
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
});

export default AccountInformation;