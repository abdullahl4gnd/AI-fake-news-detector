import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { authAPI } from '../../services/api';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) { Alert.alert('Permission Required', 'Please allow access to your photos'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const handleSaveChanges = async () => {
    if (!fullName.trim() || !email.trim()) { Alert.alert('Error', 'Full name and email are required'); return; }
    setLoadingProfile(true);
    try {
      await authAPI.updateProfile(fullName, email, phoneNumber, bio);
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          {[
            { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Enter your full name', keyboard: 'default' },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'Enter your email', keyboard: 'email-address' },
            { label: 'Phone Number', value: phoneNumber, setter: setPhoneNumber, placeholder: 'Enter your phone number', keyboard: 'phone-pad' },
          ].map((field) => (
            <View key={field.label} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#555555"
                value={field.value}
                onChangeText={field.setter}
                keyboardType={field.keyboard as any}
                autoCapitalize="none"
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself"
              placeholderTextColor="#555555"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loadingProfile}>
            {loadingProfile ? <ActivityIndicator color="#000000" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
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
  content: { padding: 24, paddingTop: 0 },
  photoSection: { alignItems: 'center', marginBottom: 32 },
  photoContainer: { position: 'relative' },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 48, fontWeight: 'bold', color: '#000000' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#000000' },
  cameraIconText: { fontSize: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#888888', marginBottom: 8 },
  input: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, fontSize: 16, color: '#ffffff' },
  textArea: { minHeight: 100, paddingTop: 16 },
  saveButton: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#000000', fontSize: 16, fontWeight: '600' },
});