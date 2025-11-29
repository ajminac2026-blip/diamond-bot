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

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, groupsData] = await Promise.all([
        apiService.getStats(),
        apiService.getGroups(),
      ]);
      setStats(statsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>মোট ইউজার</Text>
            <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💎</Text>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>মোট ডায়মন্ড</Text>
            <Text style={styles.statValue}>{stats?.totalDiamonds || 0}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>মোট পেমেন্ট</Text>
            <Text style={styles.statValue}>{stats?.totalPayments || 0}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>অ্যাক্টিভ গ্রুপ</Text>
            <Text style={styles.statValue}>{groups.length || 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>সাম্প্রতিক কার্যক্রম</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>👥</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>
                {stats?.totalUsers || 0} জন ইউজার
              </Text>
              <Text style={styles.activityDesc}>সিস্টেমে রেজিস্টার্ড</Text>
            </View>
            <Text style={styles.activityTime}>এখন</Text>
          </View>

          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>💎</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>
                {stats?.totalDiamonds || 0} ডায়মন্ড
              </Text>
              <Text style={styles.activityDesc}>মোট স্টক</Text>
            </View>
            <Text style={styles.activityTime}>আপডেট</Text>
          </View>

          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📊</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>
                {groups.length || 0} টি গ্রুপ
              </Text>
              <Text style={styles.activityDesc}>অ্যাক্টিভ গ্রুপ</Text>
            </View>
            <Text style={styles.activityTime}>এখন</Text>
          </View>
        </View>
      </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statIcon: {
    fontSize: 32,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#b8c1ec',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
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
  activityList: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3561',
    gap: 15,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  activityDesc: {
    fontSize: 12,
    color: '#b8c1ec',
  },
  activityTime: {
    fontSize: 11,
    color: '#b8c1ec',
  },
});
