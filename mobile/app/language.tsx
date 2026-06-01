import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('en');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Select your preferred language</Text>

        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.languageItem, selected === lang.code && styles.languageItemActive]}
            onPress={() => setSelected(lang.code)}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{lang.name}</Text>
              <Text style={styles.languageNative}>{lang.native}</Text>
            </View>
            <View style={[styles.radio, selected === lang.code && styles.radioActive]}>
              {selected === lang.code && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Coming Soon</Text>
          <Text style={styles.noteText}>
            Arabic and Turkish language support will be fully available in the next version of the app. Currently only English is supported.
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
  languageItem: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  languageItemActive: { borderColor: '#ffffff', backgroundColor: '#1a1a1a' },
  languageInfo: { gap: 4 },
  languageName: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  languageNative: { fontSize: 13, color: '#888888' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#555555', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#ffffff' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' },
  noteCard: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginTop: 8 },
  noteTitle: { fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 6 },
  noteText: { fontSize: 13, color: '#888888', lineHeight: 20 },
});