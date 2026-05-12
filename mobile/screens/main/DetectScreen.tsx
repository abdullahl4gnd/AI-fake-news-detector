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
import { newsAPI } from '../../services/api';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type InputMode = 'text' | 'url' | 'image';

export default function DetectScreen() {
  const [mode, setMode] = useState<InputMode>('text');
  const [articleText, setArticleText] = useState('');
  const [url, setUrl] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if (mode === 'text') {
      if (!articleText.trim()) {
        Alert.alert('Error', 'Please enter some text to analyze');
        return;
      }
      formData.append('article_text', articleText);
    } else if (mode === 'url') {
      if (!url.trim()) {
        Alert.alert('Error', 'Please enter a URL');
        return;
      }
      formData.append('url', url);
    } else if (mode === 'image') {
      if (!imageUri) {
        Alert.alert('Error', 'Please select an image');
        return;
      }
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    setLoading(true);
    try {
      const response = await newsAPI.createSubmission(formData);
      router.push(`/result/${response.data.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to analyze content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Fake News Detector</Text>
        <Text style={styles.subtitle}>Choose how you want to verify content</Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'text' && styles.modeButtonActive]}
          onPress={() => setMode('text')}
        >
          <Text style={[styles.modeText, mode === 'text' && styles.modeTextActive]}>
            Text
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'url' && styles.modeButtonActive]}
          onPress={() => setMode('url')}
        >
          <Text style={[styles.modeText, mode === 'url' && styles.modeTextActive]}>
            URL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'image' && styles.modeButtonActive]}
          onPress={() => setMode('image')}
        >
          <Text style={[styles.modeText, mode === 'image' && styles.modeTextActive]}>
            Image
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === 'text' && (
          <View>
            <Text style={styles.label}>Paste article text</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter the news article text here..."
              placeholderTextColor="#8b9dc3"
              multiline
              numberOfLines={10}
              value={articleText}
              onChangeText={setArticleText}
            />
          </View>
        )}

        {mode === 'url' && (
          <View>
            <Text style={styles.label}>Enter article URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/article"
              placeholderTextColor="#8b9dc3"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={styles.hint}>
              We'll automatically extract and analyze the article content
            </Text>
          </View>
        )}

        {mode === 'image' && (
          <View>
            <Text style={styles.label}>Upload or capture image</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
            {imageUri && (
              <View style={styles.imagePreview}>
                <Text style={styles.imagePreviewText}>Image selected ✓</Text>
              </View>
            )}
            <Text style={styles.hint}>
              We'll extract text from the image and analyze it
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Content</Text>
          )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b9dc3',
  },
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1a2942',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d4263',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modeText: {
    color: '#8b9dc3',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
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
  textArea: {
    backgroundColor: '#1a2942',
    borderWidth: 1,
    borderColor: '#2d4263',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#8b9dc3',
    marginBottom: 16,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#1a2942',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d4263',
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreview: {
    backgroundColor: '#10b98120',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreviewText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
