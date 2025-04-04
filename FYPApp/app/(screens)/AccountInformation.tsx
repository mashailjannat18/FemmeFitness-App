import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const AccountInformation = () => {
  // User data
  const user = {
    username: "creative_coder_42",
    email: "myemail@example.com",
    passwordLastChanged: "2 weeks ago",
    passwordStrength: "Strong"
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Username Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>👤</Text>
          <Text style={styles.cardTitle}>Username</Text>
        </View>
        <Text style={styles.cardValue}>{user.username}</Text>
        <Text style={styles.cardNote}>This is your public username</Text>
      </View>

      {/* Password Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🔒</Text>
          <Text style={styles.cardTitle}>Password</Text>
        </View>
        <Text style={styles.cardValue}>••••••••••</Text>
        <Text style={styles.cardNote}>Last changed: {user.passwordLastChanged}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Strength:</Text>
          <Text style={[styles.infoValue, styles.strong]}>{user.passwordStrength}</Text>
        </View>
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Email Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📧</Text>
          <Text style={styles.cardTitle}>Email Address</Text>
        </View>
        <Text style={styles.cardValue}>{user.email}</Text>
        <Text style={styles.cardNote}>Used for account recovery</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 15,
    paddingBottom: 30, // Add extra padding at the bottom
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '500',
    color: '#2c2c2c',
    marginBottom: 5,
  },
  cardNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  strong: {
    color: '#4CAF50',
  },
  changeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#3a3a3a',
    fontWeight: '500',
  },
});

export default AccountInformation;