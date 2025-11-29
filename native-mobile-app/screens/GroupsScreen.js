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

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
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
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>কোন গ্রুপ নেই</Text>
        </View>
      ) : (
        <View style={styles.groupsList}>
          {groups.map((group, index) => (
            <View key={index} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>
                  {group.name || 'Unknown Group'}
                </Text>
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>
                    {group.userCount || 0} জন
                  </Text>
                </View>
              </View>

              <View style={styles.groupStats}>
                <View style={styles.groupStat}>
                  <Text style={styles.groupStatValue}>
                    {group.totalOrders || 0}
                  </Text>
                  <Text style={styles.groupStatLabel}>অর্ডার</Text>
                </View>

                <View style={styles.groupStat}>
                  <Text style={styles.groupStatValue}>
                    {group.totalDiamonds || 0}
                  </Text>
                  <Text style={styles.groupStatLabel}>ডায়মন্ড</Text>
                </View>

                <View style={styles.groupStat}>
                  <Text style={styles.groupStatValue}>
                    ৳{group.totalPayments || 0}
                  </Text>
                  <Text style={styles.groupStatLabel}>পেমেন্ট</Text>
                </View>
              </View>
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
  groupsList: {
    padding: 15,
    gap: 15,
  },
  groupCard: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  groupBadge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  groupBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 10,
  },
  groupStat: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  groupStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  groupStatLabel: {
    fontSize: 11,
    color: '#b8c1ec',
    marginTop: 3,
  },
});
