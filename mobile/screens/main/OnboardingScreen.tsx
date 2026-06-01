import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', emoji: '🤖', title: 'AI-Powered Detection', description: 'Our advanced AI models analyze news articles, URLs, and images to detect fake news with up to 98% accuracy.' },
  { id: '2', emoji: '🔍', title: 'Multiple Input Methods', description: 'Paste text, enter a URL, or upload an image. Our AI will extract and analyze the content automatically.' },
  { id: '3', emoji: '📊', title: 'Detailed Results', description: 'Get a credibility score, fake news indicators, suspicious words, and a full explanation of the analysis.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/login');
    }
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
        const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
        return (
          <Animated.View key={index} style={[styles.dot, { width: dotWidth, opacity }]} />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/login')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.appNameContainer}>
        <Text style={styles.appName}>AI Fake News Detector</Text>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(event) => {
          setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentIndex === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageIndicator}>{currentIndex + 1} / {SLIDES.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', alignItems: 'center' },
  skipButton: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { fontSize: 16, color: '#888888', fontWeight: '600' },
  appNameContainer: { marginTop: 80, marginBottom: 20 },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 },
  slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emojiContainer: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#111111', borderWidth: 2, borderColor: '#333333', justifyContent: 'center', alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 80 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: '#888888', textAlign: 'center', lineHeight: 26 },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#ffffff' },
  nextButton: { backgroundColor: '#ffffff', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30, marginBottom: 16 },
  nextButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  pageIndicator: { fontSize: 14, color: '#888888', marginBottom: 40 },
});