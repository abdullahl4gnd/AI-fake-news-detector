import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: 'We collect only what is necessary to provide our service: your username, email address, and the articles or images you submit for analysis. We do not collect your location, contacts, or any other device information.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'Your information is used solely to provide the fake news detection service, maintain your account, and display your submission history. We do not use your data for advertising or sell it to third parties under any circumstances.',
  },
  {
    title: '3. Data Storage and Security',
    content: 'All data is stored in a secured MySQL database. Passwords are hashed using PBKDF2 with SHA-256. Data is transmitted over encrypted HTTPS connections. We implement industry-standard security practices to protect your information.',
  },
  {
    title: '4. Data Sharing',
    content: 'We do not sell, trade, rent, or share your personal information with any third party. Your submitted articles are used only for analysis and are stored privately under your account — no other user can see your submissions.',
  },
  {
    title: '5. Data Retention',
    content: 'Your data is retained as long as your account is active. When you delete your account, all your personal information and submission history is permanently and immediately removed from our database.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to access, edit, or delete your personal data at any time through the Profile screen. You can update your information via Edit Profile or permanently delete everything via Delete Account.',
  },
  {
    title: '7. Cookies and Tracking',
    content: 'AI Fake News Detector does not use cookies or any tracking technologies. We do not track your behavior across other apps or websites.',
  },
  {
    title: '8. Children\'s Privacy',
    content: 'This application is not directed at children under 13. We do not knowingly collect personal information from children under 13 years of age.',
  },
  {
    title: '9. Changes to This Policy',
    content: 'We may update this Privacy Policy occasionally. We will notify you of significant changes through the app. Continued use of the app after changes means you accept the updated policy.',
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>🔏</Text>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroDate}>Last updated: June 2026</Text>
          <Text style={styles.heroText}>
            We are committed to protecting your privacy. This policy explains what data we collect and how we use it.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardText}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            AI Fake News Detector — Abdullah Firas Fawzi Al Obaidi — 2026
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
  heroCard: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  heroDate: { fontSize: 13, color: '#888888', marginBottom: 12 },
  heroText: { fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  cardText: { fontSize: 13, color: '#888888', lineHeight: 20 },
  footerCard: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#666666', textAlign: 'center' },
});