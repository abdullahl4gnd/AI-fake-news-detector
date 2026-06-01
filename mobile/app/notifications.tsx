import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();
  const [breakingNews, setBreakingNews] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);

  const notifications = [
    { label: 'Breaking News Alerts', desc: 'Get notified about major breaking news events', value: breakingNews, setter: setBreakingNews },
    { label: 'Analysis Complete', desc: 'Notify when your article analysis is ready', value: analysisComplete, setter: setAnalysisComplete },
    { label: 'Weekly Digest', desc: 'Receive a weekly summary of fake news trends', value: weeklyDigest, setter: setWeeklyDigest },
    { label: 'App Updates', desc: 'Get notified about new features and improvements', value: appUpdates, setter: setAppUpdates },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Notification Preferences</Text>

        {notifications.map((item) => (
          <View key={item.label} style={styles.notifItem}>
            <View style={styles.notifInfo}>
              <Text style={styles.notifLabel}>{item.label}</Text>
              <Text style={styles.notifDesc}>{item.desc}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.setter}
              trackColor={{ false: '#333333', true: '#ffffff' }}
              thumbColor={item.value ? '#000000' : '#888888'}
            />
          </View>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Push Notifications</Text>
          <Text style={styles.noteText}>
            Make sure notifications are enabled in your device settings to receive alerts from AI Fake News Detector.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 32, color: '#ffffff', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  placeholder: { width: 40 },
  content: { padding: 24, paddingTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#666666', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  notifItem: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  notifInfo: { flex: 1, gap: 4 },
  notifLabel: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  notifDesc: { fontSize: 12, color: '#888888', lineHeight: 18 },
  noteCard: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginTop: 8 },
  noteTitle: { fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 8 },
  noteText: { fontSize: 13, color: '#888888', lineHeight: 20 },
});