import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { apiService } from '../services/api';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>কোন পেমেন্ট নেই</Text>
        </View>
      ) : (
        <View style={styles.paymentsList}>
          {payments.slice(0, 50).map((payment, index) => (
            <View key={index} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentUser}>
                  {payment.userName || 'Unknown User'}
                </Text>
                <Text style={styles.paymentDate}>
                  {new Date(payment.date).toLocaleDateString('bn-BD')}
                </Text>
              </View>
              <Text style={styles.paymentAmount}>
                ৳{payment.amount || 0}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#b8c1ec',
    fontSize: 16,
  },
  paymentsList: {
    padding: 15,
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  paymentDate: {
    fontSize: 12,
    color: '#b8c1ec',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
