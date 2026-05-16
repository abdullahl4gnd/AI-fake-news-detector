import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { authAPI } from '../../services/api';

export default function DeleteAccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'Are you absolutely sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await authAPI.deleteAccount(password);
              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await logout();
                      router.replace('/login');
                    },
                  },
                ]
              );
            } catch (error: any) {
              const message = error.response?.data?.error || 'Failed to delete account. Please try again.';
              Alert.alert('Error', message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>⚠️</Text>
          </View>
        </View>

        <Text style={styles.title}>Delete Account</Text>

        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            This action is permanent and cannot be undone. Please read carefully before proceeding.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What will happen:</Text>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              Your profile and account information will be permanently deleted
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              All your news submissions and analysis history will be removed
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              Your statistics and dashboard data will be lost forever
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              You will be immediately logged out and cannot recover this account
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              You will need to create a new account to use the service again
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Confirm your password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#8b9dc3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <Text style={styles.hint}>
            Enter your password to confirm account deletion
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef444420',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  warningIconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  warningCard: {
    backgroundColor: '#ef444420',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  warningText: {
    fontSize: 14,
    color: '#ef4444',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  consequenceItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#ef4444',
    marginRight: 12,
    fontWeight: 'bold',
  },
  consequenceText: {
    flex: 1,
    fontSize: 14,
    color: '#8b9dc3',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a2942',
    borderWidth: 1,
    borderColor: '#2d4263',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#8b9dc3',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#1a2942',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d4263',
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#8b9dc3',
    fontSize: 16,
    fontWeight: '600',
  },
});