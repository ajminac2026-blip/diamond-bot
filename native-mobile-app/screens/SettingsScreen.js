import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function SettingsScreen({ onLogout }) {
  const handleLogout = () => {
    Alert.alert(
      'লগআউট',
      'আপনি কি লগআউট করতে চান?',
      [
        { text: 'না', style: 'cancel' },
        { text: 'হ্যাঁ', onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>অ্যাপ সেটিংস</Text>

        <View style={styles.settingCard}>
          <Text style={styles.settingIcon}>ℹ️</Text>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>অ্যাপ ভার্সন</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.settingIcon}>🔗</Text>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>সার্ভার স্ট্যাটাস</Text>
            <Text style={styles.settingValue}>Connected</Text>
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.settingIcon}>📱</Text>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>প্ল্যাটফর্ম</Text>
            <Text style={styles.settingValue}>React Native</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 লগআউট করুন</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>📖 নির্দেশনা</Text>
        <Text style={styles.infoText}>
          • API URL পরিবর্তন করতে services/api.js ফাইল এডিট করুন{'\n'}
          • আপনার কম্পিউটারের IP ব্যবহার করুন{'\n'}
          • আপনার ফোন ও কম্পিউটার একই WiFi তে থাকতে হবে{'\n'}
          • Admin Panel চালু রাখতে হবে (Port 3000)
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for Diamond Bot
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  settingCard: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  settingValue: {
    fontSize: 12,
    color: '#b8c1ec',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    margin: 15,
    padding: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#b8c1ec',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});
