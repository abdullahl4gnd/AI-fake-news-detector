import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { newsAPI } from '../../services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface SubmissionDetail {
  id: number;
  article_text: string;
  final_label: string;
  credibility_score: number;
  text_fake_score: number;
  suspicious_words: string;
  explanation: string;
  created_at: string;
}

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubmission(); }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await newsAPI.getSubmissionDetail(Number(id));
      setSubmission(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load submission details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusLabel = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'real': return 'Likely Real';
      case 'fake': return 'Likely Fake';
      case 'uncertain': return 'Uncertain';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!submission) return null;

  const statusColor = getStatusColor(submission.credibility_score);
  const statusLabel = getStatusLabel(submission.final_label);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
      </View>

      <View style={styles.resultCard}>
        <View style={[styles.scoreCircle, { borderColor: statusColor, backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.scoreNumber, { color: statusColor }]}>{Math.round(submission.credibility_score)}%</Text>
          <Text style={[styles.scoreLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <Text style={styles.confidenceText}>Confidence Level: {Math.round(submission.credibility_score)}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Article Text</Text>
        <View style={styles.textCard}>
          <Text style={styles.articleText}>{submission.article_text}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis Details</Text>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Credibility Score</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${submission.credibility_score}%`, backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.detailValue}>{Math.round(submission.credibility_score)}%</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Fake News Indicators</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${submission.text_fake_score}%`, backgroundColor: '#ef4444' }]} />
          </View>
          <Text style={styles.detailValue}>{Math.round(submission.text_fake_score)}%</Text>
        </View>

        {submission.suspicious_words && (
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Suspicious Words</Text>
            <Text style={styles.suspiciousWords}>{submission.suspicious_words || 'None detected'}</Text>
          </View>
        )}

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Explanation</Text>
          <Text style={styles.explanation}>{submission.explanation}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Analyzed On</Text>
          <Text style={styles.dateValue}>{new Date(submission.created_at).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.legendSection}>
        <Text style={styles.sectionTitle}>Score Guide</Text>
        {[
          { color: '#10b981', text: '70-100%: Likely Real' },
          { color: '#f59e0b', text: '40-69%: Uncertain' },
          { color: '#ef4444', text: '0-39%: Likely Fake' },
        ].map((item) => (
          <View key={item.text} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  header: { padding: 24, paddingTop: 60 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 18, color: '#ffffff', fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  resultCard: { margin: 24, marginTop: 0, padding: 32, backgroundColor: '#111111', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  scoreCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreNumber: { fontSize: 48, fontWeight: 'bold' },
  scoreLabel: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  confidenceText: { fontSize: 14, color: '#888888' },
  section: { padding: 24, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 },
  textCard: { backgroundColor: '#111111', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333333' },
  articleText: { fontSize: 14, color: '#cccccc', lineHeight: 22 },
  detailCard: { backgroundColor: '#111111', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333333' },
  detailLabel: { fontSize: 12, fontWeight: '600', color: '#888888', marginBottom: 8, textTransform: 'uppercase' },
  detailValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginTop: 8 },
  progressBar: { height: 8, backgroundColor: '#222222', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  suspiciousWords: { fontSize: 14, color: '#f59e0b', lineHeight: 22 },
  explanation: { fontSize: 14, color: '#cccccc', lineHeight: 22 },
  dateValue: { fontSize: 14, color: '#888888' },
  legendSection: { padding: 24, paddingTop: 0, marginBottom: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendText: { fontSize: 14, color: '#888888' },
});