import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { newsAPI } from '../../services/api';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type InputMode = 'text' | 'url' | 'image';

const LOADING_MESSAGES = [
  '🔍 Scanning article...',
  '🤖 Running AI models...',
  '📊 Analyzing credibility...',
  '🧠 Detecting fake patterns...',
  '✅ Almost done...',
];

export default function DetectScreen() {
  const [mode, setMode] = useState<InputMode>('text');
  const [articleText, setArticleText] = useState('');
  const [url, setUrl] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const router = useRouter();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const messageIndex = useRef(0);
  const messageInterval = useRef<any>(null);

  useEffect(() => {
    if (loading) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Cycle through messages
      messageIndex.current = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      messageInterval.current = setInterval(() => {
        messageIndex.current = (messageIndex.current + 1) % LOADING_MESSAGES.length;

        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setLoadingMessage(LOADING_MESSAGES[messageIndex.current]);
          // Fade in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, 1500);
    } else {
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      if (messageInterval.current) {
        clearInterval(messageInterval.current);
      }
    }

    return () => {
      if (messageInterval.current) {
        clearInterval(messageInterval.current);
      }
    };
  }, [loading]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingCircleOuter,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingCircleInner,
              { transform: [{ rotate: spin }] },
            ]}
          >
            <Text style={styles.loadingIcon}>🤖</Text>
          </Animated.View>
        </Animated.View>

        <Text style={styles.loadingTitle}>Analyzing Content</Text>

        <Animated.Text style={[styles.loadingMessage, { opacity: fadeAnim }]}>
          {loadingMessage}
        </Animated.Text>

        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>

        <Text style={styles.loadingSubtext}>
          Our AI is working hard to verify this content for you
        </Text>
      </View>
    );
  }

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
          <Text style={styles.analyzeButtonText}>Analyze Content</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2563eb20',
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a2942',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb40',
  },
  loadingIcon: {
    fontSize: 48,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#2563eb',
    marginBottom: 24,
    fontWeight: '600',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.3 },
  loadingSubtext: {
    fontSize: 14,
    color: '#8b9dc3',
    textAlign: 'center',
    lineHeight: 22,
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