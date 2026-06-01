import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { newsAPI } from '../../services/api';
import { useRouter } from 'expo-router';

interface DashboardData {
  total_submissions: number;
  fake_count: number;
  real_count: number;
  latest_submissions: Array<{ id: number; final_label: string }>;
}

interface Submission {
  id: number;
  article_text: string;
  final_label: string;
  credibility_score: number;
  created_at: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dashboardRes, submissionsRes] = await Promise.all([
        newsAPI.getDashboardSummary(),
        newsAPI.getSubmissions(),
      ]);
      setDashboard(dashboardRes.data);
      setSubmissions(submissionsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getLabelColor = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'real': return '#10b981';
      case 'fake': return '#ef4444';
      case 'uncertain': return '#f59e0b';
      default: return '#888888';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.username}!</Text>
        <Text style={styles.subtitle}>Track your news verification history</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboard?.total_submissions || 0}</Text>
          <Text style={styles.statLabel}>Total Checks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>
            {dashboard?.real_count || 0}
          </Text>
          <Text style={styles.statLabel}>Real News</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>
            {dashboard?.fake_count || 0}
          </Text>
          <Text style={styles.statLabel}>Fake News</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Submissions</Text>
        {submissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No submissions yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/detect')}
            >
              <Text style={styles.emptyButtonText}>Analyze Your First Article</Text>
            </TouchableOpacity>
          </View>
        ) : (
          submissions.map((submission) => (
            <TouchableOpacity
              key={submission.id}
              style={styles.submissionCard}
              onPress={() => router.push(`/result/${submission.id}`)}
            >
              <View style={styles.submissionHeader}>
                <View style={[styles.labelBadge, { backgroundColor: getLabelColor(submission.final_label) + '20' }]}>
                  <Text style={[styles.labelText, { color: getLabelColor(submission.final_label) }]}>
                    {submission.final_label?.toUpperCase() || 'PENDING'}
                  </Text>
                </View>
                <Text style={styles.scoreText}>{Math.round(submission.credibility_score)}%</Text>
              </View>
              <Text style={styles.articlePreview} numberOfLines={2}>
                {submission.article_text}
              </Text>
              <Text style={styles.dateText}>
                {new Date(submission.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  submissionCard: {
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  articlePreview: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});