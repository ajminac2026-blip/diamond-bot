import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('ত্রুটি', 'ইমেইল এবং পাসওয়ার্ড দিন');
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.login(email, password);
      
      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        onLogin();
      } else {
        Alert.alert('ত্রুটি', 'লগইন ব্যর্থ হয়েছে');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'লগইন ব্যর্থ',
        'ইমেইল/পাসওয়ার্ড ভুল অথবা সার্ভার সংযোগ নেই'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.loginBox}>
        <Text style={styles.logo}>💎</Text>
        <Text style={styles.title}>Diamond Bot</Text>
        <Text style={styles.subtitle}>অ্যাডমিন প্যানেল</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>ইমেইল</Text>
          <TextInput
            style={styles.input}
            placeholder="আপনার ইমেইল"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>পাসওয়ার্ড</Text>
          <TextInput
            style={styles.input}
            placeholder="আপনার পাসওয়ার্ড"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>লগইন করুন</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Default: rubelc45@gmail.com / Rubel890
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c1ec',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#b8c1ec',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#2d3561',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
  },
});
