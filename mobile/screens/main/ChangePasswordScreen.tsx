import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '../../services/api';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert('Error', 'All password fields are required'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'New passwords do not match'); return; }
    if (newPassword.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🔒</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Enter your current password and choose a new secure password.
        </Text>

        {[
          { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, placeholder: 'Enter current password' },
          { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'Enter new password' },
          { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Confirm new password' },
        ].map((field) => (
          <View key={field.label} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              placeholderTextColor="#555555"
              value={field.value}
              onChangeText={field.setter}
              secureTextEntry
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdatePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#000000" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
        </TouchableOpacity>
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
  content: { padding: 24 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48 },
  description: { fontSize: 14, color: '#888888', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#888888', marginBottom: 8 },
  input: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, fontSize: 16, color: '#ffffff' },
  saveButton: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#000000', fontSize: 16, fontWeight: '600' },
});