import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Import screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import GroupsScreen from './screens/GroupsScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // Show splash screen
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#16213e' },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#b8c1ec',
          headerStyle: { backgroundColor: '#16213e' },
          headerTintColor: '#fff',
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarLabel: 'ড্যাশবোর্ড',
            tabBarIcon: () => '📊',
            title: '💎 Diamond Bot',
          }}
        />
        <Tab.Screen 
          name="Groups" 
          component={GroupsScreen}
          options={{
            tabBarLabel: 'গ্রুপ',
            tabBarIcon: () => '👥',
            title: 'গ্রুপ লিস্ট',
          }}
        />
        <Tab.Screen 
          name="Payments" 
          component={PaymentsScreen}
          options={{
            tabBarLabel: 'পেমেন্ট',
            tabBarIcon: () => '💰',
            title: 'পেমেন্ট লিস্ট',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          options={{
            tabBarLabel: 'সেটিংস',
            tabBarIcon: () => '⚙️',
            title: 'সেটিংস',
          }}
        >
          {() => <SettingsScreen onLogout={handleLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
